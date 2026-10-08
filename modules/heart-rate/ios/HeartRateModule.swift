import ActivityKit
import AVFoundation
import ExpoModulesCore
import HealthKit
import UIKit
import WatchConnectivity
import os

// 실기 진단용 — Mac Console.app에서 아이폰을 고르고 subsystem:com.anonymous.workout-app 으로 본다(워치 앱도
// 같은 subsystem). 심박 값은 남기지 않는다
private let log = Logger(subsystem: "com.anonymous.workout-app", category: "HeartRate")

// iPhone 운동 세션(iOS 26+)으로 에어팟 프로 3 같은 웨어러블의 심박·칼로리를 받거나, 애플워치
// 운동 세션을 미러링해 받아 JS와 Live Activity(다이나믹 아일랜드·잠금화면)에 흘려보낸다.
// Live Activity 갱신은 여기서 직접 한다 — 백그라운드에서 JS를 거치지 않는다.
public class HeartRateModule: Module {
  // JS가 onUpdate를 듣고 있는지(메인 스레드에서만 만진다). 안 들을 때 끝난 측정의 요약은
  // WorkoutManager가 들고 있다가 구독이 붙으면 넘긴다
  private var isObservingUpdate = false

  public func definition() -> ModuleDefinition {
    Name("HeartRate")

    Events("onUpdate", "onDeviceChange")

    OnCreate {
      // 워치 페어링 여부는 활성화가 끝나야 읽힌다 — JS가 시작할 때 물은 값이
      // 틀렸을 수 있으니 바뀔 때마다 다시 알린다
      WatchState.shared.onChange = { [weak self] in
        DispatchQueue.main.async { self?.sendDeviceChange(removed: false) }
      }
      WatchState.shared.activate()
    }

    // 모듈 큐에서 불린다 — 메인으로 옮겨 sendUpdate와 순서를 맞춘다
    OnStartObserving("onUpdate") {
      Task { @MainActor in
        self.isObservingUpdate = true
        guard #available(iOS 26.0, *) else { return }
        self.workout().flushPending()
      }
    }

    OnStopObserving("onUpdate") {
      Task { @MainActor in self.isObservingUpdate = false }
    }

    Function("isSupported") { () -> Bool in
      guard #available(iOS 26.0, *) else { return false }
      return HKHealthStore.isHealthDataAvailable()
    }

    Function("heartRateDevice") { () -> String? in
      // 활성화가 실패해 꺼져 있으면 다시 건다 — JS가 앱이 앞으로 올 때마다 부른다
      WatchState.shared.activate()
      return HeartRateModule.heartRateDevice()
    }

    // 이어폰으로 재는데 심박이 안 들어올 때 워치로 바꾸는 버튼을 보일지 정한다
    Function("isWatchAvailable") { () -> Bool in
      HeartRateModule.isWatchAvailable()
    }

    AsyncFunction("requestAuthorization") { () async throws -> Bool in
      guard #available(iOS 26.0, *) else { return false }
      return try await self.workout().requestAuthorization()
    }

    AsyncFunction("start") { (device: String?) async throws -> [String: Any]? in
      guard #available(iOS 26.0, *) else { return nil }
      return try await self.workout().start(device: device)
    }

    AsyncFunction("pause") { () async in
      guard #available(iOS 26.0, *) else { return }
      await self.workout().pause()
    }

    AsyncFunction("resume") { () async throws -> [String: Any]? in
      guard #available(iOS 26.0, *) else { return nil }
      return try await self.workout().resume()
    }

    AsyncFunction("switchToWatch") { () async throws -> [String: Any]? in
      guard #available(iOS 26.0, *) else { return nil }
      return try await self.workout().switchToWatch()
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

    AsyncFunction("deleteWorkout") { (startedAt: Double) async -> String in
      guard #available(iOS 26.0, *) else { return "notFound" }
      return await self.workout().deleteWorkout(
        startedAt: Date(timeIntervalSince1970: startedAt / 1000))
    }
  }

  private func sendDeviceChange(removed: Bool) {
    var body: [String: Any] = ["removed": removed]
    if let device = HeartRateModule.heartRateDevice() { body["device"] = device }
    sendEvent("onDeviceChange", body)
  }

  // JS가 안 들으면 false — 아일랜드 종료 버튼이 앱을 백그라운드로 깨운 직후엔 아직 구독 전이다
  private func sendUpdate(_ body: [String: Any]) -> Bool {
    guard isObservingUpdate else { return false }
    sendEvent("onUpdate", body)
    return true
  }

  @available(iOS 26.0, *)
  @MainActor
  private func workout() -> WorkoutManager {
    let manager = WorkoutManager.shared
    // 매니저는 앱에 하나라 JS를 다시 로드하면 이 모듈보다 오래 산다 — 사라진 모듈이면 false를
    // 돌려 요약을 버리지 않고 들고 있게 한다
    manager.emit = { [weak self] body in self?.sendUpdate(body) ?? false }
    // 에어팟을 꽂거나 빼면 매니저가 먼저 받아(측정 중이면 자동 일시정지) 여기로 넘긴다 — 시작 버튼 노출 갱신
    manager.deviceChanged = { [weak self] removed in self?.sendDeviceChange(removed: removed) }
    return manager
  }

  // "earphones"(블루투스 이어폰) > "watch"(페어링된 애플워치) > nil. 착용은 추정하지 않는다 — 워치 손목 감지와
  // 이어폰 심박 학습으로 추정했더니 실기에서 자꾸 엇나갔다(3.5.3). 둘 다 있으면 이어폰으로 재고, 워치엔 Live
  // Activity가 스마트 스택에 뜬다. JS가 이걸로 고른 기기를 start()에 넘긴다
  static func heartRateDevice() -> String? {
    if hasEarphones() { return "earphones" }
    return isWatchAvailable() ? "watch" : nil
  }

  // 블루투스 출력이 소리를 받고 있으면 이어폰을 꼈다고 본다 — 에어팟은 귀에 넣으면 출력이 넘어오고 빼면 돌아간다.
  // 모델·심박 센서 유무를 알려주는 공개 API가 없어 센서 없는 이어폰·차량 오디오도 이어폰으로 잡힌다(박스가 "신호
  // 없음"으로 안내하고, 워치가 있으면 워치로 바꿔 재게 한다 — switchToWatch)
  static func hasEarphones() -> Bool {
    !bluetoothOutputs(AVAudioSession.sharedInstance().currentRoute).isEmpty
  }

  // 그 오디오 경로에서 소리를 받는 블루투스 출력들의 uid
  static func bluetoothOutputs(_ route: AVAudioSessionRouteDescription) -> Set<String> {
    let bluetooth: [AVAudioSession.Port] = [.bluetoothA2DP, .bluetoothHFP, .bluetoothLE]
    return Set(route.outputs.filter { bluetooth.contains($0.portType) }.map(\.uid))
  }

  // 페어링된 워치가 있으면 워치로 잰다 — 찼는지는 아이폰이 알 수 없고(애플 DTS), 워치 앱 설치 여부
  // (isWatchAppInstalled)로 막았더니 실기에서 깔려 있는데도 버튼이 안 떴다. 앱이 정말 없으면 시작이 실패하고
  // 설치 안내가, 안 찼으면 박스에 "신호 없음" 안내가 뜬다
  static func isWatchAvailable() -> Bool {
    guard WCSession.isSupported() else { return false }
    let session = WCSession.default
    return session.activationState == .activated && session.isPaired
  }
}

// 버튼을 누른 사이 이어폰을 뺐고 워치도 없다 — 센서 없는 측정을 열지 않는다. 일시정지로 남은 측정을
// 이을 기기가 없을 때도 던진다(ERR_NO_DEVICE)
final class NoDeviceException: Exception {
  override var reason: String { "No heart rate device" }
}

// WCSession은 델리게이트가 있어야 활성화된다 — 페어링·설치 상태 변화만 듣는다.
// 앱에 하나뿐인 WCSession을 쓰므로 공유 인스턴스로 둔다
final class WatchState: NSObject, WCSessionDelegate {
  static let shared = WatchState()
  // 모듈 생성 스레드에서 쓰고 WCSession 큐에서 읽는다 — 동시에 만지면 클로저가 깨질 수 있어
  // lock으로 감싼다
  var onChange: (() -> Void)? {
    get {
      lock.lock()
      defer { lock.unlock() }
      return changeHandler
    }
    set {
      lock.lock()
      defer { lock.unlock() }
      changeHandler = newValue
    }
  }
  private let lock = NSLock()
  private var changeHandler: (() -> Void)?
  // 메인에서만 만진다
  private var started = false

  // 앱 실행 직후(HeartRateAppDelegate)·모듈 생성·기기 확인(JS가 앱이 앞으로 올 때) 때 불린다 — 메인에서
  // 건다. 활성화가 실패해 꺼져 있으면 다시 건다
  func activate() {
    DispatchQueue.main.async { [self] in
      guard WCSession.isSupported(),
        !started || WCSession.default.activationState == .notActivated
      else { return }
      started = true
      WCSession.default.delegate = self
      WCSession.default.activate()
    }
  }

  func session(
    _ session: WCSession, activationDidCompleteWith activationState: WCSessionActivationState,
    error: Error?
  ) {
    log.notice(
      "WCSession activation=\(activationState.rawValue) paired=\(session.isPaired) installed=\(session.isWatchAppInstalled) error=\(describe(error), privacy: .public)"
    )
    onChange?()
  }
  func sessionDidBecomeInactive(_ session: WCSession) {}
  func sessionDidDeactivate(_ session: WCSession) { session.activate() }
  func sessionWatchStateDidChange(_ session: WCSession) {
    log.notice(
      "WCSession watch state paired=\(session.isPaired) installed=\(session.isWatchAppInstalled)")
    onChange?()
  }

  // 워치가 아이폰과 끊긴 채 운동을 끝내면 마지막 값을 이걸로 보낸다(WatchWorkout.close) — 미러가 끊겨 그 길로는
  // 못 온다. 앱이 꺼져 있었으면 다음에 켤 때 온다
  func session(_ session: WCSession, didReceiveUserInfo userInfo: [String: Any] = [:]) {
    guard let data = userInfo["final"] as? Data,
      let final = try? JSONDecoder().decode(WatchSnapshot.self, from: data)
    else { return }
    if #available(iOS 26.0, *) {
      Task { @MainActor in WorkoutManager.shared.watchFinished(final) }
    }
  }
}

