import Foundation
import HealthKit

// 워치에서 운동 세션을 돌리고 아이폰에 미러링한다. 갱신마다 WatchSnapshot을 보내고, 아이폰은
// 그걸로 측정 박스·Live Activity를 그린다. 1분 이상이면 끝날 때 건강 앱에 저장한다.
@MainActor
final class WatchWorkout: NSObject, ObservableObject, HKWorkoutSessionDelegate,
  HKLiveWorkoutBuilderDelegate
{
  static let shared = WatchWorkout()
  private static let heartRateType = HKQuantityType(.heartRate)
  private static let activeEnergy = HKQuantityType(.activeEnergyBurned)
  private static let basalEnergy = HKQuantityType(.basalEnergyBurned)
  private static let bpm = HKUnit.count().unitDivided(by: .minute())

  @Published private(set) var isRunning = false
  @Published private(set) var isPaused = false
  @Published private(set) var heartRate: Int?
  @Published private(set) var activeKcal = 0
  @Published private(set) var totalKcal = 0
  @Published private(set) var status = WatchWorkout.idleStatus

  private static let idleStatus = tr(
    "아이폰 포운에서 심박수 측정을 시작하세요", "Start heart rate from Pown on your iPhone")

  private let store = HKHealthStore()
  private var session: HKWorkoutSession?
  private var builder: HKLiveWorkoutBuilder?
  // 권한 창을 기다리는 사이 아이폰이 다시 요청해도(타임아웃 뒤 재시도) 세션을 하나만 만든다
  private var isStarting = false
  // 아이폰이 전체 초기화로 버리라고 했다 — 길이와 상관없이 건강 앱에 남기지 않는다
  private var discardOnClose = false
  // 아이폰에 값이 한 번이라도 닿았는지. 닿은 뒤의 끊김은 시스템이 didDisconnect로 알려준다
  private var delivered = false
  // 빌더 통계가 비었을 때(시뮬레이터 가짜 심박 포함) 최소·최대·평균에 쓰는, 직접 본 값
  private var seen: (min: Int, max: Int, sum: Int, count: Int)?
  #if targetEnvironment(simulator)
    // 시뮬레이터엔 심박 센서가 없다 — 2초마다 가짜 값을 만든다
    private var fakeTimer: Timer?
  #endif

  func start(_ configuration: HKWorkoutConfiguration) async {
    guard !isStarting else { return }
    isStarting = true
    defer { isStarting = false }
    // 아이폰이 하던 측정을 잃고(앱 종료 등) 다시 시작했다 — 하던 운동은 마무리하고 새로 연다.
    // 그대로 두면 아이폰은 새 세션을 영영 못 받는다
    if let session { close(session, at: .now) }
    do {
      let types: Set<HKSampleType> = [Self.heartRateType, Self.activeEnergy, Self.basalEnergy]
      try await store.requestAuthorization(toShare: types.union([.workoutType()]), read: types)
      let session = try HKWorkoutSession(healthStore: store, configuration: configuration)
      let builder = session.associatedWorkoutBuilder()
      builder.dataSource = HKLiveWorkoutDataSource(
        healthStore: store, workoutConfiguration: configuration)
      session.delegate = self
      builder.delegate = self
      self.session = session
      self.builder = builder
      try await session.startMirroringToCompanionDevice()
      let now = Date()
      session.startActivity(with: now)
      try await builder.beginCollection(at: now)
      isRunning = true
      delivered = false
      status = Self.idleStatus
      startFakeHeartRate()
      send()
      // 아이폰에 값이 한 번도 닿지 않은 채 startTimeout이 지나면 아이폰은 이미 시작을 포기했다 —
      // 미러링이 아예 안 붙은 것이니 워치 운동이 혼자 돌지 않게 끝낸다(일시정지 중이어도)
      Task {
        try? await Task.sleep(nanoseconds: UInt64(WatchSnapshot.startTimeout * 1e9))
        if !delivered, self.session === session { close(session, at: .now) }
      }
    } catch {
      session?.end()
      reset()
      status = tr("측정을 시작하지 못했어요", "Couldn't start measuring")
    }
  }

  func togglePause() {
    isPaused ? session?.resume() : session?.pause()
  }

  // 멈추기만 하면 상태 콜백(stopped)에서 저장·정리한다 — 아이폰 종료 버튼과 같은 길
  func end() {
    session?.stopActivity(with: .now)
  }

  func elapsed(at date: Date) -> TimeInterval {
    builder?.elapsedTime(at: date) ?? 0
  }

  // 아이폰이 멈췄든(stopped), 바로 끝냈든(ended), 연결이 끊겼든 같은 길로 마무리한다
  private func close(_ session: HKWorkoutSession, at date: Date) {
    guard session === self.session, let builder else { return }
    let discard = discardOnClose || builder.elapsedTime(at: date) < WatchSnapshot.minimumDuration
    reset()
    Task {
      try? await builder.endCollection(at: date)
      if discard {
        builder.discardWorkout()
      } else {
        _ = try? await builder.finishWorkout()
      }
      if session.state != .ended { session.end() }
    }
  }

  private func reset() {
    #if targetEnvironment(simulator)
      fakeTimer?.invalidate()
      fakeTimer = nil
    #endif
    session = nil
    builder = nil
    isRunning = false
    isPaused = false
    heartRate = nil
    activeKcal = 0
    totalKcal = 0
    discardOnClose = false
    seen = nil
  }

  private func startFakeHeartRate() {
    #if targetEnvironment(simulator)
      fakeTimer = Timer.scheduledTimer(withTimeInterval: 2, repeats: true) { _ in
        Task { @MainActor in
          guard !self.isPaused else { return }
          self.see(Int.random(in: 90...150))
          self.send()
        }
      }
    #endif
  }

  private func see(_ bpm: Int?) {
    heartRate = bpm
    guard let bpm else { return }
    seen = seen.map { (min($0.min, bpm), max($0.max, bpm), $0.sum + bpm, $0.count + 1) }
      ?? (bpm, bpm, bpm, 1)
  }

  // 빌더 통계를 화면 값으로 옮긴다. 시뮬레이터에선 심박만 가짜 타이머가 채운다
  private func readStatistics() {
    let kcal = HKUnit.kilocalorie()
    let active =
      builder?.statistics(for: Self.activeEnergy)?.sumQuantity()?.doubleValue(for: kcal) ?? 0
    let basal =
      builder?.statistics(for: Self.basalEnergy)?.sumQuantity()?.doubleValue(for: kcal) ?? 0
    activeKcal = Int(active.rounded())
    totalKcal = Int((active + basal).rounded())
    #if !targetEnvironment(simulator)
      let stat = builder?.statistics(for: Self.heartRateType)
      if let at = stat?.mostRecentQuantityDateInterval()?.end,
        Date().timeIntervalSince(at) < WatchSnapshot.heartRateFreshness,
        let quantity = stat?.mostRecentQuantity()
      {
        see(Int(quantity.doubleValue(for: Self.bpm).rounded()))
      } else {
        heartRate = nil
      }
    #endif
  }

  private func send() {
    guard let session, let builder else { return }
    let stat = builder.statistics(for: Self.heartRateType)
    let toBpm = { (quantity: HKQuantity?) -> Int? in
      quantity.map { Int($0.doubleValue(for: Self.bpm).rounded()) }
    }
    let minHR: Int? = toBpm(stat?.minimumQuantity()) ?? seen?.min
    let maxHR: Int? = toBpm(stat?.maximumQuantity()) ?? seen?.max
    let seenAverage: Int? = seen.map { $0.sum / $0.count }
    let avgHR: Int? = toBpm(stat?.averageQuantity()) ?? seenAverage
    let snapshot = WatchSnapshot(
      paused: isPaused,
      heartRate: heartRate,
      minHR: minHR,
      maxHR: maxHR,
      avgHR: avgHR,
      activeKcal: activeKcal,
      totalKcal: totalKcal,
      elapsedSec: Int(builder.elapsedTime),
      startedAt: (builder.startDate ?? Date()).timeIntervalSince1970 * 1000
    )
    guard let data = try? JSONEncoder().encode(snapshot) else { return }
    Task {
      if (try? await session.sendToRemoteWorkoutSession(data: data)) != nil { delivered = true }
    }
  }

  // MARK: - 델리게이트 (임의 큐에서 불린다)

  nonisolated func workoutSession(
    _ workoutSession: HKWorkoutSession,
    didChangeTo toState: HKWorkoutSessionState,
    from fromState: HKWorkoutSessionState,
    date: Date
  ) {
    Task { @MainActor in
      guard workoutSession === self.session else { return }
      if toState == .stopped || toState == .ended {
        self.close(workoutSession, at: date)
        return
      }
      self.isPaused = toState == .paused
      self.send()
    }
  }

  nonisolated func workoutSession(_ workoutSession: HKWorkoutSession, didFailWithError error: Error)
  {
    Task { @MainActor in self.close(workoutSession, at: .now) }
  }

  // 아이폰과 연결이 끊기면 같이 끝낸다 — 아이폰도 끊김을 종료로 보고 기록을 남긴다.
  // 워치 혼자 돌게 두면 배터리만 닳고, 아이폰에서 다시 시작해도 이 세션엔 붙지 않는다.
  // ponytail: 잠깐 끊겼다 다시 붙는 경우까지 이어 가려면 재미러링이 필요하다 — 실기에서
  // 끊김이 잦으면 그때 추가
  nonisolated func workoutSession(
    _ workoutSession: HKWorkoutSession, didDisconnectFromRemoteDeviceWithError error: Error?
  ) {
    Task { @MainActor in self.close(workoutSession, at: .now) }
  }

  nonisolated func workoutSession(
    _ workoutSession: HKWorkoutSession, didReceiveDataFromRemoteWorkoutSession data: [Data]
  ) {
    let discard = data.contains(where: { item in
      (try? JSONDecoder().decode(WatchCommand.self, from: item))?.discard == true
    })
    guard discard else { return }
    Task { @MainActor in
      guard workoutSession === self.session else { return }
      self.discardOnClose = true
    }
  }

  nonisolated func workoutBuilder(
    _ workoutBuilder: HKLiveWorkoutBuilder, didCollectDataOf collectedTypes: Set<HKSampleType>
  ) {
    Task { @MainActor in
      guard workoutBuilder === self.builder else { return }
      self.readStatistics()
      self.send()
    }
  }

  nonisolated func workoutBuilderDidCollectEvent(_ workoutBuilder: HKLiveWorkoutBuilder) {}
}

// 워치 앱은 문구가 몇 개뿐이라 문자열 카탈로그 대신 시스템 언어로 고른다.
// 앱 문구(lib/i18n.ts의 heartRate.*)와 같은 말을 쓴다
func tr(_ ko: String, _ en: String) -> String {
  Locale.preferredLanguages.first?.hasPrefix("ko") == true ? ko : en
}
