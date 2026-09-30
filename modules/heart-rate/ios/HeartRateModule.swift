import ActivityKit
import AVFoundation
import ExpoModulesCore
import HealthKit
import UIKit

// iPhone 운동 세션(iOS 26+)으로 에어팟 프로 3 같은 웨어러블의 심박·칼로리를 받아
// JS와 Live Activity(다이나믹 아일랜드·잠금화면)에 흘려보낸다.
// Live Activity 갱신은 여기서 직접 한다 — 백그라운드에서 JS를 거치지 않는다.
public class HeartRateModule: Module {
  // iOS 26 전용 타입이라 저장 프로퍼티 타입으로 바로 못 쓴다
  private var manager: AnyObject?
  private var routeObserver: NSObjectProtocol?
  private var controlObserver: NSObjectProtocol?
  // 아일랜드 종료 버튼이 앱을 백그라운드로 깨운 직후엔 JS가 아직 onUpdate를 안 듣고 있어
  // 이벤트가 버려진다 — 저장할 요약이 붙은 ended만 들고 있다가 구독이 붙으면 넘긴다.
  // 둘 다 메인 스레드에서만 만진다
  private var isObservingUpdate = false
  private var pendingEnded: [String: Any]?

  public func definition() -> ModuleDefinition {
    Name("HeartRate")

    Events("onUpdate", "onDeviceChange")

    // 아일랜드·잠금화면 버튼(targets/heart-rate-widget/_shared/HeartRateControlIntent.swift)이
    // 앱 프로세스에서 이 알림을 보낸다 — 위젯은 이 모듈을 링크하지 않아 직접 부를 수 없다.
    // 알림 이름은 그 파일과 같아야 한다
    OnCreate {
      self.controlObserver = NotificationCenter.default.addObserver(
        forName: Notification.Name("HeartRateControl"),
        object: nil,
        queue: .main
      ) { [weak self] notification in
        guard let action = notification.userInfo?["action"] as? String else { return }
        self?.control(action)
      }
    }

    OnDestroy {
      if let observer = self.controlObserver {
        NotificationCenter.default.removeObserver(observer)
      }
    }

    // 에어팟을 귀에 꽂거나 빼면 오디오 출력이 바뀐다 — 버튼 노출을 그때그때 갱신한다
    OnStartObserving("onDeviceChange") {
      guard self.routeObserver == nil else { return }
      self.routeObserver = NotificationCenter.default.addObserver(
        forName: AVAudioSession.routeChangeNotification,
        object: nil,
        queue: .main
      ) { [weak self] notification in
        let available = HeartRateModule.hasHeartRateDevice()
        // "뺐다"는 기기가 사라진 경우(oldDeviceUnavailable)만이다. 숏츠 촬영처럼 마이크가
        // 오디오 세션을 바꿔 출력이 스피커로 옮겨가는 것(categoryChange 등)까지 뺀 걸로
        // 보면, 멀쩡히 끼고 있는데 측정이 멈춘다
        let reason = (notification.userInfo?[AVAudioSessionRouteChangeReasonKey] as? UInt)
          .flatMap(AVAudioSession.RouteChangeReason.init(rawValue:))
        self?.sendEvent(
          "onDeviceChange",
          ["available": available, "removed": !available && reason == .oldDeviceUnavailable])
      }
    }

    OnStopObserving("onDeviceChange") {
      if let observer = self.routeObserver {
        NotificationCenter.default.removeObserver(observer)
      }
      self.routeObserver = nil
    }

    // 모듈 큐에서 불린다 — 메인으로 옮겨 sendUpdate와 순서를 맞춘다
    OnStartObserving("onUpdate") {
      DispatchQueue.main.async {
        self.isObservingUpdate = true
        guard let body = self.pendingEnded else { return }
        self.pendingEnded = nil
        self.sendEvent("onUpdate", body)
      }
    }

    OnStopObserving("onUpdate") {
      DispatchQueue.main.async { self.isObservingUpdate = false }
    }

    Function("isSupported") { () -> Bool in
      guard #available(iOS 26.0, *) else { return false }
      return HKHealthStore.isHealthDataAvailable()
    }

    Function("hasHeartRateDevice") { () -> Bool in
      HeartRateModule.hasHeartRateDevice()
    }

    AsyncFunction("requestAuthorization") { () async throws -> Bool in
      guard #available(iOS 26.0, *) else { return false }
      return try await self.workout().requestAuthorization()
    }

    AsyncFunction("start") { () async throws -> [String: Any]? in
      guard #available(iOS 26.0, *) else { return nil }
      return try await self.workout().start()
    }

    AsyncFunction("pause") { () async in
      guard #available(iOS 26.0, *) else { return }
      await self.workout().pause()
    }

    AsyncFunction("resume") { () async in
      guard #available(iOS 26.0, *) else { return }
      await self.workout().resume()
    }

    AsyncFunction("end") { () async throws -> [String: Any]? in
      guard #available(iOS 26.0, *) else { return nil }
      return try await self.workout().end()
    }

    AsyncFunction("discard") { () async throws in
      guard #available(iOS 26.0, *) else { return }
      _ = try await self.workout().end(discard: true)
    }

    AsyncFunction("getActive") { () async -> [String: Any]? in
      guard #available(iOS 26.0, *) else { return nil }
      return await self.workout().recover()
    }

    AsyncFunction("deleteWorkout") { (startedAt: Double) async -> Bool in
      guard #available(iOS 26.0, *) else { return false }
      return await self.workout().deleteWorkout(
        startedAt: Date(timeIntervalSince1970: startedAt / 1000))
    }
  }