// 워치를 깨우거나 첫 값을 기다리다 실패했다(꺼짐·타임아웃·워치에서 끝남)
struct WatchStartError: Error {}

// 워치가 응답하지 않고 이어폰도 없다 — JS가 "워치를 차고 잠금을 풀어 주세요"로 안내한다
// (code: ERR_WATCH_UNAVAILABLE)
final class WatchUnavailableException: Exception {
  override var reason: String { "Apple Watch did not start the workout" }
}

// 워치가 답이 없는데 워치에 포운 앱이 없다고 나온다 — JS가 설치 방법을 안내한다(ERR_WATCH_APP_MISSING)
final class WatchAppMissingException: Exception {
  override var reason: String { "Pown is not installed on Apple Watch" }
}

// 로그용 에러 표기 — 도메인과 코드만(문구는 기기 언어를 탄다)
private func describe(_ error: Error?) -> String {
  guard let error else { return "nil" }
  let nsError = error as NSError
  return "\(nsError.domain)#\(nsError.code)"
}

@available(iOS 17.0, *)
private extension HKWorkoutSessionState {
  // 로그용 이름
  var name: String {
    switch self {
    case .notStarted: "notStarted"
    case .running: "running"
    case .ended: "ended"
    case .paused: "paused"
    case .prepared: "prepared"
    case .stopped: "stopped"
    @unknown default: "\(rawValue)"
    }
  }
}

@available(iOS 26.0, *)
@MainActor
final class WorkoutManager: NSObject, HKWorkoutSessionDelegate, HKLiveWorkoutBuilderDelegate {
  // 앱에 하나 — 미러링 핸들러를 앱 실행 직후(HeartRateAppDelegate)에 걸어야 해서 모듈보다
  // 먼저 생긴다
  static let shared = WorkoutManager()

  private static let heartRate = HKQuantityType(.heartRate)
  private static let activeEnergy = HKQuantityType(.activeEnergyBurned)
  private static let basalEnergy = HKQuantityType(.basalEnergyBurned)
  private static let bpm = HKUnit.count().unitDivided(by: .minute())
  // 종료를 걸고 멈췄다는 답을 기다리는 한도 — 워치는 연결이 끊겼으면 답이 오지 않는다. 아이폰
  // 세션도 답이 없으면 종료가 끝나지 않아 다음 측정까지 막히니 같이 건다
  private static let stopTimeout: UInt64 = 5_000_000_000
  // 처음 워치로 잴 땐 워치에 건강 권한 창이 떠 그걸 허용하는 시간까지 든다 — 넉넉히 기다린다(박스가 워치 화면을
  // 보라고 안내한다). 그 뒤로는 WatchSnapshot.startTimeout
  private static let watchFirstStartTimeout: TimeInterval = 60
  // 시작 대기 중 미러 세션이 닫혔을 때 새 세션(재시도)을 기다리는 한도 — 안 오면 워치에서 시작이
  // 실패한 것이니 남은 시간을 다 기다리지 않는다
  private static let watchReplaceWait: UInt64 = 10_000_000_000
  // 요약에 남기는 키 — 앞 구간(carried)에 쌓을 때 화면용 값(심박·상태 등)은 버린다
  private static let summaryKeys: Set<String> = [
    "source", "startedAt", "elapsedSec", "activeKcal", "totalKcal", "minHR", "maxHR", "avgHR",
    "samples", "healthStarts",
  ]
  // 일시정지로 남긴 채 잊은 측정은 시작한 지 이만큼 지나면 거기까지로 저장하고 끝낸다(expireSuspended)
  private static let suspendedLimit: TimeInterval = 6 * 3600

  // JS로 이벤트를 보내는 길(모듈이 붙인다). 보냈으면 true. 모듈이 뜨기 전(워치가 앱을
  // 백그라운드로 깨운 경우 등)이거나 JS가 아직 안 들으면 못 보낸다 — 그 사이 끝난 측정의
  // 요약만 들고 있다가 flushPending에서 넘긴다
  var emit: (([String: Any]) -> Bool)?
  // 오디오 출력이 바뀌었다(에어팟을 꽂거나 뺐다) — 모듈이 JS에 알려 시작 버튼을 갱신한다. true면 있던 블루투스
  // 출력이 사라졌다
  var deviceChanged: ((Bool) -> Void)?
  // 못 보낸 요약들. 겹쳐 와도 덮어쓰지 않는다. 버튼이 깨운 앱이 JS가 듣기 전에 정지됐다 회수되면
  // 건강 앱엔 운동이 남는데 앱 기록만 빠지니 디스크에 둔다
  private var pendingEnded: [[String: Any]] {
    get { UserDefaults.standard.array(forKey: "heartRatePendingEnded") as? [[String: Any]] ?? [] }
    set { UserDefaults.standard.set(newValue, forKey: "heartRatePendingEnded") }
  }
  // 앞 구간들을 합친 요약. 시스템이 아이폰 세션을 끝냈는데(에어팟을 빼면 iOS가 끝낸다) 측정은 일시정지로
  // 남길 때 쌓인다 — 세션이 없는 이 상태가 suspended다. 재개하면 새 세션(구간)이 이어 붙고, 종료하면 합쳐서
  // 한 기록이 된다. 앱이 죽어도 이어지게 디스크에 두되, 화면 갱신마다 앞 구간 샘플 전체를 디스크에서 꺼내 변환하지
  // 않게 메모리에 들고 바뀔 때만 쓴다
  private var carried: [String: Any]? = UserDefaults.standard.dictionary(forKey: "heartRateCarried") {
    didSet { UserDefaults.standard.set(carried, forKey: "heartRateCarried") }
  }

  private let store = HKHealthStore()
  private var session: HKWorkoutSession?
  // 아이폰 세션에만 있다. 워치 미러 세션이면 nil이고 값은 remote에서 읽는다
  private var builder: HKLiveWorkoutBuilder?
  // 워치와 미러링이 끊겼다. 워치는 계속 재면서 미러링을 다시 건다(WatchWorkout.reconnect) — 측정을 끝내지 않고
  // 기다리다 새 미러 세션이 오면 같은 측정으로 잇는다(adopt). 끊긴 미러 세션은 더는 쓸 수 없다(HKWorkoutSession.h)
  private var isWatchLost = false
  // 워치와 끊긴 사이(또는 답이 없을 때) 아이폰에서 끝낸 측정 — 멈춤이 워치에 닿지 않아 워치는 계속 잰다. 다시 붙으면
  // 그때 끝낸다(adopt). start: 워치 운동 시작(ms), discard: 전체 초기화. 앱이 죽어도 남게 디스크에 둔다
  private var lostEnd: [String: Any]? {
    get { UserDefaults.standard.dictionary(forKey: "heartRateLostEnd") }
    set { UserDefaults.standard.set(newValue, forKey: "heartRateLostEnd") }
  }
  // 워치로 시작해 본 적이 있다 — 없으면 워치에 건강 권한 창이 떠 있을 수 있다
  private var watchStartedBefore: Bool {
    get { UserDefaults.standard.bool(forKey: "heartRateWatchStarted") }
    set { UserDefaults.standard.set(newValue, forKey: "heartRateWatchStarted") }
  }
  // 이 워치 구간은 짧아도 건강 앱에 남기라고 보냈다(keep) — 요약의 healthStarts에 넣는다
  private var watchKeep = false
  // 이어폰을 빼서 멈췄다("earphonesRemoved") — 박스가 안내한다. 재개하면 지운다
  private var pauseReason: String?
  // 세션 없이 일시정지로 남은 측정(suspended)을 새 세션으로 잇는 중
  private var isResuming = false
  private var activity: Activity<HeartRateAttributes>?
  private var lastPushed: (state: HeartRateAttributes.ContentState, at: Date)?
  private var stopped: CheckedContinuation<Void, Never>?
  // 종료 대기 구분 — 늦게 깨어난 타임아웃이 다음 종료의 대기를 풀지 않게
  private var stopWait = 0
  private var isEnding = false
  // 빌더 통계에 최소·최대가 비어 올 때를 대비해 직접 본 값도 들고 있는다
  private var seenMin: Int?
  private var seenMax: Int?
  // 기록 화면 그래프용 심박 [시작 후 초, bpm]. JS는 백그라운드에서 샘플을 못 받아 여기서 모은다.
  // 아이폰 세션은 종료 때 건강 앱에서 읽은 심박(storedSamples)이 없을 때만 쓰는 대체값이고,
  // 워치 세션은 이것뿐이다(워치가 저장한 운동은 바로 동기화되지 않는다)
  private var samples: [[Int]] = []
  private var lastSampleAt: Date?
  // 워치가 마지막으로 보낸 값과 받은 시각
  private var remote: (snapshot: WatchSnapshot, at: Date)?
  // 워치로 시작하는 중(startWatchApp ~ 첫 값). 첫 값·깨우기 실패·타임아웃·취소 중 먼저 온 쪽이
  // 대기를 푼다
  private var isStartingOnWatch = false
  private var watchStarted: CheckedContinuation<Void, Error>?
  // 워치 시작 시도 구분 — 늦게 깨어난 재시도 대기나 늦게 실패한 깨우기가 다음 시도를 실패시키지 않게
  private var watchStartAttempt = 0
  // 포기한 워치 시작(타임아웃·전체 초기화) — 그 뒤 늦게 도착한 미러 세션은 붙이지 않고 닫는다
  private var abandonedWatchStart = false
  // 이번 워치 시작에 미러 세션이 붙었다 — 워치 앱이 답했으니 깔려 있다(watchFailure)
  private var watchAnswered = false
  // 손을 뗀 세션. 그 뒤 늦게 오는 콜백(stopped·남은 데이터)이 세션을 다시 붙이면 아무도 끝내지
  // 않는 Live Activity가 뜨고, session이 차 있어 다음 시작이 막힌다
  private let released = NSHashTable<HKWorkoutSession>.weakObjects()
  // 곧 내보낼 예정인지 — 거의 동시에 오는 수집 콜백을 한 번으로 묶는다(publishSoon)
  private var publishPending = false

