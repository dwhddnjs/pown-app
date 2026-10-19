const { withAndroidManifest } = require("expo/config-plugins");

// targetSdk 36(Android 16)부터 예측형 뒤로가기가 기본으로 켜져 onBackPressed가 안 불린다.
// RN 0.79 ReactActivity는 onBackPressed로 BackHandler에 넘기므로 끄지 않으면 뒤로가기가 다 죽는다.
// Expo SDK 54의 android.predictiveBackGestureEnabled(기본 false)와 같은 일 — SDK 올리면 지울 것.
module.exports = (config) =>
  withAndroidManifest(config, (cfg) => {
    cfg.modResults.manifest.application[0].$[
      "android:enableOnBackInvokedCallback"
    ] = "false";
    return cfg;
  });
