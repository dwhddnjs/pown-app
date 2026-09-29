import ActivityKit
import Foundation

// 앱 쪽(modules/heart-rate/ios)에 똑같은 파일이 있다. ActivityKit은 타입 이름으로
// 앱과 위젯을 잇는데, 모듈 pod과 위젯 타깃은 소스를 공유할 수 없어 복사해 둔다.
// 필드를 바꾸면 두 파일을 같이 고칠 것.
@available(iOS 16.1, *)
struct HeartRateAttributes: ActivityAttributes {
  struct ContentState: Codable, Hashable {
    // 최근 30초 안에 들어온 심박이 없으면 nil (에어팟을 뺐거나 미지원 기기)
    var heartRate: Int?
    var activeKcal: Int
    var totalKcal: Int
    // "지금 - 경과시간". Text(timerInterval:)이 알아서 세므로 매초 갱신하지 않는다
    var timerStart: Date
    // 일시정지 중이면 멈춘 시점의 경과 초. 이때는 타이머 대신 이 값을 그린다
    var pausedElapsed: Int?
  }
}