  private func control(_ action: String) {
    guard #available(iOS 26.0, *) else { return }
    Task { @MainActor in
      let manager = self.workout()
      // 버튼 때문에 앱이 막 깨어났으면 세션이 아직 안 붙어 있다
      _ = await manager.recover()
      switch action {
      case "pause": manager.pause()
      case "resume": manager.resume()
      case "end":
        // 앱이 뒤에 있을 때 끝난 것이라 종료 버튼 쪽 저장이 없다 — 시스템 종료와 같은 이벤트로
        // 요약을 넘겨 JS가 기록을 남긴다
        var body: [String: Any] = ["state": "ended"]
        if let summary = try? await manager.end() { body["summary"] = summary }
        self.sendUpdate(body)
      default: break
      }
    }
  }

  private func sendUpdate(_ body: [String: Any]) {
    guard isObservingUpdate else {
      if body["summary"] != nil { pendingEnded = body }
      return
    }
    sendEvent("onUpdate", body)
  }

  @available(iOS 26.0, *)
  @MainActor
  private func workout() -> WorkoutManager {
    if let manager = manager as? WorkoutManager { return manager }
    let manager = WorkoutManager { [weak self] body in
      self?.sendUpdate(body)
    }
    self.manager = manager
    return manager
  }

  // ponytail: 블루투스 이어폰이 소리를 받고 있으면 "심박 기기일 수 있음"으로 본다.
  // 에어팟 모델을 알려주는 공개 API가 없고, 기기 이름은 사용자가 바꾼다(실제로
  // "AirPods Pro"가 빠진 이름 때문에 버튼이 안 떴다). 센서 없는 이어폰도 통과하지만
  // 측정 박스가 "신호 없음"으로 안내한다. 더 좁혀야 하면 HealthKit 심박 샘플의
  // HKDevice 이력(권한 필요)으로 거를 것.
  static func hasHeartRateDevice() -> Bool {
    let bluetooth: [AVAudioSession.Port] = [.bluetoothA2DP, .bluetoothHFP, .bluetoothLE]
    return AVAudioSession.sharedInstance().currentRoute.outputs.contains {
      bluetooth.contains($0.portType)
    }
  }
}

@available(iOS 26.0, *)
@MainActor
final class WorkoutManager: NSObject, HKWorkoutSessionDelegate, HKLiveWorkoutBuilderDelegate {
  private static let heartRate = HKQuantityType(.heartRate)
  private static let activeEnergy = HKQuantityType(.activeEnergyBurned)
  private static let basalEnergy = HKQuantityType(.basalEnergyBurned)
  private static let bpm = HKUnit.count().unitDivided(by: .minute())
  // 이보다 오래된 심박은 "지금" 값으로 보여주지 않는다 (에어팟을 뺀 뒤 멈춘 숫자 방지)
  private static let heartRateFreshness: TimeInterval = 30
  // 1분이 안 되는 세션은 실수로 누른 것으로 보고 건강 앱에도, 기록에도 남기지 않는다
  private static let minimumDuration: TimeInterval = 60