  private override init() {
    super.init()
    // 3.5.3 이어폰 심박 학습이 남긴 값 — 이제 안 읽는다
    for key in ["heartRateNoSensor", "heartRateSensorProven"] {
      UserDefaults.standard.removeObject(forKey: key)
    }
    store.workoutSessionMirroringStartHandler = { [weak self] mirrored in
      // 델리게이트는 여기서 바로 건다 — 메인으로 넘어가는 사이에 온 상태 변화·첫 값을 놓치지
      // 않게. 콜백도 adopt로 세션을 붙이므로 어느 쪽이 먼저 와도 된다
      mirrored.delegate = self
      Task { @MainActor in _ = self?.adopt(mirrored) }
    }
    // 아일랜드·잠금화면 버튼(targets/heart-rate-widget/_shared/HeartRateControlIntent.swift)이 앱
    // 프로세스에서 이 알림을 보낸다 — 위젯은 이 모듈을 링크하지 않아 직접 부를 수 없다. 알림 이름은
    // 그 파일과 같아야 한다. 모듈이 아니라 여기서 듣는다 — 버튼이 꺼진 앱을 백그라운드로 깨우면
    // JS·모듈이 뜨기 전에 알림이 온다. 인텐트는 done이 불릴 때까지 기다리므로 꼭 한 번 부른다
    NotificationCenter.default.addObserver(
      forName: Notification.Name("HeartRateControl"), object: nil, queue: .main
    ) { [weak self] notification in
      let action = notification.userInfo?["action"] as? String
      let done = notification.userInfo?["done"] as? @Sendable () -> Void
      Task { @MainActor in
        if let action { await self?.control(action) }
        done?()
      }
    }
    // 에어팟을 귀에서 빼면 오디오 출력이 바뀐다. JS가 아니라 여기서 앱 실행부터 늘 듣는다 — 앱이 뒤에 있으면
    // JS의 측정 상태가 낡아(publish는 앱이 앞일 때만 보낸다) JS가 판단하면 멈출 때를 놓친다
    NotificationCenter.default.addObserver(
      forName: AVAudioSession.routeChangeNotification, object: nil, queue: .main
    ) { [weak self] notification in
      // "뺐다"는 기기가 사라진 경우(oldDeviceUnavailable)만이다. 숏츠 촬영처럼 마이크가 오디오 세션을
      // 바꿔 출력이 스피커로 옮겨가는 것(categoryChange 등)까지 뺀 걸로 보면, 멀쩡히 끼고 있는데
      // 측정이 멈춘다. 다른 블루투스 출력(차량 오디오 등)이 남아 있어도 있던 출력이 사라졌으면 뺀 것이다
      let reason = notification.userInfo?[AVAudioSessionRouteChangeReasonKey] as? UInt ?? 0
      let before = (notification.userInfo?[AVAudioSessionRouteChangePreviousRouteKey]
        as? AVAudioSessionRouteDescription).map(HeartRateModule.bluetoothOutputs)
      let now = HeartRateModule.bluetoothOutputs(AVAudioSession.sharedInstance().currentRoute)
      let removed =
        reason == AVAudioSession.RouteChangeReason.oldDeviceUnavailable.rawValue
        && (before.map { !$0.isSubset(of: now) } ?? now.isEmpty)
      MainActor.assumeIsolated {
        self?.routeChanged(reason: reason, earphones: !now.isEmpty, removed: removed)
      }
    }
  }

  private func control(_ action: String) async {
    // 버튼 때문에 앱이 막 깨어났으면 세션이 아직 안 붙어 있다
    _ = await recover()
    switch action {
    case "pause": pause()
    // 세션 없이 일시정지로 남은 측정은 뒤에서 새 세션을 못 연다 — 그때 섬은 이 버튼 대신 앱을 여는 링크를 보인다
    case "resume": _ = try? await resume()
    case "end":
      // 앱이 뒤에 있을 때 끝난 것이라 종료 버튼 쪽 저장이 없다 — 시스템 종료와 같은 이벤트로
      // 요약을 넘겨 JS가 기록을 남긴다(JS가 아직 안 들으면 send가 들고 있다)
      do {
        var body: [String: Any] = ["state": "ended"]
        if let summary = try await end() { body["summary"] = summary }
        send(body)
      } catch {
        // 이미 끝나는 중이면 그쪽이 마무리하고 알린다 — 시스템 종료는 측정을 일시정지로 남길 수 있어, 여기서 ended를
        // 보내면 JS가 남은 측정의 박스를 접는다. 끝낼 측정이 아예 없을 때만 박스를 접게 알린다
        if !isEnding { send(["state": "ended"]) }
      }
    default: break
    }
  }

  // 에어팟을 꽂거나 뺐다. 이어폰으로 재는 중(아이폰 세션)에 빼면 빈 심박으로 시간만 쌓이지 않게 멈춘다. 다시 껴도
  // 자동 재개는 하지 않는다(사용자가 재개를 누른다). 워치로 재는 중이면 시작 버튼 기기만 바뀐다
  private func routeChanged(reason: UInt, earphones: Bool, removed: Bool) {
    log.notice("route change reason=\(reason) earphones=\(earphones) removed=\(removed)")
    deviceChanged?(removed)
    guard removed, builder != nil else { return }
    // 에어팟을 빼면 iOS가 세션을 닫는다 — 그 마무리(closeBySystem) 중이면 사유만 남겨 일시정지로 남은 측정이 안내한다
    if isEnding {
      if pauseReason == nil { pauseReason = "earphonesRemoved" }
      return
    }
    guard session?.state == .running else { return }
    pause(reason: "earphonesRemoved")
  }

  func requestAuthorization() async throws -> Bool {
    let share: Set<HKSampleType> = [
      HKQuantityType.workoutType(), Self.heartRate, Self.activeEnergy, Self.basalEnergy,
    ]
    // 운동 읽기는 기록을 지울 때 워치 앱이 저장한 운동을 찾는 데 쓴다
    let read: Set<HKObjectType> = [
      HKQuantityType.workoutType(), Self.heartRate, Self.activeEnergy, Self.basalEnergy,
    ]
    try await store.requestAuthorization(toShare: share, read: read)
    // 읽기 거부는 HealthKit이 알려주지 않는다 — 운동 저장(쓰기)만 판별할 수 있다
    return store.authorizationStatus(for: .workoutType()) == .sharingAuthorized
  }

  // 시작이 끝난 시점의 첫 스냅샷을 돌려준다 — JS가 이벤트 도착을 기다리지 않고 바로
  // 박스를 "측정 중"으로 바꾼다(준비 표시가 한 프레임 버튼으로 되돌아가지 않게).
  // device: JS가 준비 표시에 쓴 기기 — 여기서 다시 고르면 그 사이 바뀌어 표시와 어긋난다(이어폰
  // 3초 링이 "1"에 멈춘 채 워치를 기다리는 등)
  func start(device: String?) async throws -> [String: Any]? {
    guard !isStartingOnWatch, !isResuming else { return nil }
    if let session, !isEnding {
      // 이미 재는 중이면 그 값을 돌려준다(박스가 펴진다). 시작 전·멈춘 채 남은 세션은 정리하고 새로 연다 —
      // 그냥 nil을 돌려주면 앱을 다시 켤 때까지 시작이 조용히 막힌다
      if isLive { return snapshot() }
      log.notice("start: clearing stale session state=\(session.state.name, privacy: .public)")
      if session.type == .mirrored { closeMirrored(session) } else { session.end() }
      reset()
    }
    guard session == nil else { return nil }
    expireSuspended()
    // 세션 없이 일시정지로 남은 측정이 있다 — 박스가 그걸 보여준다(재개·종료는 거기서)
    if carried != nil { return snapshot() }
    return try await startSegment(device: device)
  }

