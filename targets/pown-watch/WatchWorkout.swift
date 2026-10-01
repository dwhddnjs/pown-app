import Foundation
import HealthKit

// 워치에서 운동 세션을 돌리고 아이폰에 미러링한다. 갱신마다 아이폰 HeartRateModule의
// snapshot()과 같은 키로 보내 아이폰은 받은 그대로 JS에 넘긴다.
// ponytail: 스파이크 — 건강 앱 저장 없이 버린다. 저장·일시정지 UI는 실기 검증 뒤에
@MainActor
final class WatchWorkout: NSObject, ObservableObject, HKWorkoutSessionDelegate,
  HKLiveWorkoutBuilderDelegate
{
  static let shared = WatchWorkout()
  private static let heartRateType = HKQuantityType(.heartRate)
  private static let activeEnergy = HKQuantityType(.activeEnergyBurned)
  private static let basalEnergy = HKQuantityType(.basalEnergyBurned)
  private static let bpm = HKUnit.count().unitDivided(by: .minute())
  // 아이폰과 같은 기준 — 이보다 오래된 심박은 "지금" 값으로 보내지 않는다
  private static let heartRateFreshness: TimeInterval = 30

  @Published private(set) var heartRate: Int?
  @Published private(set) var isRunning = false
  @Published private(set) var status = "아이폰 포운에서 심박수 측정을 시작하세요"

  private let store = HKHealthStore()
  private var session: HKWorkoutSession?
  private var builder: HKLiveWorkoutBuilder?
  #if targetEnvironment(simulator)
    // 시뮬레이터엔 심박 센서가 없다 — 2초마다 가짜 값을 만든다
    private var fakeTimer: Timer?
  #endif

  func start(_ configuration: HKWorkoutConfiguration) async {
    guard session == nil else { return }
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
      startFakeHeartRate()
      send()
    } catch {
      session?.end()
      reset()
      status = "시작 실패: \(error.localizedDescription)"
    }
  }

  private func reset() {
    #if targetEnvironment(simulator)
      fakeTimer?.invalidate()
      fakeTimer = nil
    #endif
    session = nil
    builder = nil
    heartRate = nil
    isRunning = false
  }

  private func startFakeHeartRate() {
    #if targetEnvironment(simulator)
      fakeTimer = Timer.scheduledTimer(withTimeInterval: 2, repeats: true) { _ in
        Task { @MainActor in
          self.heartRate = Int.random(in: 90...150)
          self.send()
        }
      }
    #endif
  }

  private func readHeartRate() {
    #if !targetEnvironment(simulator)
      guard let stat = builder?.statistics(for: Self.heartRateType),
        let at = stat.mostRecentQuantityDateInterval()?.end,
        Date().timeIntervalSince(at) < Self.heartRateFreshness,
        let quantity = stat.mostRecentQuantity()
      else {
        heartRate = nil
        return
      }
      heartRate = Int(quantity.doubleValue(for: Self.bpm).rounded())
    #endif
  }

  private func send() {
    guard let session, let builder else { return }
    let kcal = HKUnit.kilocalorie()
    let active =
      builder.statistics(for: Self.activeEnergy)?.sumQuantity()?.doubleValue(for: kcal) ?? 0
    let basal =
      builder.statistics(for: Self.basalEnergy)?.sumQuantity()?.doubleValue(for: kcal) ?? 0
    var body: [String: Any] = [
      "state": session.state == .paused ? "paused" : "running",
      "activeKcal": Int(active.rounded()),
      "totalKcal": Int((active + basal).rounded()),
      "elapsedSec": Int(builder.elapsedTime),
      "startedAt": (builder.startDate ?? Date()).timeIntervalSince1970 * 1000,
    ]
    if let heartRate { body["heartRate"] = heartRate }
    guard let data = try? JSONSerialization.data(withJSONObject: body) else { return }
    Task { try? await session.sendToRemoteWorkoutSession(data: data) }
  }

  // 아이폰이 미러 세션을 끝내면 여기로도 상태가 온다 — 저장 없이 버리고 닫는다
  private func close(_ session: HKWorkoutSession, at date: Date) {
    guard let builder, session === self.session else { return }
    reset()
    Task {
      try? await builder.endCollection(at: date)
      builder.discardWorkout()
      if session.state != .ended { session.end() }
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
      if toState == .stopped || toState == .ended {
        self.close(workoutSession, at: date)
      } else {
        self.send()
      }
    }
  }

  nonisolated func workoutSession(_ workoutSession: HKWorkoutSession, didFailWithError error: Error)
  {
    Task { @MainActor in
      self.close(workoutSession, at: .now)
      self.status = "세션 오류: \(error.localizedDescription)"
    }
  }

  nonisolated func workoutBuilder(
    _ workoutBuilder: HKLiveWorkoutBuilder, didCollectDataOf collectedTypes: Set<HKSampleType>
  ) {
    Task { @MainActor in
      self.readHeartRate()
      self.send()
    }
  }

  nonisolated func workoutBuilderDidCollectEvent(_ workoutBuilder: HKLiveWorkoutBuilder) {}
}
