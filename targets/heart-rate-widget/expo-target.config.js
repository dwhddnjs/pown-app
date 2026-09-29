// 심박수 측정 Live Activity(다이나믹 아일랜드·잠금화면). 갱신은 앱 쪽
// modules/heart-rate가 하므로 App Group은 필요 없다.
/** @type {import('@bacons/apple-targets/app.plugin').Config} */
module.exports = {
  type: "widget",
  name: "HeartRateWidget",
  displayName: "Pown",
  deploymentTarget: "16.2",
  frameworks: ["SwiftUI", "ActivityKit", "WidgetKit"],
};
