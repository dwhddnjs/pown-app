// 애플워치 심박 — 아이폰이 startWatchApp으로 깨우면 운동 세션을 돌리고 아이폰에
// 미러링해 실시간 심박을 보낸다. 포운 iOS 앱에 내장돼 워치에 자동 설치된다.
/** @type {import('@bacons/apple-targets/app.plugin').Config} */
module.exports = {
  type: "watch",
  name: "PownWatch",
  displayName: "Pown",
  // 앱 아이콘과 같은 그림(1024px, 알파 없음 — 워치 아이콘은 투명 픽셀이 있으면 업로드가 거절된다)
  icon: "../../assets/images/app-icon-dark.png",
  // 미러링(startMirroringToCompanionDevice)이 watchOS 10+다
  deploymentTarget: "10.0",
  // LocalAuthentication: 손목 착용 확인(WatchWorkout.checkWrist). WatchConnectivity: 아이폰과 끊긴 채
  // 끝난 운동의 마지막 값을 보낸다(WatchWorkout.close)
  frameworks: [
    "SwiftUI",
    "HealthKit",
    "LocalAuthentication",
    "WatchConnectivity",
  ],
  entitlements: {
    "com.apple.developer.healthkit": true,
    "com.apple.developer.healthkit.access": [],
  },
};
