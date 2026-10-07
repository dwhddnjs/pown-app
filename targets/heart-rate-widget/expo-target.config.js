// 심박수 측정 Live Activity(다이나믹 아일랜드·잠금화면). 갱신은 앱 쪽
// modules/heart-rate가 하므로 App Group은 필요 없다.
/** @type {import('@bacons/apple-targets/app.plugin').Config} */
module.exports = {
  type: "widget",
  name: "HeartRateWidget",
  displayName: "Pown",
  // 애플워치 스마트 스택 레이아웃(supplementalActivityFamilies·activityFamily)이 18+다(버튼은 17+). 측정 자체가
  // iOS 26 전용이라 잃는 기기는 없다
  deploymentTarget: "18.0",
  frameworks: ["SwiftUI", "ActivityKit", "WidgetKit"],
};
