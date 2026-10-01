// 애플워치 심박 — 아이폰이 startWatchApp으로 깨우면 운동 세션을 돌리고 아이폰에
// 미러링해 실시간 심박을 보낸다. 포운 iOS 앱에 내장돼 워치에 자동 설치된다.
// ponytail: 스파이크 — 아이콘 없음, 출시 전에 icon을 넣을 것
/** @type {import('@bacons/apple-targets/app.plugin').Config} */
module.exports = {
  type: "watch",
  name: "PownWatch",
  displayName: "Pown",
  // 미러링(startMirroringToCompanionDevice)이 watchOS 10+다
  deploymentTarget: "10.0",
  frameworks: ["SwiftUI", "HealthKit"],
  entitlements: {
    "com.apple.developer.healthkit": true,
    "com.apple.developer.healthkit.access": [],
  },
};