  private let store = HKHealthStore()
  private let emit: ([String: Any]) -> Void
  private var session: HKWorkoutSession?
  private var builder: HKLiveWorkoutBuilder?
  private var activity: Activity<HeartRateAttributes>?
  private var lastPushed: (state: HeartRateAttributes.ContentState, at: Date)?
  private var stopped: CheckedContinuation<Void, Never>?
  private var isEnding = false
  // 빌더 통계에 최소·최대가 비어 올 때를 대비해 직접 본 값도 들고 있는다
  private var seenMin: Int?
  private var seenMax: Int?
  // 기록 화면 그래프용 심박 [시작 후 초, bpm]. JS는 백그라운드에서 샘플을 못 받아 여기서 모은다.
  // 종료 때 건강 앱에서 읽은 심박(storedSamples)이 없을 때만 쓰는 대체값이다
  private var samples: [[Int]] = []
  private var lastSampleAt: Date?

  init(emit: @escaping ([String: Any]) -> Void) {
    self.emit = emit
  }

  func requestAuthorization() async throws -> Bool {
    let share: Set<HKSampleType> = [
      HKQuantityType.workoutType(), Self.heartRate, Self.activeEnergy, Self.basalEnergy,
    ]
    let read: Set<HKObjectType> = [Self.heartRate, Self.activeEnergy, Self.basalEnergy]
    try await store.requestAuthorization(toShare: share, read: read)
    // 읽기 거부는 HealthKit이 알려주지 않는다 — 운동 저장(쓰기)만 판별할 수 있다
    return store.authorizationStatus(for: .workoutType()) == .sharingAuthorized
  }

  // 시작이 끝난 시점의 첫 스냅샷을 돌려준다 — JS가 이벤트 도착을 기다리지 않고 바로
  // 박스를 "측정 중"으로 바꾼다(준비 표시가 한 프레임 버튼으로 되돌아가지 않게)
  func start() async throws -> [String: Any]? {
    guard session == nil else { return nil }
    let configuration = HKWorkoutConfiguration()
    configuration.activityType = .traditionalStrengthTraining
    configuration.locationType = .indoor

    let session = try HKWorkoutSession(healthStore: store, configuration: configuration)
    let builder = session.associatedWorkoutBuilder()
    builder.dataSource = HKLiveWorkoutDataSource(
      healthStore: store, workoutConfiguration: configuration)
    session.delegate = self
    builder.delegate = self
    self.session = session
    self.builder = builder

    do {
      session.prepare()
      // 애플 권장: prepare 뒤 3초 — 에어팟 심박 센서가 붙을 시간을 준다
      try await Task.sleep(nanoseconds: 3_000_000_000)
      // 기다리는 사이 시스템이 세션을 닫았으면(정리 중이어도) 그쪽이 마무리한다 — 끝난
      // 세션에 시작을 걸면 아무도 끝내지 않는 Live Activity가 남는다
      guard self.session === session, !isEnding else { throw CancellationError() }
      let now = Date()
      session.startActivity(with: now)
      try await builder.beginCollection(at: now)
      guard self.session === session, !isEnding else { throw CancellationError() }
    } catch {
      if self.session === session, !isEnding {
        session.end()
        reset()
      }
      throw error
    }
    startLiveActivity()
    publish()
    return snapshot()
  }

  func pause() {
    session?.pause()
  }

  func resume() {
    session?.resume()
  }

  // nil은 1분 미만(버림)뿐이다. 이미 끝나는 중이거나 세션이 없으면 던진다 — 그 경우 저장은
  // 먼저 끝내던 쪽이 하므로, JS가 "1분 미만" 안내를 잘못 띄우지 않게 구분한다
  // discard: 길이와 상관없이 건강 앱에도 남기지 않고 버린다(전체 초기화)
  func end(discard: Bool = false) async throws -> [String: Any]? {
    // 두 번 불려도 한 번만 마무리한다 — 두 번째가 stopped를 덮어쓰면 첫 호출이 영영 안 끝난다
    guard !isEnding, let session, let builder else { throw CancellationError() }
    isEnding = true
    defer { reset() }

    if session.state == .running || session.state == .paused {
      await withCheckedContinuation { continuation in
        stopped = continuation
        session.stopActivity(with: .now)
      }
    }
    return await finish(session, builder, discard: discard)
  }

