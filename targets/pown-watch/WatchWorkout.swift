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
  // 곧 보낼 예정인지 — 거의 동시에 오는 수집 콜백을 한 번의 전송으로 묶는다
  private var sendPending = false
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

  // 운동 중 앱이 죽었다 다시 뜨면 시스템이 부른다(handleActiveWorkoutRecovery) — 세션을 되찾아
  // 이어서 재고 아이폰에 다시 보낸다. 안 되찾으면 아이폰엔 시간만 흐르는 빈 측정이 남는다
  func recover() async {
    guard let recovered = (try? await store.recoverActiveWorkoutSession()) ?? nil,
      // 되찾는 사이 아이폰이 새로 시작시켰으면 그쪽이 지금 측정이다
      session == nil, !isStarting
    else { return }
    let builder = recovered.associatedWorkoutBuilder()
    // 세션과 빌더는 돌아오지만 데이터 소스는 새로 붙여야 한다
    builder.dataSource = HKLiveWorkoutDataSource(
      healthStore: store, workoutConfiguration: recovered.workoutConfiguration)
    recovered.delegate = self
    builder.delegate = self
    session = recovered
    self.builder = builder
    // 멈췄거나 끝나던 중에 죽었으면 마저 마무리한다
    guard recovered.state == .running || recovered.state == .paused else {
      close(recovered, at: .now)
      return
    }
    isRunning = true
    isPaused = recovered.state == .paused
    status = Self.idleStatus
    // 미러링이 끊겼으면 다시 붙인다 — 아직 붙어 있으면 실패하고 그대로 간다
    try? await recovered.startMirroringToCompanionDevice()
    guard recovered === session else { return }
    readStatistics()
    startFakeHeartRate()
    send()
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

  // 아이폰이 멈췄든(stopped), 바로 끝냈든(ended), 연결이 끊겼든 같은 길로 마무리한다.
  // report: 멈춘 시각의 값을 마지막으로 보낸다 — 아이폰도 이 경과 시간으로 1분 기준을 재서, 건강 앱
  // 저장과 앱 기록이 같이 남거나 같이 빠진다. 멈췄을 때(워치·아이폰 종료 버튼)만 보낸다 — 끊겼거나
  // 이미 끝난 세션엔 닿지 않는다
  private func close(_ session: HKWorkoutSession, at date: Date, report: Bool = false) {
    guard session === self.session, let builder else { return }
    let discard = discardOnClose || builder.elapsedTime(at: date) < WatchSnapshot.minimumDuration
    let final = report && !discardOnClose ? snapshotData(at: date) : nil
    reset()
    Task {
      // 못 보내도 저장은 그대로 한다
      if let final { _ = try? await session.sendToRemoteWorkoutSession(data: final) }
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
    guard let session, let data = snapshotData(at: Date()) else { return }
    Task {
      if (try? await session.sendToRemoteWorkoutSession(data: data)) != nil, session === self.session {
        delivered = true
      }
    }
  }

  // 수집 콜백은 심박·활동·기초 칼로리가 따로, 거의 동시에 온다 — 잠깐 모아 한 번만 보낸다.
  // 보낼 때마다 아이폰이 JS·Live Activity까지 갱신한다
  private func sendSoon() {
    guard !sendPending else { return }
    sendPending = true
    Task {
      try? await Task.sleep(nanoseconds: 300_000_000)
      sendPending = false
      send()
    }
  }

  // date 시각의 측정값 — 같은 시각으로 재야 timerStart가 측정 내내 똑같이 나온다
  private func snapshotData(at date: Date) -> Data? {
    guard let builder else { return nil }
    let stat = builder.statistics(for: Self.heartRateType)
    let toBpm = { (quantity: HKQuantity?) -> Int? in
      quantity.map { Int($0.doubleValue(for: Self.bpm).rounded()) }
    }
    let minHR: Int? = toBpm(stat?.minimumQuantity()) ?? seen?.min
    let maxHR: Int? = toBpm(stat?.maximumQuantity()) ?? seen?.max
    let seenAverage: Int? = seen.map { $0.sum / $0.count }
    let avgHR: Int? = toBpm(stat?.averageQuantity()) ?? seenAverage
    let elapsed = builder.elapsedTime(at: date)
    let snapshot = WatchSnapshot(
      paused: isPaused,
      heartRate: heartRate,
      minHR: minHR,
      maxHR: maxHR,
      avgHR: avgHR,
      activeKcal: activeKcal,
      totalKcal: totalKcal,
      elapsedSec: Int(elapsed),
      timerStart: ((date.timeIntervalSince1970 - elapsed) * 1000).rounded(),
      startedAt: (builder.startDate ?? date).timeIntervalSince1970 * 1000
    )
    return try? JSONEncoder().encode(snapshot)
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
        self.close(workoutSession, at: date, report: toState == .stopped)
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
      // 아이폰은 이걸 보내고 멈추지 않은 채 기다린다 — 표시한 다음 여기서 멈춰야 저장 없이 끝난다.
      // 아이폰이 같이 멈추면 멈춤이 먼저 처리돼 이 표시를 놓칠 수 있다
      self.discardOnClose = true
      workoutSession.stopActivity(with: .now)
    }
  }

  nonisolated func workoutBuilder(
    _ workoutBuilder: HKLiveWorkoutBuilder, didCollectDataOf collectedTypes: Set<HKSampleType>
  ) {
    Task { @MainActor in
      guard workoutBuilder === self.builder else { return }
      self.readStatistics()
      self.sendSoon()
    }
  }

  nonisolated func workoutBuilderDidCollectEvent(_ workoutBuilder: HKLiveWorkoutBuilder) {}
}

// 워치 앱은 문구가 몇 개뿐이라 문자열 카탈로그 대신 시스템 언어로 고른다.
// 앱 문구(lib/i18n.ts의 heartRate.*)와 같은 말을 쓴다
func tr(_ ko: String, _ en: String) -> String {
  Locale.preferredLanguages.first?.hasPrefix("ko") == true ? ko : en
}
