// 세트 압박 알림 판정(modules/heart-rate/ios/RestAlert.swift) 확인 — 판정을 바꾸면 돌린다:
// swiftc -parse-as-library modules/heart-rate/ios/RestAlert.swift scripts/check-rest-alert.swift -o /tmp/check-rest-alert && /tmp/check-rest-alert
import Foundation

@main
struct CheckRestAlert {
  // (초, 심박 — nil은 신호 끊김, 측정 중) 순서대로 넣고 울린 초를 돌려준다
  static func fired(_ steps: [(Double, Int?, Bool)], rest: TimeInterval = 120) -> [Double] {
    var alert = RestAlert()
    return steps.compactMap { sec, bpm, running in
      alert.update(bpm: bpm, running: running, rest: rest, at: Date(timeIntervalSince1970: sec))
        ? sec : nil
    }
  }

  // from초부터 to초 전까지 5초마다 같은 심박
  static func hold(_ bpm: Int?, _ from: Double, _ to: Double, running: Bool = true)
    -> [(Double, Int?, Bool)]
  {
    stride(from: from, to: to, by: 5).map { ($0, bpm, running) }
  }

  static func check(_ name: String, _ got: [Double], _ want: [Double]) {
    precondition(got == want, "\(name): \(got) != \(want)")
    print("ok  \(name)")
  }

  static func main() {
    // 측정 시작 80~90은 아무리 오래 쉬어도 울리지 않는다(세트 전)
    check("시작 80~90", fired(hold(85, 0, 600)), [])
    // 85에서 120으로 세트 → 최고(55초) 뒤 90으로 쉬기 시작 → 최고에서 2분(175초)에 한 번
    check("세트 뒤 2분", fired(hold(85, 0, 30) + hold(120, 30, 60) + hold(90, 60, 400)), [175])
    // 쉬는 동안엔 한 번뿐 — 다시 세트를 해야 다음 알림
    check(
      "쉬는 시간마다 1번",
      fired(hold(85, 0, 10) + hold(130, 10, 40) + hold(95, 40, 300) + hold(135, 300, 330) + hold(92, 330, 600)),
      [155, 445])
    // 쉬는 중 +10 흔들림(걷기 등)은 세트가 아니다 — 휴식 시간이 그대로 흐른다
    check(
      "휴식 중 흔들림",
      fired(hold(85, 0, 10) + hold(130, 10, 40) + hold(95, 40, 80) + hold(105, 80, 100) + hold(95, 100, 300)),
      [155])
    // 운동 후반처럼 쉬는 바닥이 110이어도 세트(140)만 있으면 울린다 — 절대 bpm을 보지 않는다
    check("높은 바닥", fired(hold(110, 0, 30) + hold(140, 30, 60) + hold(112, 60, 300)), [175])
    // 오르는 폭이 15 미만이면 세트로 보지 않는다
    check("작은 오르내림", fired(hold(100, 0, 30) + hold(112, 30, 60) + hold(100, 60, 400)), [])
    // 가볍게 오른 세트(+16) 뒤 바닥이 예전보다 높아 -10만큼 안 내려와도 최고가 60초 안 바뀌면 휴식이다 — 최고(55초)에서 2분
    check("높아진 바닥", fired(hold(95, 0, 30) + hold(111, 30, 60) + hold(102, 60, 600)), [175])
    // 쉬는 중 잠깐 오른 것(10초·튄 값 하나)은 세트가 아니다 — 알림이 밀리지 않는다
    let set1 = hold(85, 0, 10) + hold(130, 10, 40) + hold(90, 40, 100)
    check("잠깐 오름", fired(set1 + hold(106, 100, 110) + hold(90, 110, 600)), [155])
    check("튄 값", fired(set1 + [(100, 110, true)] + hold(90, 105, 600)), [155])
    // 울린 뒤 잠깐 오른 것으로 같은 휴식에 또 울리지 않는다
    check("울린 뒤 잠깐 오름", fired(set1 + hold(90, 100, 200) + hold(106, 200, 210) + hold(90, 210, 600)), [155])
    // 신호가 잠깐 끊겨도(nil) 휴식 시간은 이어진다
    check(
      "신호 끊김",
      fired(hold(85, 0, 10) + hold(130, 10, 40) + hold(95, 40, 60) + hold(nil, 60, 200)), [155])
    // 일시정지·알림 끔이면 처음부터 — 재개 뒤엔 다시 세트를 해야 울린다
    check(
      "일시정지 해제",
      fired(hold(85, 0, 10) + hold(130, 10, 40) + hold(95, 40, 80) + hold(95, 80, 140, running: false)
        + hold(95, 140, 400)),
      [])
    // 고른 휴식 시간을 따른다
    let set = hold(85, 0, 10) + hold(130, 10, 40) + hold(95, 40, 400)
    check("1분 30초", fired(set, rest: 90), [125])
    check("3분", fired(set, rest: 180), [215])
    print("rest alert: all ok")
  }
}