  // 우리가 끝내든 시스템이 끝내든 같은 길로 마무리한다. 1분 미만이면 버리고 nil
  private func finish(
    _ session: HKWorkoutSession, _ builder: HKLiveWorkoutBuilder, discard: Bool = false
  ) async -> [String: Any]? {
    try? await builder.endCollection(at: .now)
    var summary = snapshot()

    if discard || builder.elapsedTime < Self.minimumDuration {
      builder.discardWorkout()
      session.end()
      return nil
    }
    // 건강 앱 저장이 실패해도(쓰기 권한 해제 등) 앱 기록은 남긴다
    let workout = try? await builder.finishWorkout()
    session.end()
    let stored = await storedSamples(of: workout)
    let all = stored.isEmpty ? samples : stored
    if !all.isEmpty { summary?["samples"] = all }
    return summary
  }

  // 건강 앱에 저장된 이 운동의 심박 전부 [시작 후 초, bpm]. 측정 중 콜백은 샘플이 여러 개 묶여
  // 와도 최근 값 하나만 보여 사이 값이 빠지고, 앱이 죽었다 복구되면 그 전 구간이 없다. 시리즈
  // 샘플도 값 하나하나 읽는다. 읽기 권한이 없거나(빈 결과) 잠금 상태라 못 읽으면 빈 배열
  private func storedSamples(of workout: HKWorkout?) async -> [[Int]] {
    guard let workout else { return [] }
    let query = HKQuantitySeriesSampleQueryDescriptor(
      predicate: .quantitySample(
        type: Self.heartRate, predicate: HKQuery.predicateForObjects(from: workout)))
    var found: [[Int]] = []
    do {
      for try await result in query.results(for: store) {
        found.append([
          max(0, Int(result.dateInterval.start.timeIntervalSince(workout.startDate))),
          Int(result.quantity.doubleValue(for: Self.bpm).rounded()),
        ])
      }
    } catch {
      // 중간에 실패한 결과는 반쪽이라 통째로 버리고 측정 중 모은 것을 쓴다
      return []
    }
    return found
  }

  // 다른 운동 앱이 세션을 가져가는 등 우리가 끝내지 않았는데 닫힌 경우. 버리면 몇십 분
  // 기록이 조용히 사라진다 — 종료와 같은 길로 저장하고 요약을 JS에 넘긴다(JS가 기록을 남긴다)
  private func closeBySystem(_ session: HKWorkoutSession) {
    guard let builder else { return }
    isEnding = true
    Task {
      let summary = await finish(session, builder)
      reset()
      var body: [String: Any] = ["state": "ended"]
      if let summary { body["summary"] = summary }
      emit(body)
    }
  }

  // 기록 삭제 — 이 앱이 저장한 운동을 시작 시각(앱 기록은 초 단위로 잘려 있다)으로 찾아
  // 딸린 샘플까지 지운다. 읽기 권한이 없어도 자기 앱이 쓴 데이터는 조회된다.
  // 준비에 3초가 걸려 1초 창 안에 운동이 둘 있을 수 없다
  func deleteWorkout(startedAt: Date) async -> Bool {
    let predicate = NSCompoundPredicate(andPredicateWithSubpredicates: [
      HKQuery.predicateForObjects(from: .default()),
      HKQuery.predicateForSamples(
        withStart: startedAt, end: startedAt.addingTimeInterval(1), options: .strictStartDate),
    ])
    let query = HKSampleQueryDescriptor(predicates: [.workout(predicate)], sortDescriptors: [])
    guard let workouts = try? await query.result(for: store), !workouts.isEmpty else {
      return false
    }
    for workout in workouts {
      let attached = HKQuery.predicateForObjects(from: workout)
      for type in [Self.heartRate, Self.activeEnergy, Self.basalEnergy] {
        _ = try? await store.deleteObjects(of: type, predicate: attached)
      }
    }
    return (try? await store.delete(workouts)) != nil
  }

