import Foundation

// 세트 압박 알림 판정 — 심박으로 세트의 끝만 잡고, 알림은 휴식 시간으로 보낸다. 쉬는 중 최저보다 setRise 이상 오른
// 채 setHold초를 넘기면 세트, 그 세트 최고에서 restDrop 이상 내려오거나 최고가 setEnd초 넘게 안 바뀌면 휴식 시작(최고를
// 찍은 때부터 센다) → 휴식이 rest초를 넘으면 한 번 울린다. 다시 세트를 해야 다음 알림이다(쉬는 시간마다 1번). 측정을
// 막 시작해 세트 전이면 울리지 않는다.
// 절대 bpm(예전 "100 아래 1분")은 사람마다·운동 후반마다 쉬는 바닥이 달라(10/26 실기 바닥 100~110 → 108분에 2번)
// 오르내린 폭만 본다. 화면·알림과 떼어 둔 건 scripts/check-rest-alert.swift로 돌려 보려고다
struct RestAlert {
  // 이만큼 오르면 세트 — 에어팟 심박의 잔 흔들림(±5)보다 크고, 가벼운 고립 운동도 보통 넘는다
  static let setRise = 15
  // 세트 최고에서 이만큼 내려오면 세트가 끝났다고 본다 — 세트 중엔 거의 안 떨어진다
  static let restDrop = 10
  // 오른 채 이만큼 머물러야 세트 — 일어서기·원판 교체·센서 튐처럼 잠깐 오른 건 휴식을 끊지 않는다. 세트는 하는 동안과
  // 끝난 뒤 한참까지 올라 있다
  static let setHold: TimeInterval = 20
  // 최고가 이만큼 안 바뀌면 세트가 끝났다고 본다 — 가볍게 오른 세트 뒤 쉬는 바닥이 예전보다 높으면 restDrop만큼 안
  // 내려온다(최저 95 → 세트 111 → 휴식 102). 가장 짧은 휴식(90초)보다 짧아야 알림이 늦지 않는다
  static let setEnd: TimeInterval = 60

  // 쉬는 중(또는 측정 시작 뒤 첫 세트 전) 최저 심박 — 세트를 알아보는 기준
  private var low: Int?
  // 쉬는 중 setRise 이상 오르기 시작한 때 — setHold를 넘기면 세트다
  private var rising: Date?
  // 세트 중 최고와 그 시각 — nil이면 세트 중이 아니다
  private var peak: (bpm: Int, at: Date)?
  // 세트가 끝나 쉬기 시작한 때 — 세트 한 번 뒤에만 생긴다
  private var restSince: Date?
  // 이번 휴식에 이미 울렸다
  private var fired = false

  // 갱신마다 부른다. 울려야 하면 true. running이 아니면(일시정지·알림 끔) 처음부터 — 재개하자마자 멈춰 있던 시간으로
  // 울리지 않게. 심박이 잠깐 끊긴 건(nil) 쉬는 게 이어진 것이라 시간만 본다
  mutating func update(bpm: Int?, running: Bool, rest: TimeInterval, at now: Date) -> Bool {
    guard running else {
      self = RestAlert()
      return false
    }
    if let bpm {
      if let current = peak {
        // 최고에 머물러 있으면 아직 세트 중이다 — 휴식은 마지막으로 최고였던 때부터 센다
        if bpm >= current.bpm {
          peak = (bpm, now)
        } else if bpm <= current.bpm - Self.restDrop || now.timeIntervalSince(current.at) >= Self.setEnd {
          restSince = current.at
          low = bpm
          peak = nil
        }
      } else if let floor = low, bpm >= floor + Self.setRise {
        let since = rising ?? now
        rising = since
        if now.timeIntervalSince(since) >= Self.setHold {
          peak = (bpm, now)
          rising = nil
          restSince = nil
          fired = false
        }
      } else {
        rising = nil
        low = min(low ?? bpm, bpm)
      }
    }
    guard let since = restSince, !fired, now.timeIntervalSince(since) >= rest else { return false }
    fired = true
    return true
  }
}
