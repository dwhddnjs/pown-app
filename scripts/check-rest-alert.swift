// 세트 압박 알림 판정(modules/heart-rate/ios/RestAlert.swift) 확인 — 판정을 바꾸면 돌린다:
// swiftc -parse-as-library modules/heart-rate/ios/RestAlert.swift scripts/check-rest-alert.swift -o /tmp/check-rest-alert && /tmp/check-rest-alert
import Foundation

@main
struct CheckRestAlert {
  // (초, 새 심박 샘플 — nil은 샘플 없음, 측정 중) 순서대로 넣고 울린 초를 돌려준다
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

  // from초부터 to초 전까지 5초마다 values를 돌아가며
  static func cycle(_ values: [Int], _ from: Double, _ to: Double) -> [(Double, Int?, Bool)] {
    stride(from: from, to: to, by: 5).enumerated().map { ($1, values[$0 % values.count], true) }
  }

  static func check(_ name: String, _ got: [Double], _ want: [Double]) {
    precondition(got == want, "\(name): \(got) != \(want)")
    print("ok  \(name)")
  }

  static func main() {
    // 측정 시작 80~90은 아무리 오래 쉬어도 울리지 않는다(세트 전)
    check("시작 80~90", fired(hold(85, 0, 600)), [])
    // 85에서 120으로 세트 → 마지막으로 최고 언저리였던 때(60초)부터 2분(180초)에 한 번. 판정은 최근 셋의 가운데 값이라
    // 바뀐 심박은 한 샘플(5초) 늦게 먹는다
    check("세트 뒤 2분", fired(hold(85, 0, 30) + hold(120, 30, 60) + hold(90, 60, 400)), [180])
    // 쉬는 동안엔 한 번뿐 — 다시 세트를 해야 다음 알림
    check(
      "쉬는 시간마다 1번",
      fired(hold(85, 0, 10) + hold(130, 10, 40) + hold(95, 40, 300) + hold(135, 300, 330) + hold(92, 330, 600)),
      [160, 450])
    // 쉬는 중 +10 흔들림(걷기 등)은 세트가 아니다 — 휴식 시간이 그대로 흐른다
    check(
      "휴식 중 흔들림",
      fired(hold(85, 0, 10) + hold(130, 10, 40) + hold(95, 40, 80) + hold(105, 80, 100) + hold(95, 100, 300)),
      [160])
    // 운동 후반처럼 쉬는 바닥이 110이어도 세트(140)만 있으면 울린다 — 절대 bpm을 보지 않는다
    check("높은 바닥", fired(hold(110, 0, 30) + hold(140, 30, 60) + hold(112, 60, 300)), [180])
    // 오르는 폭이 15 미만이면 세트로 보지 않는다
    check("작은 오르내림", fired(hold(100, 0, 30) + hold(112, 30, 60) + hold(100, 60, 400)), [])
    // 가볍게 오른 세트(+16) 뒤 바닥이 예전보다 높아 restDrop만큼 안 내려와도 최고 언저리를 60초 못 찍으면 휴식이다 — 최고 언저리
    // 마지막(60초)에서 2분
    check("높아진 바닥", fired(hold(95, 0, 30) + hold(111, 30, 60) + hold(102, 60, 600)), [180])
    // 쉬는 중 잠깐 오른 것(10초·튄 값 하나)은 세트가 아니다 — 알림이 밀리지 않는다
    let set1 = hold(85, 0, 10) + hold(130, 10, 40) + hold(90, 40, 100)
    check("잠깐 오름", fired(set1 + hold(106, 100, 110) + hold(90, 110, 600)), [160])
    check("튄 값", fired(set1 + [(100, 110, true)] + hold(90, 105, 600)), [160])
    // 울린 뒤 잠깐 오른 것으로 같은 휴식에 또 울리지 않는다
    check("울린 뒤 잠깐 오름", fired(set1 + hold(90, 100, 200) + hold(106, 200, 210) + hold(90, 210, 600)), [160])
    // 신호가 잠깐 끊겨도(nil) 휴식 시간은 이어진다
    check(
      "신호 끊김",
      fired(hold(85, 0, 10) + hold(130, 10, 40) + hold(95, 40, 60) + hold(nil, 60, 200)), [160])
    // 세트 직후 신호가 끊겨도 최고를 60초 못 찍으면 휴식이 시작된다 — 마지막 최고(35초)에서 2분
    check("세트 뒤 바로 끊김", fired(hold(85, 0, 5) + hold(130, 5, 40) + hold(nil, 40, 600)), [155])
    // 일시정지·알림 끔이면 처음부터 — 재개 뒤엔 다시 세트를 해야 울린다
    check(
      "일시정지 해제",
      fired(hold(85, 0, 10) + hold(130, 10, 40) + hold(95, 40, 80) + hold(95, 80, 140, running: false)
        + hold(95, 140, 400)),
      [])
    // 고른 휴식 시간을 따른다
    let set = hold(85, 0, 10) + hold(130, 10, 40) + hold(95, 40, 400)
    check("1분 30초", fired(set, rest: 90), [130])
    check("3분", fired(set, rest: 180), [220])
    // 고른 휴식 시간쯤 다음 세트를 시작하면 그 세트 초반(오르는 중)에 울리지 않는다 — 다음 휴식에서 울린다
    check(
      "휴식 끝에 다음 세트",
      fired(
        hold(85, 0, 10) + hold(130, 10, 55) + hold(100, 55, 130) + [(130, 112, true), (135, 120, true)]
          + hold(128, 140, 200) + hold(95, 200, 400), rest: 90),
      [290])
    // 세트 중 튄 값 하나(175)가 최고가 돼 세트 도중 휴식이 시작되지 않는다 — 진짜 휴식(90초)에서 1분 30초
    check(
      "세트 중 튄 값",
      fired(hold(85, 0, 10) + hold(130, 10, 40) + [(40, 175, true)] + hold(130, 45, 90) + hold(90, 90, 400), rest: 90),
      [180])
    // 3분 내내 ±5로 흔들리는 세트는 흔들림 때문에 끝나지 않는다 — 내려온 뒤(190초)에서 1분 30초
    check(
      "평탄한 긴 세트",
      fired(hold(85, 0, 10) + cycle([140, 145, 135, 140], 10, 190) + hold(95, 190, 400), rest: 90),
      [280])
    // 짧게 쉬어 덜 내려온 채(140 → 128) 시작한 다음 세트(141)도 세트다 — 앞 휴식의 알림이 그 세트 도중 울리지 않는다
    check(
      "덜 내려온 채 다음 세트",
      fired(hold(100, 0, 10) + hold(140, 10, 35) + hold(128, 35, 110) + hold(141, 110, 170) + hold(110, 170, 400), rest: 90),
      [260])
    print("rest alert: all ok")
  }
}
