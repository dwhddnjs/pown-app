import Foundation

// 워치 ↔ 아이폰 미러링으로 주고받는 데이터. 모듈(modules/heart-rate/ios/WatchSnapshot.swift)에
// 똑같은 파일이 있다 — 워치 타깃과 모듈 pod은 소스를 공유할 수 없어 복사해 둔다.
// 필드를 바꾸면 두 파일을 같이 고칠 것. 워치 앱은 아이폰 앱보다 늦게 업데이트될 수 있어 버전이
// 섞인다 — 새 필드는 반드시 옵셔널로 더하고(받은 값에 필수 키가 빠지면 디코딩이 통째로 실패해 시작이 매번
// 타임아웃 난다), 있던 필수 필드는 지우지 않는다(옛 쪽이 그 키를 기다린다). 모르는 키는 무시된다.

// 워치 → 아이폰: 갱신마다 보내는 측정값
struct WatchSnapshot: Codable {
  // 이보다 오래된 심박은 "지금" 값으로 보내지도, 보여주지도 않는다 (에어팟을 뺀 뒤 멈춘 숫자 방지).
  // 아이폰 세션(이어폰)도 이 기준을 쓴다
  static let heartRateFreshness: TimeInterval = 30
  // 1분이 안 되는 세션은 실수로 누른 것으로 보고 건강 앱에도, 기록에도 남기지 않는다. 아이폰
  // 세션도 이 기준을 쓴다
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
  // 경과 0초였던 시각(ms) = 보낸 시각 - 경과 시간(일시정지 뺀). 측정 중엔 변하지 않아 아이폰이 이걸로
  // 센다 — 정수 초인 elapsedSec에서 거꾸로 구하면 갱신마다 1초씩 흔들린다. 일시정지 중엔 쓰지 않는다.
  // 처음 버전 뒤에 더해 옵셔널이다
  var timerStart: Double?
  // 운동 시작 시각(ms)
  var startedAt: Double
  // false면 워치가 심박을 못 읽어 스스로 일시정지했다 — 아이폰 박스가 "워치를 차고 재개" 안내를 띄운다. 3.5.3 워치
  // 앱은 손목 감지로, 그 뒤 워치 앱은 심박이 한참 안 들어오면(WatchWorkout.noHeartRatePause) 보낸다. 재개하면 지운다.
  // nil은 해당 없음. 처음 버전 뒤에 더해 옵셔널이다
  var wrist: Bool?
}

// 아이폰 → 워치
struct WatchCommand: Codable {
  // 전체 초기화처럼 건강 앱에도 남기지 않고 버려야 할 때 — 받은 워치가 스스로 멈춘다
  var discard: Bool
  // 일시정지로 남은 측정에 이어 재는 구간이다 — 1분이 안 돼도 건강 앱에 남긴다(앞 구간과 합치면 1분이 넘는다).
  // 처음 버전 뒤에 더해 옵셔널이다
  var keep: Bool?
}
