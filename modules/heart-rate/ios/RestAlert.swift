import Foundation

// 세트 압박 알림 판정 — 세트로 심박이 100 이상을 찍으면(무장) 그 뒤 100 아래로 60초를 쉬었을 때 한 번 울린다. 다시
// 세트를 해야 다음 알림이다(쉬는 시간마다 1번). 측정을 막 시작한 80~90은 무장 전이라 울리지 않는다.
// 화면·알림과 떼어 둔 건 scripts/check-rest-alert.swift로 돌려 보려고다
struct RestAlert {
  static let threshold = 100
  static let rest: TimeInterval = 60
  // 울린 뒤 다시 무장하는 값 — 쉬는 심박이 100 언저리면(97~101) 100을 한 번 찍을 때마다 다시 무장해 한 번 쉬는 동안에도
  // 여러 번 울렸다. 세트는 이보다 훨씬 높다(고립 운동 110~130)
  static let rearm = 105

  private var armed = false
  // 한 번 울렸다 — 다시 무장하려면 rearm까지 올라야 한다
  private var fired = false
  // 무장한 뒤 100 아래로 내려온 때 — 100 이상이 다시 들어오면 지운다(60초를 처음부터 다시 센다)
  private var lowSince: Date?

  // 갱신마다 부른다. 울려야 하면 true. running이 아니면(일시정지·알림 끔) 무장을 푼다 — 켜자마자·재개하자마자 쉬던
  // 심박으로 울리지 않게. 심박이 잠깐 끊긴 건(nil) 쉬는 게 아니라 그대로 둔다
  mutating func update(bpm: Int?, running: Bool, at now: Date) -> Bool {
    guard running else {
      self = RestAlert()
      return false
    }
    guard let bpm else { return false }
    if bpm >= (fired ? Self.rearm : Self.threshold) {
      armed = true
      fired = false
      lowSince = nil
      return false
    }
    // 울린 뒤 100~104는 아직 쉬는 중이다 — 무장하지 않는다
    guard armed else { return false }
    let since = lowSince ?? now
    lowSince = since
    guard now.timeIntervalSince(since) >= Self.rest else { return false }
    armed = false
    fired = true
    lowSince = nil
    return true
  }
}
