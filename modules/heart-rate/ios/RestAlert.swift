import Foundation

// 세트 압박 알림 판정 — 심박으로 세트의 끝만 잡고, 알림은 휴식 시간으로 보낸다. 쉬는 중 최저보다 setRise 이상 오른
// 채 setHold초를 넘기면 세트, 그 세트 최고에서 restDrop 이상 내려오거나 최고 언저리(peakBand)를 setEnd초 넘게 못 찍으면
// 휴식 시작(마지막으로 최고 언저리였던 때부터 센다) → 휴식이 rest초를 넘으면 한 번 울린다. 다시 세트를 해야 다음 알림이다
// (쉬는 시간마다 1번). 측정을 막 시작해 세트 전이면 울리지 않는다.
// 절대 bpm(예전 "100 아래 1분")은 사람마다·운동 후반마다 쉬는 바닥이 달라(10/26 실기 바닥 100~110 → 108분에 2번)
// 오르내린 폭만 본다. 화면·알림과 떼어 둔 건 scripts/check-rest-alert.swift로 돌려 보려고다
struct RestAlert {
  // 이만큼 오르면 세트 — 에어팟 심박의 잔 흔들림(±5)보다 크고, 가벼운 고립 운동도 보통 넘는다
  static let setRise = 15
  // 앞 세트 최고까지 다시 오르면 이만큼만 올라도 세트다 — 짧게 쉬어 덜 내려온 채 시작한 다음 세트(최고 140 → 쉬며 128 →
  // 141)는 setRise를 못 넘어, 앞 휴식의 알림이 그 세트 도중 울렸다
  static let setRiseMin = 10
  // 세트 최고에서 이만큼 내려오면 세트가 끝났다고 본다 — 흔들림(±5)의 폭보다 넉넉히 크게
  static let restDrop = 15
  // 최고에서 이만큼 안이면 아직 최고에 머문 것이다 — 평탄하게 이어지는 세트가 흔들림 때문에 setEnd로 끝나지 않게
  static let peakBand = 5
  // 오른 채 이만큼 머물러야 세트 — 일어서기·원판 교체·센서 튐처럼 잠깐 오른 건 휴식을 끊지 않는다. 세트는 하는 동안과
  // 끝난 뒤 한참까지 올라 있다
  static let setHold: TimeInterval = 20
  // 최고 언저리를 이만큼 못 찍으면 세트가 끝났다고 본다 — 가볍게 오른 세트 뒤 쉬는 바닥이 예전보다 높으면 restDrop만큼 안
  // 내려온다(최저 95 → 세트 111 → 휴식 102). 세트 뒤 신호가 끊겨도 이걸로 휴식이 시작된다. 가장 짧은 휴식(90초)보다
  // 짧아야 알림이 늦지 않는다
  static let setEnd: TimeInterval = 60

  // 최근 심박 셋 — 가운데 값으로 판정해 튄 값 하나(세트 중 175, 쉬는 중 110)가 세트·휴식을 가르지 않게 한다
  private var recent: [Int] = []
  // 쉬는 중(또는 측정 시작 뒤 첫 세트 전) 최저 심박 — 세트를 알아보는 기준
  private var low: Int?
  // 쉬는 중 세트만큼 오르기 시작한 때 — setHold를 넘기면 세트다
  private var rising: Date?
  // 세트 중 최고와 마지막으로 그 언저리였던 때 — nil이면 세트 중이 아니다
  private var peak: (bpm: Int, at: Date)?
  // 바로 앞 세트의 최고 — 덜 내려온 채 시작한 다음 세트를 알아본다(setRiseMin)
  private var lastPeak: Int?
  // 세트가 끝나 쉬기 시작한 때 — 세트 한 번 뒤에만 생긴다
  private var restSince: Date?
  // 이번 휴식에 이미 울렸다
  private var fired = false

  // bpm은 새로 들어온 심박 샘플일 때만 그 시각(at)과 넣는다 — 같은 값을 갱신마다 다시 넣으면 튄 값 하나가 setHold를 혼자
  // 채웠다. 새 샘플이 없으면 nil과 지금 시각으로 불러 시간만 본다(심박이 끊긴 동안에도 휴식 시간은 흐른다). 울려야 하면 true.
  // running이 아니면(일시정지·알림 끔) 처음부터 — 재개하자마자 멈춰 있던 시간으로 울리지 않게
  mutating func update(bpm: Int?, running: Bool, rest: TimeInterval, at now: Date) -> Bool {
    guard running else {
      self = RestAlert()
      return false
    }
    var smoothed: Int?
    if let sample = bpm {
      recent = Array((recent + [sample]).suffix(3))
      // 셋이 모이기 전엔 낮은 쪽 — 측정 처음에 튄 값으로 세트를 잡지 않게
      let bpm = recent.sorted()[(recent.count - 1) / 2]
      smoothed = bpm
      if let current = peak {
        if bpm >= current.bpm - Self.peakBand {
          // 최고 언저리에 머물러 있으면 아직 세트 중이다 — 휴식은 마지막으로 여기 있던 때부터 센다
          peak = (max(bpm, current.bpm), now)
        } else if bpm <= current.bpm - Self.restDrop {
          startRest(low: bpm)
        }
      } else if let floor = low, bpm >= floor + rise(from: floor) {
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
    if let current = peak, now.timeIntervalSince(current.at) >= Self.setEnd {
      startRest(low: smoothed)
    }
    // 다음 세트를 시작해 오르는 중(rising)이면 울리지 않는다 — 고른 휴식 시간쯤 다음 세트를 시작하면 세트 초반에 울렸다.
    // 세트로 확정되면 이 휴식은 끝난 것이고, 잠깐 오른 거면 내려오자마자 울린다
    guard let since = restSince, !fired, rising == nil, now.timeIntervalSince(since) >= rest else {
      return false
    }
    fired = true
    return true
  }

  // 세트 끝 — 쉬는 바닥은 지금 심박부터 다시 잰다(신호가 끊겨 없으면 다음 심박부터)
  private mutating func startRest(low bpm: Int?) {
    restSince = peak?.at
    lastPeak = peak?.bpm
    low = bpm
    peak = nil
  }

  // 쉬는 바닥에서 이만큼 오르면 세트 — 앞 세트 최고가 setRise보다 가까우면 거기까지(setRiseMin 이상)
  private func rise(from floor: Int) -> Int {
    guard let lastPeak else { return Self.setRise }
    return max(Self.setRiseMin, min(Self.setRise, lastPeak - floor))
  }
}
