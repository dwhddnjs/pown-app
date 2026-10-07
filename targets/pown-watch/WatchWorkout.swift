import Foundation
import HealthKit
import LocalAuthentication
import WatchConnectivity
import os

// 실기 진단용 — Mac Console.app에서 subsystem:com.anonymous.workout-app 으로 본다. 심박 값은 남기지 않는다
private let log = Logger(subsystem: "com.anonymous.workout-app", category: "Watch")

// 워치에서 운동 세션을 돌리고 아이폰에 미러링한다. 갱신마다 WatchSnapshot을 보내고, 아이폰은
// 그걸로 측정 박스·Live Activity를 그린다. 1분 이상이면 끝날 때 건강 앱에 저장한다.
@MainActor
final class WatchWorkout: NSObject, ObservableObject, HKWorkoutSessionDelegate,
  HKLiveWorkoutBuilderDelegate, WCSessionDelegate
{
  static let shared = WatchWorkout()
  private static let heartRateType = HKQuantityType(.heartRate)
  private static let activeEnergy = HKQuantityType(.activeEnergyBurned)
  private static let basalEnergy = HKQuantityType(.basalEnergyBurned)
  private static let bpm = HKUnit.count().unitDivided(by: .minute())
  // 미러링을 기다리는 한도 — 끝나지 않는 경우가 있다(mirror 참고)
  private static let mirrorTimeout: UInt64 = 15_000_000_000
  // 운동 중 심박이 이만큼 끊기고 손목 확인(checkWrist)도 안 되면 손목에서 풀었다고 보고 스스로 멈춘다. 운동 중 워치는
  // 심박을 몇 초마다 재고, 손목에서 빼면 센서가 멈춘다. 시작·재개 직후엔 이만큼 센서가 붙을 시간을 준다.
  // ponytail: 실기 로그("off wrist gap=")로 찬 채 생기는 심박 공백을 보고 조정할 것
  private static let offWristAfter: TimeInterval = 10
  // 시작 때 손목 확인이 안 되면 세션 시작부터 이만큼 첫 심박을 기다려 착용 여부를 정한다
  private static let wornProbe: TimeInterval = 8
  // 측정 중 손목을 보는 간격
  private static let wristInterval: UInt64 = 2_000_000_000
  // 아이폰과 끊긴 뒤 미러링을 다시 거는 간격 — 멀리 있으면 매번 실패하니 두 배씩 늘린다
  private static let reconnectDelay: UInt64 = 5_000_000_000
  private static let reconnectMaxDelay: UInt64 = 60_000_000_000

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
  // 아이폰이 앞 구간에 이어 재는 구간이라고 했다 — 1분이 안 돼도 건강 앱에 남긴다(합치면 1분이 넘는다)
  private var keepShort = false
  // 아이폰에 값이 한 번이라도 닿았는지. 닿은 뒤의 끊김은 시스템이 didDisconnect로 알려준다
  private var delivered = false
  // 아이폰과 미러링이 끊겼다 — 운동은 계속 재면서 다시 붙인다(reconnect)
  private var mirrorLost = false
  private var reconnectTask: Task<Void, Never>?
  // 빌더 통계가 비었을 때(시뮬레이터 가짜 심박 포함) 최소·최대·평균에 쓰는, 직접 본 값
  private var seen: (min: Int, max: Int, sum: Int, count: Int)?
  // 곧 보낼 예정인지 — 거의 동시에 오는 수집 콜백을 한 번의 전송으로 묶는다
  private var sendPending = false
  // 손목에 차고 있는지 — 아이폰에 보내는 값. 시작 때 정하고(probeWrist) 측정 중 계속 본다(checkOnWrist). nil은 모름
  // (재개 직후·되찾은 직후)
  private var wrist: Bool?
  private var wristTask: Task<Void, Never>?
  // 마지막 심박 샘플의 시각과, 세션이 마지막으로 재기 시작한 시각(시작·재개) — 둘 중 늦은 쪽부터 심박 공백을 잰다
  private var lastHeartRateAt: Date?
  private var runningSince = Date()
  // 미러링 대기. 시도 번호로 늦게 끝난 앞 시도가 다음 시도를 풀지 않게 한다
  private var mirrorWait: CheckedContinuation<Void, Error>?
  private var mirrorAttempt = 0
  #if targetEnvironment(simulator)
    // 시뮬레이터엔 심박 센서가 없다 — 2초마다 가짜 값을 만든다
    private var fakeTimer: Timer?
  #endif

  private override init() {
    super.init()
    // 아이폰과 끊긴 채 운동이 끝나면 마지막 값을 이걸로 보낸다(close) — 미러가 끊겨 그 길로는 못 간다
    WCSession.default.delegate = self
    WCSession.default.activate()
  }

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
      let now = Date()
      session.startActivity(with: now)
      try await builder.beginCollection(at: now)
      runningSince = now
      // watchOS 26: 세션이 prepared·running이 되기 전에 미러링을 걸면 실패하거나 끝나지 않는다
      // (FB20723311, 애플 DTS 우회 — developer.apple.com/forums/thread/804276). 시작한 뒤에 건다
      try await mirror(session)
      startFakeHeartRate()
      // 첫 값에 착용 여부를 확정해 싣는다 — 아이폰이 안 찬 워치로 재지 않고 착용을 안내한다(이어폰이 있으면 넘어간다).
      // 정하기 전엔 보내지 않는다(send는 isRunning부터)
      wrist = await probeWrist(session)
      guard session === self.session else { return }
      log.notice("started wrist=\(String(describing: self.wrist), privacy: .public)")
      isRunning = true
      delivered = false
      status = Self.idleStatus
      startWristChecks()
      send()
      // 아이폰에 값이 한 번도 닿지 않은 채 startTimeout이 지나면 아이폰은 이미 시작을 포기했다 —
      // 미러링이 아예 안 붙은 것이니 워치 운동이 혼자 돌지 않게 끝낸다(일시정지 중이어도)
      Task {
        try? await Task.sleep(nanoseconds: UInt64(WatchSnapshot.startTimeout * 1e9))
        if !delivered, self.session === session { close(session, at: .now) }
      }
    } catch {
      log.error("start failed: \(describe(error), privacy: .public)")
      session?.end()
      reset()
      status = tr("측정을 시작하지 못했어요", "Couldn't start measuring")
    }
  }

  // 미러링을 기다린다. 같은 버그로 끝나지 않는 경우가 있어 한도를 넘으면 실패로 본다 — 안 그러면 isStarting이
  // 풀리지 않아, 아이폰이 다시 시작해도 워치 앱을 다시 켤 때까지 받지 않는다. 멈춘 호출은 취소할 수 없어 버린다
  private func mirror(_ session: HKWorkoutSession) async throws {
    // 앞 대기(되찾는 중 새 시작이 온 경우 등)는 놓아준다 — 덮어쓰면 그쪽이 영영 안 끝난다
    resolveMirror(CancellationError())
    mirrorAttempt += 1
    let attempt = mirrorAttempt
    try await withCheckedThrowingContinuation { (continuation: CheckedContinuation<Void, Error>) in
      mirrorWait = continuation
      Task {
        do {
          try await session.startMirroringToCompanionDevice()
          if self.mirrorAttempt == attempt { self.resolveMirror(nil) }
        } catch {
          if self.mirrorAttempt == attempt { self.resolveMirror(error) }
        }
      }
      Task {
        try? await Task.sleep(nanoseconds: Self.mirrorTimeout)
        if self.mirrorAttempt == attempt { self.resolveMirror(MirrorTimeout()) }
      }
    }
  }

  // 미러링 대기를 푼다 — 끝남·실패·한도 중 먼저 온 쪽만 먹는다
  private func resolveMirror(_ error: Error?) {
    guard let continuation = mirrorWait else { return }
    mirrorWait = nil
    if let error {
      continuation.resume(throwing: error)
    } else {
      continuation.resume()
    }
  }

  // 손목 확인. 이 정책은 "손목 감지가 켜져 있고, 암호를 넣은 뒤 계속 손목에 있었으면" UI 없이 성공한다
  // (LAContext.h) — true. interactionNotAllowed라 그렇지 않으면 암호 화면 대신 .notInteractive로 실패한다 — false.
  // 이 실패는 "풀었다" 말고 "여기선 확인이 안 된다"(손목 감지 꺼짐·백그라운드 제약)일 수도 있어 혼자서는 판정하지
  // 않는다 — 심박 공백과 같이 본다. 확인 자체를 못 하면(암호 미설정 등) nil
  private func checkWrist() async -> Bool? {
    let context = LAContext()
    context.interactionNotAllowed = true
    do {
      _ = try await context.evaluatePolicy(
        .deviceOwnerAuthenticationWithWristDetection,
        localizedReason: tr("손목 착용 확인", "Checking your wrist"))
      return true
    } catch let error as LAError where error.code == .notInteractive {
      return false
    } catch {
      log.notice("wrist check unavailable: \(describe(error), privacy: .public)")
      return nil
    }
  }

  // 지금 심박이 끊긴 시간 — 마지막 심박, 또는 시작·재개 시각 중 늦은 쪽부터 센다(그동안 센서가 붙을 시간을 준다)
  private var heartRateGap: TimeInterval {
    Date().timeIntervalSince(max(lastHeartRateAt ?? .distantPast, runningSince))
  }

  // 시작 때 찼는지 — 손목 확인이 되면 바로 true, 아니면 세션 시작부터 wornProbe 안에 심박이 들어오는지로 본다
  private func probeWrist(_ session: HKWorkoutSession) async -> Bool {
    if await checkWrist() == true { return true }
    // lastHeartRateAt은 새 세션마다 비운다(reset) — 값이 있으면 이 세션의 심박이다
    while session === self.session {
      if lastHeartRateAt != nil { return true }
      guard Date().timeIntervalSince(runningSince) < Self.wornProbe else { break }
      try? await Task.sleep(nanoseconds: 500_000_000)
    }
    return false
  }

  // 측정 중 손목을 계속 본다(멈춘 동안은 쉰다)
  private func startWristChecks() {
    wristTask?.cancel()
    wristTask = Task {
      while !Task.isCancelled {
        try? await Task.sleep(nanoseconds: Self.wristInterval)
        guard !Task.isCancelled, self.isRunning else { return }
        await self.checkOnWrist()
      }
    }
  }

  // 심박이 offWristAfter 넘게 끊겼고 손목 확인도 안 되면 손목에서 풀었다 — 스스로 멈춘다(아이폰과 끊겨 있어도).
  // 아이폰은 wrist=false로 "워치를 풀어 일시정지"를 띄운다. 손목 확인이 되면 찬 채 잠깐 못 잰 것(땀·헐거움)이라
  // 그대로 둔다. 다시 차도 자동 재개는 없다(이어폰과 같은 규칙)
  private func checkOnWrist() async {
    guard let session, session.state == .running else { return }
    if heartRateGap < Self.offWristAfter {
      setWrist(true)
      return
    }
    let checked = await checkWrist()
    guard session === self.session, session.state == .running else { return }
    if checked == true {
      setWrist(true)
      return
    }
    log.notice(
      "off wrist gap=\(Int(self.heartRateGap))s check=\(String(describing: checked), privacy: .public)")
    wrist = false
    heartRate = nil
    session.pause()
    send()
  }

  // 바뀌면 바로 보낸다
  private func setWrist(_ value: Bool) {
    guard wrist != value else { return }
    wrist = value
    log.notice("wrist=\(value)")
    send()
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
    // 미러링이 끊겼으면 다시 붙인다. 실패하면 아직 붙어 있거나 아이폰이 멀리 있다 — 붙을 때까지 다시 건다(reconnect가
    // 붙어 있으면 바로 멈춘다)
    let mirrored = (try? await mirror(recovered)) != nil
    guard recovered === session else { return }
    log.notice("recovered")
    if !mirrored { reconnect(recovered) }
    // 찼는지는 손목 감시가 정한다 — 센서가 다시 붙을 시간을 준다
    runningSince = Date()
    readStatistics()
    startFakeHeartRate()
    startWristChecks()
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

  // 아이폰이 멈췄든(stopped), 바로 끝냈든(ended), 세션이 실패했든 같은 길로 마무리한다.
  // report: 멈춘 시각의 값을 마지막으로 보낸다 — 아이폰도 이 경과 시간으로 1분 기준을 재서, 건강 앱
  // 저장과 앱 기록이 같이 남거나 같이 빠진다. 멈췄을 때(워치·아이폰 종료 버튼)만 보낸다 — 이미 끝난 세션엔
  // 닿지 않는다. 아이폰과 끊긴 채 끝나면 미러로는 못 보내니, 아이폰이 이 측정을 받고 있었으면(값이 닿았다)
  // WCSession으로 남긴다 — 아이폰 앱이 다음에 뜰 때라도 받아 기다리던 측정을 이 값으로 마무리한다
  private func close(_ session: HKWorkoutSession, at date: Date, report: Bool = false) {
    guard session === self.session, let builder else { return }
    let discard =
      discardOnClose || (!keepShort && builder.elapsedTime(at: date) < WatchSnapshot.minimumDuration)
    let lost = mirrorLost && delivered
    let final = (report || lost) && !discardOnClose ? snapshotData(at: date) : nil
    let start = builder.startDate
    log.notice("close discard=\(discard) report=\(report) lost=\(lost)")
    reset()
    Task {
      if let final, lost {
        if WCSession.default.activationState == .activated {
          WCSession.default.transferUserInfo(["final": final])
        }
      } else if let final {
        // 못 보내도 저장은 그대로 한다
        _ = try? await session.sendToRemoteWorkoutSession(data: final)
      }
      try? await builder.endCollection(at: date)
      if discard {
        builder.discardWorkout()
        if let start { await purge(from: start, to: date) }
      } else {
        _ = try? await builder.finishWorkout()
      }
      if session.state != .ended { session.end() }
    }
  }

  // 버린 운동이 남긴 샘플을 지운다 — discardWorkout은 운동만 버리고 이미 들어간 심박·칼로리 샘플은 남긴다
  // (HKWorkoutBuilder.h). 이 앱 출처만, 운동 시간 안만
  private func purge(from start: Date, to end: Date) async {
    let predicate = NSCompoundPredicate(andPredicateWithSubpredicates: [
      HKQuery.predicateForObjects(from: .default()),
      HKQuery.predicateForSamples(
        withStart: start.addingTimeInterval(-1), end: end.addingTimeInterval(1),
        options: .strictStartDate),
    ])
    for type in [Self.heartRateType, Self.activeEnergy, Self.basalEnergy] {
      _ = try? await store.deleteObjects(of: type, predicate: predicate)
    }
  }

  // 아이폰과 끊겨도 운동은 계속 잰다(폰을 사물함에 둬도 기록이 이어지게) — 붙을 때까지 미러링을 다시 건다. 붙으면
  // 아이폰은 새 미러 세션을 같은 측정으로 이어 받는다(HeartRateModule adopt)
  private func reconnect(_ session: HKWorkoutSession) {
    mirrorLost = true
    reconnectTask?.cancel()
    reconnectTask = Task {
      var delay = Self.reconnectDelay
      while true {
        try? await Task.sleep(nanoseconds: delay)
        guard !Task.isCancelled, session === self.session else { return }
        // 미러가 아직 살아 있으면(되찾은 직후) 보내기가 된다
        if let data = snapshotData(at: Date()),
          (try? await session.sendToRemoteWorkoutSession(data: data)) != nil
        {
          break
        }
        guard !Task.isCancelled, session === self.session else { return }
        if (try? await mirror(session)) != nil { break }
        delay = min(delay * 2, Self.reconnectMaxDelay)
      }
      guard !Task.isCancelled, session === self.session else { return }
      log.notice("reconnected")
      mirrorLost = false
      send()
    }
  }

  private func reset() {
    #if targetEnvironment(simulator)
      fakeTimer?.invalidate()
      fakeTimer = nil
    #endif
    wristTask?.cancel()
    wristTask = nil
    reconnectTask?.cancel()
    reconnectTask = nil
    mirrorLost = false
    wrist = nil
    lastHeartRateAt = nil
    session = nil
    builder = nil
    isRunning = false
    isPaused = false
    heartRate = nil
    activeKcal = 0
    totalKcal = 0
    discardOnClose = false
    keepShort = false
    seen = nil
  }

  private func startFakeHeartRate() {
    #if targetEnvironment(simulator)
      fakeTimer = Timer.scheduledTimer(withTimeInterval: 2, repeats: true) { _ in
        Task { @MainActor in
          guard !self.isPaused else { return }
          self.lastHeartRateAt = Date()
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
      // 손목 감시(checkOnWrist)가 이 시각으로 심박 공백을 잰다
      lastHeartRateAt = stat?.mostRecentQuantityDateInterval()?.end
      if let at = lastHeartRateAt,
        Date().timeIntervalSince(at) < WatchSnapshot.heartRateFreshness,
        let quantity = stat?.mostRecentQuantity()
      {
        see(Int(quantity.doubleValue(for: Self.bpm).rounded()))
      } else {
        heartRate = nil
      }
    #endif
  }

  // 시작 때 착용 여부를 정하기 전(isRunning 전)엔 보내지 않는다 — 아이폰은 첫 값으로 시작을 끝낸다
  private func send() {
    guard isRunning, let session, let data = snapshotData(at: Date()) else { return }
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
      startedAt: (builder.startDate ?? date).timeIntervalSince1970 * 1000,
      wrist: wrist
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
      // 재개(워치·아이폰·섬 어디서든) — 센서가 다시 붙을 시간을 주고 착용 여부는 손목 감시가 다시 정한다. 풀어서 멈춘
      // 표시(wrist=false)가 남으면 아이폰이 재개한 측정을 계속 "풀어서 멈춤"으로 안내한다
      if toState == .running, fromState == .paused {
        self.runningSince = date
        self.wrist = nil
      }
      self.send()
    }
  }

  nonisolated func workoutSession(_ workoutSession: HKWorkoutSession, didFailWithError error: Error)
  {
    Task { @MainActor in
      log.error("session failed: \(describe(error), privacy: .public)")
      self.close(workoutSession, at: .now)
    }
  }

  // 아이폰과 연결이 끊겨도 운동은 끝내지 않는다(폰을 사물함에 둔 경우 등) — 계속 재면서 다시 붙인다.
  // 아이폰도 측정을 끝내지 않고 기다린다. 끊긴 채 여기서 끝내면 마지막 값은 WCSession으로 간다(close)
  nonisolated func workoutSession(
    _ workoutSession: HKWorkoutSession, didDisconnectFromRemoteDeviceWithError error: Error?
  ) {
    Task { @MainActor in
      guard workoutSession === self.session else { return }
      log.notice("disconnected: \(describe(error), privacy: .public)")
      self.reconnect(workoutSession)
    }
  }

  nonisolated func workoutSession(
    _ workoutSession: HKWorkoutSession, didReceiveDataFromRemoteWorkoutSession data: [Data]
  ) {
    let commands = data.compactMap { try? JSONDecoder().decode(WatchCommand.self, from: $0) }
    let discard = commands.contains { $0.discard }
    let keep = commands.contains { $0.keep == true }
    guard discard || keep else { return }
    Task { @MainActor in
      guard workoutSession === self.session else { return }
      if keep { self.keepShort = true }
      guard discard else { return }
      // 아이폰은 이걸 보내고 멈추지 않은 채 기다린다 — 표시한 다음 여기서 멈춰야 저장 없이 끝난다.
      // 아이폰이 같이 멈추면 멈춤이 먼저 처리돼 이 표시를 놓칠 수 있다
      self.discardOnClose = true
      workoutSession.stopActivity(with: .now)
    }
  }

  nonisolated func session(
    _ session: WCSession, activationDidCompleteWith activationState: WCSessionActivationState,
    error: Error?
  ) {}

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

// 미러링이 한도 안에 끝나지 않았다
private struct MirrorTimeout: Error {}

// 로그용 에러 표기 — 도메인과 코드만(문구는 기기 언어를 탄다)
private func describe(_ error: Error?) -> String {
  guard let error else { return "nil" }
  let nsError = error as NSError
  return "\(nsError.domain)#\(nsError.code)"
}

// 워치 앱은 문구가 몇 개뿐이라 문자열 카탈로그 대신 시스템 언어로 고른다.
// 앱 문구(lib/i18n.ts의 heartRate.*)와 같은 말을 쓴다
func tr(_ ko: String, _ en: String) -> String {
  Locale.preferredLanguages.first?.hasPrefix("ko") == true ? ko : en
}
