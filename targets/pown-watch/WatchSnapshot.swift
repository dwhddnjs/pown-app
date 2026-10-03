import Foundation

// 워치 ↔ 아이폰 미러링으로 주고받는 데이터. 모듈(modules/heart-rate/ios/WatchSnapshot.swift)에
// 똑같은 파일이 있다 — 워치 타깃과 모듈 pod은 소스를 공유할 수 없어 복사해 둔다.
// 필드를 바꾸면 두 파일을 같이 고칠 것. 한쪽만 바뀌면 디코딩이 실패해 받는 쪽이 그 값을 버린다
// (엉뚱한 값이 화면에 가지 않는다).

// 워치 → 아이폰: 갱신마다 보내는 측정값
struct WatchSnapshot: Codable {
  // 이보다 오래된 심박은 "지금" 값으로 보내지도, 보여주지도 않는다 (아이폰 측정과 같은 기준)
  static let heartRateFreshness: TimeInterval = 30
  // 1분이 안 되는 세션은 실수로 누른 것으로 보고 건강 앱에도, 기록에도 남기지 않는다
  static let minimumDuration: TimeInterval = 60
  // 워치를 깨운 뒤 아이폰에 첫 값이 닿기까지의 한도. 넘기면 아이폰은 시작을 포기하고, 워치도
  // 혼자 돌지 않게 스스로 끝낸다. 첫 사용 땐 워치에서 건강 권한을 허용하는 시간까지 든다.
  // ponytail: 실기에서 재 보고 조정할 것
  static let startTimeout: TimeInterval = 30

  var paused: Bool
  var heartRate: Int?
  var minHR: Int?
  var maxHR: Int?
  var avgHR: Int?
  var activeKcal: Int
  var totalKcal: Int
  var elapsedSec: Int
  // 운동 시작 시각(ms)
  var startedAt: Double
}

// 아이폰 → 워치: 전체 초기화처럼 건강 앱에도 남기지 않고 버려야 할 때
struct WatchCommand: Codable {
  var discard: Bool
}
