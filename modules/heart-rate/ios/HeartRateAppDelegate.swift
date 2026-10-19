import ExpoModulesCore
import UserNotifications

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
    // 휴식 알림을 앱을 보고 있을 때도 배너로 띄운다 — delegate가 없으면 iOS는 앞에 있는 앱의 알림을
    // 숨긴다. 실행이 끝나기 전에 걸어야 한다(UNUserNotificationCenterDelegate 문서)
    UNUserNotificationCenter.current().delegate = ForegroundNotifications.shared
    return true
  }
}

// center.delegate는 weak라 여기서 붙잡아 둔다
final class ForegroundNotifications: NSObject, UNUserNotificationCenterDelegate {
  static let shared = ForegroundNotifications()

  // completion 버전으로 둔다 — async 버전은 액터 밖에서 돌아 시스템 completion을 메인이 아닌 스레드에서
  // 부를 수 있다
  func userNotificationCenter(
    _ center: UNUserNotificationCenter, willPresent notification: UNNotification,
    withCompletionHandler completionHandler: @escaping (UNNotificationPresentationOptions) -> Void
  ) {
    completionHandler([.banner, .list, .sound])
  }
}