  // 세션(구간) 하나를 연다 — 새 측정의 시작과 일시정지로 남은 측정의 재개가 같이 쓴다. 이어 붙일 앞 구간
  // (carried)이 있으면 실패해도 그 측정·섬은 남긴다(abandonSegment). fallback: false면 워치가 안 돼도 이어폰으로
  // 넘어가지 않는다(사용자가 이어폰 대신 워치를 고른 경우)
  private func startSegment(device: String?, fallback: Bool = true) async throws -> [String: Any]? {
    guard device == "watch" || (device == "earphones" && HeartRateModule.hasEarphones()) else {
      throw NoDeviceException()
    }
    let configuration = Self.configuration()

    if device == "watch" {
      do {
        return try await startOnWatch(configuration)
      } catch is CancellationError {
        // 준비 중 전체 초기화로 취소됐다 — 이어폰으로 넘어가지 않는다
        throw CancellationError()
      } catch {
        // 워치가 응답하지 않았다(꺼짐·멀리 있음·앱 없음). 그 사이 이어폰을 꼈으면 아이폰 세션으로 잰다
        let earphones = HeartRateModule.hasEarphones()
        log.notice(
          "watch start failed: \(String(describing: error), privacy: .public) earphones=\(earphones)")
        guard fallback, earphones else { throw watchFailure() }
      }
    }

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
      log.error("phone start failed: \(describe(error), privacy: .public)")
      if self.session === session, !isEnding {
        session.end()
        abandonSegment()
      }
      throw error
    }
    log.notice("phone session started")
    // 일시정지로 남은 측정을 잇는 거면 그 섬을 이어 쓴다
    if !hasLiveActivity { startLiveActivity() }
    publish()
    return snapshot()
  }

  // 워치로 못 잰 까닭을 JS가 안내할 에러로 바꾼다 — 워치 앱이 없다고 나오면 설치를, 아니면 차고 잠금을 풀라고 한다.
  // isWatchAppInstalled는 깔려 있어도 false일 때가 있어(isWatchAvailable 참고) 이번 시도에 워치가 답하지 않았을 때만 본다
  private func watchFailure() -> Exception {
    watchAnswered || WCSession.default.isWatchAppInstalled
      ? WatchUnavailableException() : WatchAppMissingException()
  }

  private static func configuration() -> HKWorkoutConfiguration {
    let configuration = HKWorkoutConfiguration()
    configuration.activityType = .traditionalStrengthTraining
    configuration.locationType = .indoor
    return configuration
  }

  // 워치 앱을 깨워 운동을 시작하게 하고, 미러 세션으로 첫 값이 올 때까지 기다린다
  private func startOnWatch(_ configuration: HKWorkoutConfiguration) async throws -> [String: Any]? {
    isStartingOnWatch = true
    abandonedWatchStart = false
    watchAnswered = false
    // 끊긴 사이 끝낸 앞 측정의 워치 운동은 이 시작 요청을 받은 워치가 스스로 마무리한다(WatchWorkout.start)
    lostEnd = nil
    watchStartAttempt += 1
    let attempt = watchStartAttempt
    defer { isStartingOnWatch = false }
    log.notice("watch start attempt=\(attempt)")
    do {
      // 한도는 깨우기부터 센다 — 워치가 꺼져 있으면 startWatchApp이 끝나지 않는다는 보고가 있어,
      // 끝난 뒤부터 세면 시작이 영영 안 끝나고 앱을 다시 켤 때까지 측정이 막힌다. 처음이면 워치에서 권한까지
      // 허용하니 길게 기다린다
      let limit = watchStartedBefore ? WatchSnapshot.startTimeout : Self.watchFirstStartTimeout
      let timeout = Task { @MainActor in
        try await Task.sleep(nanoseconds: UInt64(limit * 1e9))
        self.resolveWatchStart(WatchStartError())
      }
      defer { timeout.cancel() }
      try await withTaskCancellationHandler {
        try await withCheckedThrowingContinuation { continuation in
          watchStarted = continuation
          // 깨우기가 끝나길 기다리지 않는다 — 실패만 대기에 넘기고, 깨웠으면 첫 값이 대기를 푼다
          Task { @MainActor in
            do {
              try await self.store.startWatchApp(toHandle: configuration)
            } catch {
              log.error("startWatchApp failed: \(describe(error), privacy: .public)")
              if self.watchStartAttempt == attempt { self.resolveWatchStart(error) }
            }
          }
        }
      } onCancel: {
        Task { @MainActor in self.resolveWatchStart(CancellationError()) }
      }
      // 첫 값을 받고 여기로 돌아오는 사이 그 세션이 끝났거나(closeBySystem이 놓는다) 전체 초기화가
      // 왔을 수 있다(end가 표시만 하고 돌아간다) — 초기화면 아래 catch가 취소로 던진다
      guard remote != nil, !abandonedWatchStart else { throw WatchStartError() }
    } catch {
      // 전체 초기화로 취소됐으면 실패 사유와 상관없이 취소다 — 이어폰으로 넘어가면 방금 비운
      // 앱에서 측정이 시작된다
      let cancelled = abandonedWatchStart
      // 포기한 시작 — 이미 붙은 미러 세션은 닫아 워치 운동도 끝내고, 늦게 오는 세션은 adopt가 닫는다
      abandonedWatchStart = true
      if let session { closeMirrored(session) }
      abandonSegment()
      throw cancelled ? CancellationError() : error
    }
    log.notice("watch started")
    watchStartedBefore = true
    // 일시정지로 남은 측정을 잇는 거면 그 섬을 이어 쓴다
    if !hasLiveActivity { startLiveActivity() }
    // 앞 구간만으로 1분이 넘으면 이 구간은 짧아도 건강 앱에 남기게 한다 — 워치는 혼자서는 1분 미만을 버린다.
    // ponytail: 앞 구간이 1분 미만이면 워치 규칙을 따른다(합쳐서 1분을 넘겨도 짧은 워치 구간은 건강 앱에서 빠진다)
    if (carried?["elapsedSec"] as? Int ?? 0) >= Int(WatchSnapshot.minimumDuration), let session {
      Task {
        let sent = await sendCommand(WatchCommand(discard: false, keep: true), to: session)
        if session === self.session { watchKeep = sent }
      }
    }
    publish()
    return snapshot()
  }

  // 워치 시작 대기를 푼다. 첫 값(nil)·깨우기 실패·타임아웃·취소 중 먼저 온 쪽만 먹는다
  private func resolveWatchStart(_ error: Error?) {
    guard let continuation = watchStarted else { return }
    watchStarted = nil
    if let error {
      continuation.resume(throwing: error)
    } else {
      continuation.resume()
    }
  }

  // 미러 세션을 붙인다 — 핸들러와 콜백 어느 쪽이 먼저 와도 한 번만. 손을 뗐거나 이미 끝나는
  // 중(stopped·ended)인 세션은 무시하고, 붙일 수 없는 세션(포기한 시작에 늦게 왔거나 이어폰으로
  // 재는 중)은 닫아 워치 운동이 혼자 돌지 않게 한다
  private func adopt(_ workoutSession: HKWorkoutSession) -> Bool {
    if workoutSession === session { return true }
    guard workoutSession.type == .mirrored, !released.contains(workoutSession),
      workoutSession.state != .stopped, workoutSession.state != .ended
    else { return false }
    // 끊긴 사이 아이폰에서 끝낸 측정의 워치 운동이 다시 붙었다(워치는 시작 요청 없이는 운동을 열지 않으니, 시작 중이
    // 아닌데 오면 그 운동이다) — 멈추거나, 전체 초기화였으면 버리게 한다. ponytail: 지금 멈추니 건강 앱 운동은 다시
    // 붙을 때까지 이어진다(앱 기록은 끝낸 때까지) — 끝낸 시각으로 멈추려면 그 날짜로 endCollection이 되는지 실기 확인 후
    if session == nil, !isStartingOnWatch, let lostEnd {
      self.lostEnd = nil
      released.add(workoutSession)
      log.notice("closing reconnected mirror ended while disconnected")
      if lostEnd["discard"] as? Bool == true {
        Task {
          if !(await sendCommand(WatchCommand(discard: true), to: workoutSession)) {
            closeMirrored(workoutSession)
          }
        }
      } else {
        closeMirrored(workoutSession)
      }
      return false
    }
    // 워치는 새 시작 요청을 받으면 하던 세션을 닫고 새로 연다(타임아웃 뒤 재시도) — 더 새 미러
    // 세션이 오면 그쪽이 지금 측정이다. 앞 세션이 끝났다는 소식보다 먼저 올 수 있다. 끊겼던 워치가 다시 미러링해도
    // 새 세션으로 온다
    let replacesMirror = session?.type == .mirrored && !isEnding
    guard session == nil || replacesMirror, !abandonedWatchStart else {
      log.notice("closing mirror that can't be adopted")
      closeMirrored(workoutSession)
      released.add(workoutSession)
      return false
    }
    log.notice("adopt mirror replaces=\(replacesMirror) lost=\(self.isWatchLost)")
    if isStartingOnWatch { watchAnswered = true }
    // 앞 세션은 멈추지 않고 놓기만 한다. 워치는 세션을 하나만 돌려서, 앞 세션은 워치가 이미 닫았거나
    // (재시도) 같은 운동이 새 세션으로 다시 넘어온 것이다(워치 앱이 죽었다 되찾은 경우·끊겼다 다시 붙은 경우) —
    // 멈추면 이어 재던 운동이 끝난다. 재시도일 때만 앞 세션 값을 버린다
    if let previous = session {
      released.add(previous)
      if isStartingOnWatch {
        remote = nil
        samples = []
      }
    }
    isWatchLost = false
    workoutSession.delegate = self
    session = workoutSession
    builder = nil
    // 시작 대기(startOnWatch)가 아니면 앱이 죽었다 다시 뜬 사이 워치 측정이 이어져 핸들러가 다시
    // 넘긴 세션이다 — Live Activity를 띄울 쪽이 없다. 백그라운드라 거절되면 앞으로 올 때
    // recover()가 띄운다
    if !isStartingOnWatch { attachLiveActivity() }
    return true
  }

  // 멈추면 워치가 저장·정리하고 끝낸다(애플 미러링 예제와 같은 길). 시작 전이면 바로 끝낸다
  private func closeMirrored(_ mirrored: HKWorkoutSession) {
    if mirrored.state == .running || mirrored.state == .paused {
      mirrored.stopActivity(with: .now)
    } else if mirrored.state != .ended {
      mirrored.end()
    }
  }

  // reason: 자동 일시정지 사유 — 박스가 "다시 끼고 재개를 누르세요"로 안내한다. 사용자가 누르면 nil.
  // 워치와 끊긴 동안엔 워치에 닿지 않는다(박스가 버튼을 잠근다)
  func pause(reason: String? = nil) {
    guard let session, !isWatchLost else { return }
    log.notice("pause reason=\(reason ?? "user", privacy: .public)")
    pauseReason = reason
    session.pause()
  }

  // 세션 없이 일시정지로 남은 측정(suspended)이면 지금 쓸 기기로 새 구간을 열어 잇고 그 스냅샷을 돌려준다.
  // 뒤에서는 새 세션을 못 연다(errorBackgroundWorkoutSessionNotAllowed) — 그래서 섬은 이때 앱을 연다
  func resume() async throws -> [String: Any]? {
    if let session {
      guard !isWatchLost else { return nil }
      pauseReason = nil
      session.resume()
      return nil
    }
    guard !isStartingOnWatch, !isResuming else { return nil }
    expireSuspended()
    guard carried != nil else { return nil }
    isResuming = true
    defer { isResuming = false }
    let device = HeartRateModule.heartRateDevice()
    log.notice("resume suspended device=\(device ?? "none", privacy: .public)")
    do {
      let snapshot = try await startSegment(device: device)
      pauseReason = nil
      return snapshot
    } catch is CancellationError {
      // 잇는 사이 종료·전체 초기화가 왔다 — 실패 안내를 띄우지 않는다
      return nil
    }
  }

  // 이어폰으로 재는데 심박이 안 들어온다(센서 없는 이어폰·차량 오디오도 이어폰으로 잡힌다) — 사용자가 워치를 고르면 지금
  // 구간을 앞 구간으로 넘기고(시스템 종료 뒤 재개와 같은 길) 워치로 이어 잰다. 워치가 안 되면 이어폰으로 돌아가지 않고
  // 일시정지로 남아 그 까닭을 던진다
  func switchToWatch() async throws -> [String: Any]? {
    guard let session, let builder, !isEnding, !isStartingOnWatch, !isResuming else { return nil }
    log.notice("switch to watch")
    isResuming = true
    defer { isResuming = false }
    // 멈추는 사이 시스템 종료 처리(closeBySystem)가 끼어들지 않게
    isEnding = true
    if session.state == .running || session.state == .paused {
      await waitForStop(session, timeout: Self.stopTimeout)
    }
    if let segment = await finish(session, builder, keep: true) {
      carried = (carried.map { Self.merge($0, segment) } ?? segment)
        .filter { Self.summaryKeys.contains($0.key) }
    }
    releaseSegment()
    do {
      let snapshot = try await startSegment(device: "watch", fallback: false)
      pauseReason = nil
      return snapshot
    } catch is CancellationError {
      return nil
    } catch {
      // 박스·섬을 일시정지(세션 없음)로 바꾼다
      publish()
      throw error
    }
  }

  // 일시정지로 남긴 채 잊은 측정 — 시작한 지 suspendedLimit이 지났으면 거기까지로 저장하고 끝낸다. 며칠 뒤에 이어
  // 재면 그 사이가 그래프 빈 칸으로 이어 붙고 기록도 시작한 날에 붙는다
  private func expireSuspended() {
    guard session == nil, let start = carried?["startedAt"] as? Double,
      Date().timeIntervalSince1970 - start / 1000 > Self.suspendedLimit
    else { return }
    log.notice("suspended measurement expired")
    let summary = merged(nil)
    reset()
    var body: [String: Any] = ["state": "ended"]
    if let summary { body["summary"] = summary }
    send(body)
  }

  // nil은 합계 1분 미만(버림)뿐이다. 이미 끝나는 중이거나 세션이 없으면 던진다 — 그 경우 저장은
  // 먼저 끝내던 쪽이 하므로, JS가 "1분 미만" 안내를 잘못 띄우지 않게 구분한다
  // discard: 길이와 상관없이 건강 앱에도 남기지 않고 버린다(전체 초기화)
  func end(discard: Bool = false) async throws -> [String: Any]? {
    // 전체 초기화 — 일시정지로 남은 앞 구간까지 버린다(건강 앱에 남긴 것도)
    if discard {
      purge(carried)
      carried = nil
    }
    // 워치를 깨우는 중(박스는 준비 표시라 종료 버튼이 잠겨 있다 — 전체 초기화만 온다) — 시작을
    // 취소한다. 정리는 startOnWatch가 한다
    if isStartingOnWatch {
      abandonedWatchStart = true
      resolveWatchStart(CancellationError())
      return nil
    }
    // 두 번 불려도 한 번만 마무리한다 — 두 번째가 stopped를 덮어쓰면 첫 호출이 영영 안 끝난다
    guard !isEnding else { throw CancellationError() }
    guard let session else {
      // 세션 없이 일시정지로 남은 측정 — 쌓아 둔 앞 구간이 곧 요약이다
      guard carried != nil || discard else { throw CancellationError() }
      let summary = merged(nil)
      reset()
      return summary
    }
    isEnding = true
    defer { reset() }
    guard let builder else {
      return merged(await finishOnWatch(session, discard: discard), discard: discard)
    }

    if session.state == .running || session.state == .paused {
      await waitForStop(session, timeout: Self.stopTimeout)
    }
    return merged(await finish(session, builder, discard: discard), discard: discard)
  }

  // stopActivity를 걸고 stopped(또는 바로 ended)가 올 때까지 기다린다. 미러 세션은 ended까지
  // 기다린다(델리게이트 참고). stop: false면 멈추지 않고 기다리기만 한다(워치가 스스로 멈출 때)
  private func waitForStop(_ session: HKWorkoutSession, timeout: UInt64?, stop: Bool = true) async {
    stopWait += 1
    let wait = stopWait
    await withCheckedContinuation { continuation in
      stopped = continuation
      if stop { session.stopActivity(with: .now) }
      guard let timeout else { return }
      Task { @MainActor in
        try? await Task.sleep(nanoseconds: timeout)
        guard self.stopWait == wait else { return }
        self.stopped?.resume()
        self.stopped = nil
      }
    }
  }

  // 우리가 끝내든 시스템이 끝내든 같은 길로 마무리한다. 앞 구간(carried)까지 더해 1분 미만이면 건강 앱에 남기지
  // 않는다. keep(일시정지로 남겨 이어 붙일 구간)이면 짧아도 남긴다 — 뒤 구간과 합치면 1분이 넘을 수 있고, 끝내
  // 1분이 안 되면 merged가 지운다(purge). 버려도 요약은 돌려준다 — merged가 그 시작 시각부터 지운다
  private func finish(
    _ session: HKWorkoutSession, _ builder: HKLiveWorkoutBuilder, discard: Bool = false,
    keep: Bool = false
  ) async -> [String: Any]? {
    try? await builder.endCollection(at: .now)
    var summary = segmentSnapshot()

    let total = (carried?["elapsedSec"] as? Int ?? 0) + Int(builder.elapsedTime)
    let save = keep ? builder.elapsedTime >= 1 : total >= Int(WatchSnapshot.minimumDuration)
    log.notice("phone segment finished save=\(save && !discard) keep=\(keep) total=\(total)")
    if discard || !save {
      builder.discardWorkout()
      session.end()
      if !samples.isEmpty { summary?["samples"] = samples }
      return summary
    }
    // 건강 앱 저장이 실패해도(쓰기 권한 해제 등) 앱 기록은 남긴다
    let workout = try? await builder.finishWorkout()
    session.end()
    let stored = await storedSamples(of: workout)
    let all = stored.isEmpty ? samples : stored
    if !all.isEmpty { summary?["samples"] = all }
    // 건강 앱에 남은 운동의 시작 — 기록을 지울 때 이걸로 찾는다
    if let start = summary?["startedAt"] { summary?["healthStarts"] = [start] }
    return summary
  }

  // 워치 세션 종료 — 멈추면 워치가 1분 이상일 때 건강 앱에 저장하고 끝낸다. 워치는 끝내기 직전에
  // 멈춘 시각의 값을 보낸다 — 그 값까지 받고 요약을 만들어야 1분 기준이 워치와 같아, 건강 앱과
  // 앱 기록이 같이 남거나 같이 빠진다. 버려도 요약은 돌려준다 — merged가 그 시작 시각부터 지운다(앞 구간에 남긴 것)
  private func finishOnWatch(_ session: HKWorkoutSession, discard: Bool) async -> [String: Any]? {
    if isWatchLost {
      // 끊긴 미러엔 멈춤이 닿지 않는다 — 워치는 계속 재다 다시 붙으면 그때 멈춘다(adopt)
      markLostEnd(discard: discard)
      return watchSummary()
    }
    if discard, await sendCommand(WatchCommand(discard: true), to: session) {
      // 받은 워치가 스스로 멈추고 버린다 — 여기서도 멈추면 워치가 멈춤을 먼저 처리해 버리라는 말을
      // 놓칠 수 있다
      if session.state != .ended {
        await waitForStop(session, timeout: Self.stopTimeout, stop: false)
      }
    } else if session.state == .running || session.state == .paused || session.state == .stopped {
      await waitForStop(session, timeout: Self.stopTimeout, stop: session.state != .stopped)
    }
    // 답이 없었으면(연결 끊김) 여기서라도 끝낸다. 워치는 끊긴 줄 알고 계속 잴 수 있어 다시 붙으면 그때 끝낸다
    if session.state != .stopped && session.state != .ended {
      markLostEnd(discard: discard)
      session.end()
    }
    return watchSummary()
  }

  private func markLostEnd(discard: Bool) {
    guard let start = remote?.snapshot.startedAt else { return }
    lostEnd = ["start": start, "discard": discard]
  }

  // 워치에 명령을 보낸다(버리기·짧아도 남기기). 순간 끊김일 수 있어 세 번까지 보낸다. 버리라는 말이 안 닿으면 그냥
  // 멈추게 되고, 워치는 1분 이상이면 건강 앱에 저장한다
  private func sendCommand(_ command: WatchCommand, to session: HKWorkoutSession) async -> Bool {
    guard let data = try? JSONEncoder().encode(command) else { return false }
    for attempt in 0..<3 where session.state != .ended {
      if attempt > 0 { try? await Task.sleep(nanoseconds: 500_000_000) }
      if (try? await session.sendToRemoteWorkoutSession(data: data)) != nil { return true }
    }
    return false
  }

  // 워치 구간 요약. 1분 기준은 merged가 합계로 본다 — 워치도 같은 값(멈춘 시각의 경과 시간)으로 건강 앱
  // 저장을 건너뛴다. ponytail: 답이 없어(연결 끊김) 그 값을 못 받으면 마지막으로 받은 값으로 재서 1분
  // 언저리에선 어긋날 수 있다
  private func watchSummary() -> [String: Any]? {
    guard var summary = remoteSnapshot(), let remote else { return nil }
    // 마지막으로 받은 경과 시간을 그대로 쓴다 — 워치가 저장하는 동안 흐른 시간은 잰 시간이 아니고, 칼로리·심박도
    // 그 시점 값이다. 끊긴 채 끝내면 워치는 그동안에도 재고 있었으니 지금까지 흐른 시간(화면에 보이던 시간)으로 둔다
    if !isWatchLost { summary["elapsedSec"] = remote.snapshot.elapsedSec }
    if !samples.isEmpty { summary["samples"] = samples }
    // 워치는 1분 이상이면(keep이면 짧아도) 건강 앱에 저장한다 — 기록을 지울 때 이 시작으로 찾는다
    if (summary["elapsedSec"] as? Int ?? 0) >= Int(WatchSnapshot.minimumDuration) || watchKeep {
      summary["healthStarts"] = [remote.snapshot.startedAt]
    }
    return summary
  }

  // 앞 구간(carried)과 합친 최종 요약. 합계 1분 미만이면(실수로 누른 것으로 본다) 또는 discard(전체 초기화)면
  // 남기지 않고 nil — 그때 이 측정이 건강 앱에 남긴 것도 지운다
  private func merged(_ segment: [String: Any]?, discard: Bool = false) -> [String: Any]? {
    let summary = carried.map { carried in segment.map { Self.merge(carried, $0) } ?? carried } ?? segment
    if !discard, (summary?["elapsedSec"] as? Int ?? 0) >= Int(WatchSnapshot.minimumDuration) {
      return summary
    }
    purge(summary)
    return nil
  }

  // 측정이 건강 앱에 남긴 것을 지운다 — 이어 붙이려고 저장해 둔 앞 구간 운동, discardWorkout이 남긴 샘플
  // (HKWorkoutBuilder.h: 운동만 버리고 샘플은 안 지운다). 이 앱 출처의 측정 시작부터 지금까지를
  // 지운다 — 측정은 한 번에 하나라 그 사이 이 앱이 남긴 건 이 측정 것뿐이다. 워치 앱이 남긴 건 워치가 지운다
  private func purge(_ summary: [String: Any]?) {
    guard let startedAt = summary?["startedAt"] as? Double else { return }
    let predicate = NSCompoundPredicate(andPredicateWithSubpredicates: [
      HKQuery.predicateForObjects(from: .default()),
      HKQuery.predicateForSamples(
        withStart: Date(timeIntervalSince1970: startedAt / 1000 - 1), end: .now,
        options: .strictStartDate),
    ])
    log.notice("purge")
    Task {
      for type in [.workoutType(), Self.heartRate, Self.activeEnergy, Self.basalEnergy] as [HKSampleType] {
        _ = try? await store.deleteObjects(of: type, predicate: predicate)
      }
    }
  }

  // 두 구간을 하나로(a가 앞). 시간·칼로리는 더하고, 심박은 전체 최소·최대, 평균은 잰 시간으로 가중한다.
  // 그래프 샘플은 b가 a보다 늦게 시작한 만큼 밀어 붙인다(멈춘 동안은 빈 칸). 나머지 키는 b(지금 구간)를 따른다
  private static func merge(_ a: [String: Any], _ b: [String: Any]) -> [String: Any] {
    var body = b
    let aSec = a["elapsedSec"] as? Int ?? 0
    let bSec = b["elapsedSec"] as? Int ?? 0
    let aStart = a["startedAt"] as? Double ?? 0
    let bStart = b["startedAt"] as? Double ?? aStart
    body["startedAt"] = aStart
    body["elapsedSec"] = aSec + bSec
    for key in ["activeKcal", "totalKcal"] {
      body[key] = (a[key] as? Int ?? 0) + (b[key] as? Int ?? 0)
    }
    if let low = [a["minHR"], b["minHR"]].compactMap({ $0 as? Int }).min() { body["minHR"] = low }
    if let high = [a["maxHR"], b["maxHR"]].compactMap({ $0 as? Int }).max() { body["maxHR"] = high }
    let averages = [(a["avgHR"] as? Int, aSec), (b["avgHR"] as? Int, bSec)].compactMap {
      average, sec in average.map { ($0, sec) }
    }
    let weight = averages.reduce(0) { $0 + $1.1 }
    if weight > 0 { body["avgHR"] = averages.reduce(0) { $0 + $1.0 * $1.1 } / weight }
    let offset = max(0, Int((bStart - aStart) / 1000))
    let later = (b["samples"] as? [[Int]] ?? []).compactMap { $0.count == 2 ? [$0[0] + offset, $0[1]] : nil }
    let samples = (a["samples"] as? [[Int]] ?? []) + later
    body["samples"] = samples.isEmpty ? nil : samples
    let starts = (a["healthStarts"] as? [Double] ?? []) + (b["healthStarts"] as? [Double] ?? [])
    body["healthStarts"] = starts.isEmpty ? nil : starts
    return body
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

  // 우리가 끝내지 않았는데 닫힌 경우. 버리면 몇십 분 기록이 조용히 사라진다.
  // suspendable: false면 일시정지로 남기지 않고 마무리한다(복구했더니 이미 끝나던 세션)
  private func closeBySystem(
    _ session: HKWorkoutSession, error: Error? = nil, suspendable: Bool = true
  ) {
    guard let builder else {
      // 워치 세션: 시작을 기다리던 중이면 놓고 잠깐 더 기다린다 — 재시도라 워치가 앞 세션을 닫았으면
      // 곧 새 세션이 온다. 안 오면 워치에서 시작이 실패해 끝낸 것이니 바로 실패로 넘긴다
      if isStartingOnWatch {
        closeMirrored(session)
        abandonSegment()
        let attempt = watchStartAttempt
        Task { @MainActor in
          try? await Task.sleep(nanoseconds: Self.watchReplaceWait)
          guard self.watchStartAttempt == attempt, self.session == nil else { return }
          self.resolveWatchStart(WatchStartError())
        }
        return
      }
      // 워치에서 끝냈다(종료 버튼·실패). 건강 앱 저장은 워치가 맡고 여기선 요약만 남긴다. 혹시 남았으면
      // 여기서도 닫는다. 연결이 끊긴 건 여기로 오지 않는다 — 다시 붙기를 기다린다(isWatchLost)
      log.notice("watch session closed by watch")
      let summary = merged(watchSummary())
      closeMirrored(session)
      reset()
      var body: [String: Any] = ["state": "ended"]
      if let summary { body["summary"] = summary }
      send(body)
      return
    }
    // 다른 운동 앱이 세션을 가져간 게 아니면 측정은 끝내지 않는다 — 에어팟을 빼면 iOS가 아이폰 세션을 끝낸다
    // (2026-10 실기: 섬이 사라지고 기록이 저장됐다). 이 구간은 저장하고 측정은 세션 없는 일시정지(suspended)로
    // 남겨, 재개(새 세션)와 종료를 사용자가 고르게 한다
    let suspend = suspendable && (error as? HKError)?.code != .errorAnotherWorkoutSessionStarted
    log.notice(
      "phone session closed by system error=\(describe(error), privacy: .public) suspend=\(suspend)")
    isEnding = true
    Task {
      let segment = await finish(session, builder, keep: suspend)
      guard suspend, let segment else {
        let summary = merged(segment)
        reset()
        var body: [String: Any] = ["state": "ended"]
        if let summary { body["summary"] = summary }
        send(body)
        return
      }
      carried = (carried.map { Self.merge($0, segment) } ?? segment)
        .filter { Self.summaryKeys.contains($0.key) }
      if pauseReason == nil, !HeartRateModule.hasEarphones() { pauseReason = "earphonesRemoved" }
      releaseSegment()
      publish()
    }
  }

  // 워치가 아이폰과 끊긴 채 운동을 끝냈다 — 마지막 값이 WCSession으로 왔다(WatchState). 끊긴 그 측정을 기다리고
  // 있었으면 이 값으로 마무리한다. 그 사이 앱이 죽어 측정을 잃었으면 이걸로라도 기록을 남긴다(일시정지로 남은 앞
  // 구간이 있으면 합친다). 아이폰에서 이미 끝낸 측정이면 버린다
  func watchFinished(_ final: WatchSnapshot) {
    if lostEnd?["start"] as? Double == final.startedAt {
      lostEnd = nil
      return
    }
    guard !isStartingOnWatch, !isResuming, !isEnding else { return }
    if let session {
      guard session.type == .mirrored, remote?.snapshot.startedAt == final.startedAt else { return }
    } else if let start = carried?["startedAt"] as? Double, final.startedAt < start {
      return
    }
    log.notice("watch finished while disconnected")
    let current = session != nil || carried != nil
    remote = (final, Date())
    isWatchLost = false
    var summary = watchSummary()
    if current {
      summary = merged(summary)
    } else if (summary?["elapsedSec"] as? Int ?? 0) < Int(WatchSnapshot.minimumDuration) {
      // 잃었던 측정이면 그 사이 다른 측정이 있었을 수 있어 건강 앱은 건드리지 않고 기록만 안 남긴다
      summary = nil
    }
    reset()
    var body: [String: Any] = ["state": "ended"]
    if let summary { body["summary"] = summary }
    send(body)
  }

  // 기록 삭제 — 이 앱(아이폰·워치)이 저장한 운동을 시작 시각(앱 기록은 초 단위로 잘려 있다)으로
  // 찾아 딸린 샘플까지 지운다. 준비에 3초가 걸려 1초 창 안에 운동이 둘 있을 수 없다.
  // "deleted" | "notFound" | "failed". 앱은 자기가 저장한 것만 지울 수 있어(HealthKit 문서) 워치 앱이
  // 저장한 운동은 못 지울 수 있다 — 그땐 "failed"로 JS가 건강 앱에서 지우라고 안내한다.
  // ponytail: 실기에서 워치 운동이 실제로 안 지워지면 워치 앱이 지우게 넘길 것(WCSession)
  func deleteWorkout(startedAt: Date) async -> String {
    let predicate = NSCompoundPredicate(andPredicateWithSubpredicates: [
      HKQuery.predicateForObjects(from: await ownSources()),
      HKQuery.predicateForSamples(
        withStart: startedAt, end: startedAt.addingTimeInterval(1), options: .strictStartDate),
    ])
    let query = HKSampleQueryDescriptor(predicates: [.workout(predicate)], sortDescriptors: [])
    guard let workouts = try? await query.result(for: store), !workouts.isEmpty else {
      return "notFound"
    }
    // 한 번에 지우면 하나만 실패해도 전부 안 지워진다 — 하나씩 지운다
    var failed = false
    for workout in workouts {
      let attached = HKQuery.predicateForObjects(from: workout)
      for type in [Self.heartRate, Self.activeEnergy, Self.basalEnergy] {
        _ = try? await store.deleteObjects(of: type, predicate: attached)
      }
      // 3.5.x는 워치로 잴 때 에어팟 백업 세션을 같이 돌렸다 — 그 심박이 운동에 딸리지 않고 이 앱 출처로 남아
      // 있다(그때 남긴 기록을 지울 때)
      let backup = NSCompoundPredicate(andPredicateWithSubpredicates: [
        HKQuery.predicateForObjects(from: .default()),
        HKQuery.predicateForSamples(
          withStart: workout.startDate, end: workout.endDate, options: .strictStartDate),
      ])
      _ = try? await store.deleteObjects(of: Self.heartRate, predicate: backup)
      if (try? await store.delete([workout])) == nil { failed = true }
    }
    return failed ? "failed" : "deleted"
  }

  // 이 앱과 워치 앱(번들 ID가 "앱 번들 ID." 로 시작) 출처. 못 읽으면 이 앱 출처만
  private func ownSources() async -> Set<HKSource> {
    let app = Bundle.main.bundleIdentifier ?? ""
    let sources = (try? await HKSourceQueryDescriptor(predicate: .workout()).result(for: store)) ?? []
    return Set(sources.filter { $0.bundleIdentifier.hasPrefix(app + ".") }).union([.default()])
  }

  func recover() async -> [String: Any]? {
    // 워치 시작 대기·재개 중엔 아직 새 구간 전이다 — 스냅샷을 주면 JS가 "측정 중"으로 그린다. 잇는 중인
    // 측정이 있으면 그 값(일시정지)을 그대로 보여준다
    if isStartingOnWatch || isResuming { return carried != nil ? suspendedSnapshot() : nil }
    // 되찾을 아이폰 세션. 워치 측정은 여기서 못 되찾는다 — 미러링 핸들러가 다시 넘긴다
    var recovered: HKWorkoutSession?
    if session == nil {
      recovered = (try? await store.recoverActiveWorkoutSession()) ?? nil
      // 되찾는 사이 재개·워치 시작이 들어왔다(섬의 재개 링크는 앱이 앞으로 오는 것과 같이 온다) — 그쪽이 붙인 준비
      // 중인 세션은 아직 측정 중이 아니라, 아래로 가면 nil을 돌려 박스가 접힌다
      if isStartingOnWatch || isResuming { return carried != nil ? suspendedSnapshot() : nil }
    }
    if session != nil {
      // 준비 3초 사이 앱이 뒤로 가면 Live Activity 요청이 거절된다(앞에 있을 때만 된다) —
      // 돌아왔을 때 다시 띄운다. 안 그러면 이 세션 내내 아일랜드·잠금화면이 없다
      if isLive, !isEnding, !hasLiveActivity {
        attachLiveActivity()
        publish()
      }
      return isLive ? snapshot() : nil
    }
    guard let recovered else {
      expireSuspended()
      // 세션 없이 일시정지로 남은 측정 — 섬을 다시 붙이고 그대로 보여준다(재개·종료는 사용자가)
      if carried != nil, session == nil {
        attachLiveActivity()
        publish()
        return suspendedSnapshot()
      }
      // 워치 측정은 여기서 되찾지 못한다 — 이어지고 있으면 미러링 핸들러가 곧 세션을 다시
      // 넘긴다(adopt). 그 전에 섬을 끝내면 섬이 사라지고 섬 버튼도 듣지 않는다. 남은 섬이 있을
      // 때만 잠깐 기다린다. ponytail: 핸들러가 3초 안에 온다고 본다 — 실기에서 늦으면 늘릴 것
      if !Activity<HeartRateAttributes>.activities.isEmpty {
        for _ in 0..<15 where session == nil {
          try? await Task.sleep(nanoseconds: 200_000_000)
        }
      }
      // 앱이 죽은 사이 세션이 끝났으면 아일랜드에 멈춘 숫자만 남아 있다. 기다리는 사이 붙은 세션이
      // 이어 쓰는 섬만 남긴다 — 그 사이 시작을 눌렀으면 새 섬을 띄우니 남은 섬은 전부 멈춘 것이다.
      // 끝날 때까지 기다려야 뒤이어 붙는 세션이 끝나는 중인 섬을 집어 쓰지 않는다
      for activity in Activity<HeartRateAttributes>.activities where activity.id != self.activity?.id {
        await activity.end(nil, dismissalPolicy: .immediate)
      }
      return session != nil ? await recover() : nil
    }
    // 되찾는 사이 다른 호출(아일랜드 버튼·JS getActive)이 먼저 붙였으면 그쪽을 쓴다 — 덮어쓰면 진행
    // 중인 종료가 기다리는 세션이 바뀌어 종료가 끝나지 않는다(워치 쪽 WatchWorkout.recover와 같다)
    guard session == nil else { return await recover() }
    log.notice("recover: phone session state=\(recovered.state.name, privacy: .public)")
    let builder = recovered.associatedWorkoutBuilder()
    // 세션과 빌더는 복구되지만 데이터 소스는 새로 붙여야 한다 (WWDC25 #322)
    builder.dataSource = HKLiveWorkoutDataSource(
      healthStore: store, workoutConfiguration: recovered.workoutConfiguration)
    recovered.delegate = self
    builder.delegate = self
    session = recovered
    self.builder = builder
    // 멈췄거나(stopped) 이미 끝난 세션이 돌아올 때가 있다 — 그대로 붙이면 "측정 중 0:03"
    // 박스와 아무도 갱신하지 않는 Live Activity가 생긴다. 종료와 같은 길로 정리한다(남은 섬도 닫는다)
    guard isLive else {
      activity = Activity<HeartRateAttributes>.activities.first
      closeBySystem(recovered, suspendable: false)
      return nil
    }
    // 끝났거나 치운 섬은 건너뛰고 살아 있는 것을 이어 쓴다
    attachLiveActivity()
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
      guard self.adopt(workoutSession) else { return }
      log.notice(
        "\(workoutSession.type == .mirrored ? "watch" : "phone", privacy: .public) \(fromState.name, privacy: .public)->\(toState.name, privacy: .public)"
      )
      // 끊긴 미러 세션은 더는 쓸 수 없다 — 그 상태 변화로 측정을 끝내지 않고 워치가 다시 붙기를 기다린다
      if self.isWatchLost { return }
      // 종료를 기다리는 중 시스템이 stopped를 건너뛰고 바로 끝내도 풀어준다 — 안 풀면 end()가
      // 영영 안 끝나 앱을 다시 켜기 전까지 측정을 시작할 수 없다. 워치 세션(빌더 없음)은 ended까지
      // 기다린다 — 워치가 멈춘 뒤 마지막 값을 보내고 끝낸다
      let closed = toState == .ended || (toState == .stopped && self.builder != nil)
      if closed {
        self.stopped?.resume()
        self.stopped = nil
      }
      // 아이폰·워치·섬 어디서 재개하든 자동 일시정지 사유를 지운다
      if toState == .running, fromState == .paused { self.pauseReason = nil }
      // 시스템이 닫았다. 아이폰 세션은 멈춤(stopped)에서 끝나지 않고 남을 때가 있어 그때도 마무리한다 —
      // 남겨 두면 다음 시작이 조용히 막힌다
      if closed, !self.isEnding {
        self.closeBySystem(workoutSession)
        return
      }
      self.publish()
    }
  }

  nonisolated func workoutSession(_ workoutSession: HKWorkoutSession, didFailWithError error: Error) {
    Task { @MainActor in
      guard workoutSession === self.session else { return }
      log.error("session failed: \(describe(error), privacy: .public)")
      self.stopped?.resume()
      self.stopped = nil
      guard !self.isEnding, !self.isWatchLost else { return }
      self.closeBySystem(workoutSession, error: error)
    }
  }

  nonisolated func workoutBuilder(
    _ workoutBuilder: HKLiveWorkoutBuilder, didCollectDataOf collectedTypes: Set<HKSampleType>
  ) {
    Task { @MainActor in
      guard workoutBuilder === self.builder else { return }
      self.recordSample()
      self.publishSoon()
    }
  }

  nonisolated func workoutBuilderDidCollectEvent(_ workoutBuilder: HKLiveWorkoutBuilder) {
    Task { @MainActor in self.publishSoon() }
  }

  // 워치가 보낸 값. 여러 개 묶여 오면 그래프엔 전부 쌓고 화면엔 마지막(최신)을 쓴다. 끝내는
  // 중에도 받는다 — 워치가 멈춘 시각의 마지막 값으로 요약을 만든다(finishOnWatch)
  nonisolated func workoutSession(
    _ workoutSession: HKWorkoutSession, didReceiveDataFromRemoteWorkoutSession data: [Data]
  ) {
    let snapshots = data.compactMap { try? JSONDecoder().decode(WatchSnapshot.self, from: $0) }
    guard let latest = snapshots.last else { return }
    Task { @MainActor in
      guard self.adopt(workoutSession) else { return }
      snapshots.forEach(self.recordRemoteSample)
      self.remote = (latest, Date())
      // 첫 값이 오면 워치로 시작된 것이다
      self.resolveWatchStart(nil)
      self.publish()
    }
  }

  // 미러링이 끊겼다(폰을 사물함에 둔 경우 등) — 워치는 계속 재면서 다시 미러링을 건다(WatchWorkout.reconnect).
  // 측정을 끝내지 않고 기다린다: 다시 붙으면 새 미러 세션이 이어 받고(adopt), 끊긴 채 워치에서 끝내면 마지막 값이
  // WCSession으로 온다(watchFinished). 시작을 기다리던 중이면 실패로 넘긴다
  nonisolated func workoutSession(
    _ workoutSession: HKWorkoutSession, didDisconnectFromRemoteDeviceWithError error: Error?
  ) {
    Task { @MainActor in
      guard workoutSession === self.session, !self.isEnding, !self.isWatchLost else { return }
      log.notice("watch disconnected: \(describe(error), privacy: .public)")
      guard !self.isStartingOnWatch else { return self.closeBySystem(workoutSession) }
      self.isWatchLost = true
      self.publish()
    }
  }

  // MARK: - 상태

  // 준비(prepared) 중이면 아직, 멈춤(stopped) 뒤면 이미 "측정 중"이 아니다. 미러 세션은 워치
  // 세션의 상태를 그대로 따라간다. 세션 없이 일시정지로 남은 측정(suspended)도, 끊긴 워치를 기다리는 측정도
  // 측정 중이다
  private var isLive: Bool {
    guard let session else { return carried != nil }
    return isWatchLost || session.state == .running || session.state == .paused
  }

  // 워치 심박을 지금 믿을 수 있나 — 끊겼거나 심박이 오래됐으면 아니다
  private var watchUsable: Bool {
    guard !isWatchLost, let remote, remote.snapshot.heartRate != nil else { return false }
    return Date().timeIntervalSince(remote.at) < WatchSnapshot.heartRateFreshness
  }

  func send(_ body: [String: Any]) {
    if emit?(body) == true { return }
    if body["summary"] != nil { pendingEnded.append(body) }
  }

  // JS가 onUpdate를 듣기 시작하면 모듈이 부른다
  func flushPending() {
    let pending = pendingEnded
    guard !pending.isEmpty else { return }
    pendingEnded = []
    for body in pending { send(body) }
  }

  // 구간(세션 하나)에 딸린 상태만 비운다 — 측정(앞 구간 carried·섬·일시정지 사유)은 남는다
  private func releaseSegment() {
    if let session { released.add(session) }
    session = nil
    builder = nil
    stopped = nil
    isEnding = false
    seenMin = nil
    seenMax = nil
    samples = []
    lastSampleAt = nil
    remote = nil
    isWatchLost = false
    watchKeep = false
  }

  // 측정을 통째로 치운다
  private func reset() {
    releaseSegment()
    endLiveActivity()
    carried = nil
    pauseReason = nil
  }

  // 시작하다 실패한 구간을 치운다 — 이어 붙일 앞 구간(carried)이 있으면 그 측정·섬은 남긴다
  private func abandonSegment() {
    if carried == nil { reset() } else { releaseSegment() }
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

  // 워치 값도 같은 모양(시작 후 실제 흐른 초)으로 쌓는다. elapsedSec는 일시정지를 뺀 시간이라 그대로
  // 쓰면 그래프와 시각 라벨이 멈춘 만큼 당겨진다 — 경과 0초였던 시각(timerStart)과 시작 시각의 차가
  // 그동안 멈춘 시간이다. 일시정지 중 값·같은 초에 온 값(칼로리만 바뀐 갱신)은 건너뛴다
  private func recordRemoteSample(_ snapshot: WatchSnapshot) {
    let pausedSec = ((snapshot.timerStart ?? snapshot.startedAt) - snapshot.startedAt) / 1000
    let sec = snapshot.elapsedSec + Int(pausedSec)
    guard let heartRate = snapshot.heartRate, !snapshot.paused, samples.last?.first != sec else {
      return
    }
    samples.append([sec, heartRate])
  }

  // 화면용 값 — 앞 구간(carried)을 더한다. 세션 없이 일시정지로 남은 측정이면 그 값 그대로
  private func snapshot() -> [String: Any]? {
    guard session != nil else { return suspendedSnapshot() }
    guard var body = segmentSnapshot() else { return nil }
    if var head = carried {
      // 화면 갱신마다 앞 구간 그래프 샘플까지 이어 붙여 보낼 필요는 없다
      head["samples"] = nil
      head["healthStarts"] = nil
      body = Self.merge(head, body)
    }
    // 워치가 심박을 못 읽어 스스로 멈췄으면 그렇게 안내한다(WatchSnapshot.wrist)
    let reason = pauseReason ?? (remote?.snapshot.wrist == false ? "watchNoSignal" : nil)
    if body["state"] as? String == "paused", let reason { body["pauseReason"] = reason }
    return body
  }

  // 세션 없이 일시정지로 남은 측정(suspended)
  private func suspendedSnapshot() -> [String: Any]? {
    guard var body = carried else { return nil }
    body["samples"] = nil
    body["healthStarts"] = nil
    body["state"] = "paused"
    body["suspended"] = true
    if let pauseReason { body["pauseReason"] = pauseReason }
    return body
  }

  // 지금 구간(세션 하나)만의 값
  private func segmentSnapshot() -> [String: Any]? {
    guard let session else { return nil }
    guard let builder else { return remoteSnapshot() }
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
      "source": "phone",
      "state": session.state == .paused ? "paused" : "running",
      "activeKcal": Int(active.rounded()),
      "totalKcal": Int((active + basal).rounded()),
      "elapsedSec": Int(builder.elapsedTime),
      "startedAt": (builder.startDate ?? Date()).timeIntervalSince1970 * 1000,
    ]
    if let at = heart?.mostRecentQuantityDateInterval()?.end,
      Date().timeIntervalSince(at) < WatchSnapshot.heartRateFreshness,
      let latest = toBpm(heart?.mostRecentQuantity())
    {
      body["heartRate"] = latest
    }
    if let low = toBpm(heart?.minimumQuantity()) ?? seenMin { body["minHR"] = low }
    if let high = toBpm(heart?.maximumQuantity()) ?? seenMax { body["maxHR"] = high }
    if let average = toBpm(heart?.averageQuantity()) { body["avgHR"] = average }
    return body
  }

  // 워치가 마지막으로 보낸 값을 지금 기준으로 맞춘다 — 경과 시간은 워치가 잰 기준 시각으로 세고
  // (JS는 돌려받은 시각부터 이어 센다), 그동안 소식이 없었으면 그 심박은 "지금" 값이 아니다
  private func remoteSnapshot() -> [String: Any]? {
    guard let remote else { return nil }
    let snapshot = remote.snapshot
    let age = Date().timeIntervalSince(remote.at)
    // 일시정지는 미러 세션 상태를 따른다 — 아이폰에서 누르면 워치의 다음 값보다 먼저 바뀐다
    let paused = session?.state == .paused
    // 막 멈췄거나 막 재개해 워치 값이 아직 그 전 상태면 마지막으로 받은 경과 시간에 둔다
    // timerStart가 없으면(그걸 안 보내는 워치 앱) 받은 뒤 흐른 시간을 더한다
    let elapsed =
      paused || snapshot.paused
      ? snapshot.elapsedSec
      : snapshot.timerStart.map { max(0, Int(Date().timeIntervalSince1970 - $0 / 1000)) }
        ?? snapshot.elapsedSec + Int(age)
    var body: [String: Any] = [
      "source": "watch",
      "state": paused ? "paused" : "running",
      "activeKcal": snapshot.activeKcal,
      "totalKcal": snapshot.totalKcal,
      "elapsedSec": elapsed,
      "startedAt": snapshot.startedAt,
    ]
    if watchUsable, let heartRate = snapshot.heartRate { body["heartRate"] = heartRate }
    // 워치와 끊겼다 — 박스가 "워치는 계속 재고 있다"를 안내하고 일시정지를 잠근다(워치에 닿지 않는다)
    if isWatchLost { body["watchLost"] = true }
    if let low = snapshot.minHR { body["minHR"] = low }
    if let high = snapshot.maxHR { body["maxHR"] = high }
    if let average = snapshot.avgHR { body["avgHR"] = average }
    return body
  }

  // 수집 콜백은 심박·활동·기초 칼로리가 따로, 거의 동시에 온다 — 잠깐 모아 한 번만 내보낸다(워치의
  // sendSoon과 같다). 매번 내보내면 JS 다시 그리기·Live Activity 갱신이 겹쳐 순서가 뒤바뀔 수도 있다
  private func publishSoon() {
    guard !publishPending else { return }
    publishPending = true
    Task {
      try? await Task.sleep(nanoseconds: 300_000_000)
      publishPending = false
      publish()
    }
  }

  private func publish() {
    // 준비 중(prepared)에 보내면 JS가 "측정 중"으로 그렸다가, 실제 시작 때 시간이 0으로 되돌아간다
    guard !isEnding, isLive, let body = snapshot() else { return }
    // 화면이 안 보이는 동안 샘플마다 JS를 깨워 박스를 다시 그릴 이유가 없다 — 돌아오면
    // JS가 getActive로 다시 맞춘다. Live Activity는 이때가 제일 중요하니 계속 갱신한다
    if UIApplication.shared.applicationState == .active { send(body) }

    let paused = body["state"] as? String == "paused"
    let elapsedSec = body["elapsedSec"] as? Int ?? 0
    let state = HeartRateAttributes.ContentState(
      heartRate: body["heartRate"] as? Int,
      activeKcal: body["activeKcal"] as? Int ?? 0,
      totalKcal: body["totalKcal"] as? Int ?? 0,
      // 일시정지 중엔 위젯이 pausedElapsed만 그린다 — 변하지 않는 시작 시각을 둬야 "안 바뀌면
      // 건너뛰기"가 먹는다
      timerStart: paused
        ? Date(timeIntervalSince1970: (body["startedAt"] as? Double ?? 0) / 1000)
        : timerStart(elapsedSec),
      pausedElapsed: paused ? elapsedSec : nil,
      suspended: body["suspended"] as? Bool
    )
    pushLiveActivity(state, paused: paused)
  }

  // 위젯 타이머의 기준 시각(경과 0초였던 때). 정수 초인 경과 시간에서 거꾸로 구하면 갱신마다
  // 1초씩 흔들려 섬의 시간이 뒤로 갔다 앞으로 튄다 — 빌더·워치가 잰 시각을 바로 쓴다. 측정 중엔
  // 변하지 않으니 ms로 맞춰 "안 바뀌면 건너뛰기"가 먹게 한다. 앞 구간(carried)은 정수 초 그대로 뺀다
  private func timerStart(_ elapsedSec: Int) -> Date {
    let now = Date()
    let carriedSec = TimeInterval(carried?["elapsedSec"] as? Int ?? 0)
    // 워치가 막 재개해 아직 멈춘 값만 보냈을 때만 정수 초에서 센다
    var seconds = now.timeIntervalSince1970 - TimeInterval(elapsedSec)
    if let builder {
      seconds = now.timeIntervalSince1970 - builder.elapsedTime(at: now) - carriedSec
    } else if let snapshot = remote?.snapshot, !snapshot.paused, let start = snapshot.timerStart {
      seconds = start / 1000 - carriedSec
    }
    return Date(timeIntervalSince1970: (seconds * 1000).rounded() / 1000)
  }

  // MARK: - Live Activity

  // 끝난 활동(recover가 이전 프로세스 것을 정리한 경우 등)을 들고 있으면 갱신이 허공으로 간다.
  // 사용자가 잠금화면에서 치운(dismissed) 건 그대로 둔다 — 다시 띄우면 치운 뜻을 거스른다
  private var hasLiveActivity: Bool {
    guard let state = activity?.activityState else { return false }
    return state != .ended
  }

  // 살아 있는 활동이 있으면(앱이 죽기 전에 띄운 것) 이어 쓰고, 없으면 새로 띄운다
  private func attachLiveActivity() {
    guard !hasLiveActivity else { return }
    activity = Activity<HeartRateAttributes>.activities.first {
      $0.activityState == .active || $0.activityState == .stale
    }
    lastPushed = nil
    if activity == nil { startLiveActivity() }
  }

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