  func recover() async -> [String: Any]? {
    // 준비 중(prepared)엔 아직 측정 전이다 — 스냅샷을 주면 JS가 "측정 중"으로 그린다
    if session != nil {
      // 준비 3초 사이 앱이 뒤로 가면 Live Activity 요청이 거절된다(앞에 있을 때만 된다) —
      // 돌아왔을 때 다시 띄운다. 안 그러면 이 세션 내내 아일랜드·잠금화면이 없다
      if isLive, !isEnding, activity == nil {
        startLiveActivity()
        publish()
      }
      return isLive ? snapshot() : nil
    }
    guard let recovered = (try? await store.recoverActiveWorkoutSession()) ?? nil else {
      // 앱이 죽은 사이 세션이 끝났으면 아일랜드에 멈춘 숫자만 남아 있다
      for activity in Activity<HeartRateAttributes>.activities {
        Task { await activity.end(nil, dismissalPolicy: .immediate) }
      }
      return nil
    }
    let builder = recovered.associatedWorkoutBuilder()
    // 세션과 빌더는 복구되지만 데이터 소스는 새로 붙여야 한다 (WWDC25 #322)
    builder.dataSource = HKLiveWorkoutDataSource(
      healthStore: store, workoutConfiguration: recovered.workoutConfiguration)
    recovered.delegate = self
    builder.delegate = self
    session = recovered
    self.builder = builder
    activity = Activity<HeartRateAttributes>.activities.first
    // 멈췄거나(stopped) 이미 끝난 세션이 돌아올 때가 있다 — 그대로 붙이면 "측정 중 0:03"
    // 박스와 아무도 갱신하지 않는 Live Activity가 생긴다. 종료와 같은 길로 정리한다
    guard isLive else {
      closeBySystem(recovered)
      return nil
    }
    if activity == nil { startLiveActivity() }
    publish()
    return snapshot()
  }

  // MARK: - HKWorkoutSessionDelegate / HKLiveWorkoutBuilderDelegate (임의 큐에서 불린다)

  nonisolated func workoutSession(
    _ workoutSession: HKWorkoutSession,
    didChangeTo toState: HKWorkoutSessionState,
    from fromState: HKWorkoutSessionState,
    date: Date
  ) {
    Task { @MainActor in
      guard workoutSession === self.session else { return }
      // 종료를 기다리는 중 시스템이 stopped를 건너뛰고 바로 끝내도 풀어준다 — 안 풀면 end()가
      // 영영 안 끝나 앱을 다시 켜기 전까지 측정을 시작할 수 없다
      if toState == .stopped || toState == .ended {
        self.stopped?.resume()
        self.stopped = nil
      }
      if toState == .ended && !self.isEnding {
        self.closeBySystem(workoutSession)
        return
      }
      self.publish()
    }
  }

  nonisolated func workoutSession(_ workoutSession: HKWorkoutSession, didFailWithError error: Error) {
    Task { @MainActor in
      guard workoutSession === self.session else { return }
      self.stopped?.resume()
      self.stopped = nil
      guard !self.isEnding else { return }
      self.closeBySystem(workoutSession)
    }
  }

  nonisolated func workoutBuilder(
    _ workoutBuilder: HKLiveWorkoutBuilder, didCollectDataOf collectedTypes: Set<HKSampleType>
  ) {
    Task { @MainActor in
      self.recordSample()
      self.publish()
    }
  }

  nonisolated func workoutBuilderDidCollectEvent(_ workoutBuilder: HKLiveWorkoutBuilder) {
    Task { @MainActor in self.publish() }
  }

  // MARK: - 상태

  // 준비(prepared) 중이면 아직, 멈춤(stopped) 뒤면 이미 "측정 중"이 아니다
  private var isLive: Bool { session?.state == .running || session?.state == .paused }

  private func reset() {
    endLiveActivity()
    session = nil
    builder = nil
    stopped = nil
    isEnding = false
    seenMin = nil
    seenMax = nil
    samples = []
    lastSampleAt = nil
  }

  // 새 심박이 들어왔을 때만 쌓는다 — 칼로리만 갱신된 콜백에도 불린다
  private func recordSample() {
    guard let builder, let start = builder.startDate,
      let heart = builder.statistics(for: Self.heartRate),
      let at = heart.mostRecentQuantityDateInterval()?.end, at != lastSampleAt,
      let quantity = heart.mostRecentQuantity()
    else { return }
    lastSampleAt = at
    samples.append([
      Int(at.timeIntervalSince(start)), Int(quantity.doubleValue(for: Self.bpm).rounded()),
    ])
  }

