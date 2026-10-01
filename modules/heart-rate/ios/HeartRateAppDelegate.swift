import ExpoModulesCore

// 워치가 미러링을 넘길 때 아이폰 앱이 꺼져 있으면 시스템이 백그라운드로 깨워 핸들러를 부른다 —
// JS·모듈이 뜨기 전, 실행 직후에 걸어 둬야 그 세션을 받는다 (WWDC23 #10023)
public class HeartRateAppDelegate: ExpoAppDelegateSubscriber {
  public func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil
  ) -> Bool {
    if #available(iOS 26.0, *) {
      MainActor.assumeIsolated { _ = WorkoutManager.shared }
    }
    WatchState.shared.activate()
    return true
  }
}
