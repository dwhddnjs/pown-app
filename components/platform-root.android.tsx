import React from "react";
// expo
import { StatusBar } from "expo-status-bar";

// 앱 루트에 한 번 붙는 안드로이드 전용 요소.
// 상태바 아이콘 색은 iOS와 달리 앱 안에서 고른 테마(Appearance.setColorScheme)를
// 저절로 따라가지 않는다 — auto로 걸어 둬야 다크 테마에서 아이콘이 묻히지 않는다.
// 플레이 스토어 업데이트 안내는 아직 없다 (iOS는 update-dialog.ios.tsx)
export const PlatformRoot = () => <StatusBar style="auto" />;