  private func snapshot() -> [String: Any]? {
    guard let session, let builder else { return nil }
    let kcal = HKUnit.kilocalorie()
    let active =
      builder.statistics(for: Self.activeEnergy)?.sumQuantity()?.doubleValue(for: kcal) ?? 0
    let basal =
      builder.statistics(for: Self.basalEnergy)?.sumQuantity()?.doubleValue(for: kcal) ?? 0
    let heart = builder.statistics(for: Self.heartRate)
    let toBpm = { (quantity: HKQuantity?) in
      quantity.map { Int($0.doubleValue(for: Self.bpm).rounded()) }
    }

    if let latest = toBpm(heart?.mostRecentQuantity()) {
      seenMin = min(seenMin ?? latest, latest)
      seenMax = max(seenMax ?? latest, latest)
    }

    var body: [String: Any] = [
      "state": session.state == .paused ? "paused" : "running",
      "activeKcal": Int(active.rounded()),
      "totalKcal": Int((active + basal).rounded()),
      "elapsedSec": Int(builder.elapsedTime),
      "startedAt": (builder.startDate ?? Date()).timeIntervalSince1970 * 1000,
    ]
    if let at = heart?.mostRecentQuantityDateInterval()?.end,
      Date().timeIntervalSince(at) < Self.heartRateFreshness,
      let latest = toBpm(heart?.mostRecentQuantity())
    {
      body["heartRate"] = latest
    }
    if let low = toBpm(heart?.minimumQuantity()) ?? seenMin { body["minHR"] = low }
    if let high = toBpm(heart?.maximumQuantity()) ?? seenMax { body["maxHR"] = high }
    if let average = toBpm(heart?.averageQuantity()) { body["avgHR"] = average }
    return body
  }

  private func publish() {
    // 준비 중(prepared)에 보내면 JS가 "측정 중"으로 그렸다가, 실제 시작 때 시간이 0으로 되돌아간다
    guard !isEnding, isLive, let body = snapshot(), let builder else { return }
    // 화면이 안 보이는 동안 샘플마다 JS를 깨워 박스를 다시 그릴 이유가 없다 — 돌아오면
    // JS가 getActive로 다시 맞춘다. Live Activity는 이때가 제일 중요하니 계속 갱신한다
    if UIApplication.shared.applicationState == .active { emit(body) }

    let elapsed = builder.elapsedTime
    let paused = session?.state == .paused
    let state = HeartRateAttributes.ContentState(
      heartRate: body["heartRate"] as? Int,
      activeKcal: body["activeKcal"] as? Int ?? 0,
      totalKcal: body["totalKcal"] as? Int ?? 0,
      // 초 단위로 반올림 — 안 그러면 매번 몇 ms씩 달라져 "안 바뀌면 건너뛰기"가 안 먹는다
      timerStart: Date(timeIntervalSince1970: (Date().timeIntervalSince1970 - elapsed).rounded()),
      pausedElapsed: paused ? Int(elapsed) : nil
    )
    pushLiveActivity(state, paused: paused)
  }

  // MARK: - Live Activity

  private func startLiveActivity() {
    guard ActivityAuthorizationInfo().areActivitiesEnabled else { return }
    let initial = HeartRateAttributes.ContentState(
      heartRate: nil, activeKcal: 0, totalKcal: 0, timerStart: Date(), pausedElapsed: nil)
    activity = try? Activity.request(
      attributes: HeartRateAttributes(), content: .init(state: initial, staleDate: nil))
  }

  private func pushLiveActivity(_ state: HeartRateAttributes.ContentState, paused: Bool) {
    guard let activity else { return }
    // 안 바뀌었으면 건너뛴다. 다만 staleDate에 걸리지 않게 1분에 한 번은 보낸다
    if let last = lastPushed, last.state == state, Date().timeIntervalSince(last.at) < 60 {
      return
    }
    lastPushed = (state, Date())
    // 앱이 죽어 갱신이 끊기면 2분 뒤 흐리게 — 일시정지 중엔 갱신이 없으니 걸지 않는다
    let staleDate = paused ? nil : Date().addingTimeInterval(120)
    Task { await activity.update(.init(state: state, staleDate: staleDate)) }
  }

  private func endLiveActivity() {
    guard let activity else { return }
    self.activity = nil
    lastPushed = nil
    Task { await activity.end(nil, dismissalPolicy: .immediate) }
  }
}
