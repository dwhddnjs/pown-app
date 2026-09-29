import AppIntents
import Foundation

// 아일랜드·잠금화면의 일시정지·종료 버튼. LiveActivityIntent는 앱 프로세스에서 실행되므로
// 이 파일은 앱과 위젯 타깃 둘 다에 들어가야 한다 — _shared 폴더는 @bacons/apple-targets가
// 둘 다에 링크한다(파일을 추가·삭제하면 prebuild를 다시 돌릴 것).
// 세션은 HeartRate 모듈(pod)이 쥐고 있는데 이 파일은 위젯에도 컴파일돼 그 pod를 import할 수
// 없다 — 알림만 보내고 모듈이 받는다(modules/heart-rate/ios/HeartRateModule.swift, 이름을 같게)
@available(iOS 17.0, *)
struct HeartRateControlIntent: LiveActivityIntent {
  static let title: LocalizedStringResource = "Heart rate control"
  // 단축어 앱에 노출하지 않는다 — 버튼 전용
  static let isDiscoverable = false

  // pause · resume · end
  @Parameter(title: "Action")
  var action: String

  init() {}

  init(action: String) {
    self.action = action
  }

  func perform() async throws -> some IntentResult {
    NotificationCenter.default.post(
      name: Notification.Name("HeartRateControl"), object: nil, userInfo: ["action": action])
    return .result()
  }
}
