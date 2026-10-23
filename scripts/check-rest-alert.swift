// 세트 압박 알림 판정(modules/heart-rate/ios/RestAlert.swift) 확인 — 판정을 바꾸면 돌린다:
// swiftc -parse-as-library modules/heart-rate/ios/RestAlert.swift scripts/check-rest-alert.swift -o /tmp/check-rest-alert && /tmp/check-rest-alert
import Foundation

@main
struct CheckRestAlert {
  // (초, 심박 — nil은 신호 끊김, 측정 중) 순서대로 넣고 울린 초를 돌려준다
  static func fired(_ steps: [(Double, Int?, Bool)]) -> [Double] {
    var alert = RestAlert()
    return steps.compactMap { sec, bpm, running in
      alert.update(bpm: bpm, running: running, at: Date(timeIntervalSince1970: sec)) ? sec : nil
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
    // 측정 시작 80~90은 아무리 오래 쉬어도 울리지 않는다(무장 전)
    check("시작 80~90", fired(hold(85, 0, 600)), [])
    // 120으로 무장 → 90으로 내려온 지 60초 되는 순간 한 번
    check("세트 뒤 1분", fired(hold(85, 0, 30) + hold(120, 30, 60) + hold(90, 60, 300)), [120])
    // 쉬는 동안엔 한 번뿐 — 100 이상을 다시 찍어야 다음 알림
    check(
      "쉬는 시간마다 1번",
      fired(hold(120, 0, 30) + hold(90, 30, 200) + hold(130, 200, 230) + hold(92, 230, 400)),
      [90, 290])
    // 쉬는 심박이 100 언저리(97~101)면 울린 뒤 100을 다시 찍어도 그 휴식 안에선 또 울리지 않는다 — 105 이상(세트)이어야 다음
    check(
      "100 언저리 오르내림",
      fired(
        hold(120, 0, 20) + hold(98, 20, 85) + hold(101, 85, 90) + hold(98, 90, 200)
          + hold(103, 200, 205) + hold(97, 205, 300) + hold(115, 300, 320) + hold(95, 320, 400)),
      [80, 380])
    // 쉬는 중 100 이상이 들어오면 60초를 처음부터 다시 센다
    check(
      "쉬다 튀면 다시 셈",
      fired(hold(120, 0, 10) + hold(95, 10, 50) + hold(101, 50, 55) + hold(95, 55, 200)), [115])
    // 100은 무장 쪽, 99부터 쉬는 쪽
    check("경계값", fired(hold(100, 0, 10) + hold(99, 10, 100)), [70])
    // 신호가 잠깐 끊겨도(nil) 셈은 이어진다
    check(
      "신호 끊김",
      fired(hold(120, 0, 10) + hold(90, 10, 30) + hold(nil, 30, 60) + hold(90, 60, 100)), [70])
    // 일시정지·알림 끔이면 무장을 푼다 — 재개 뒤 쉬던 심박으로 울리지 않는다
    check(
      "일시정지 해제",
      fired(hold(120, 0, 10) + hold(90, 10, 40) + hold(90, 40, 100, running: false) + hold(90, 100, 300)),
      [])
    print("rest alert: all ok")
  }
}
