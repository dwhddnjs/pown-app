import React from "react";
// component
import { StyleSheet } from "react-native";
import { BarBackground } from "@/components/bar-background";
// navigation
import { useHeaderHeight } from "@react-navigation/elements";

// 푸시 화면 헤더 — iOS는 네이티브 내비 바를 그대로 쓴다.
// 안드로이드는 같은 모양을 JS로 그린다 (stack-header.android.tsx)
export const stackHeader = {};

// 계획 폼 헤더 — workout 탭과 같은 blur. 맨 위에서는 뒤에 배경색밖에 없어 구분이 안 보이고,
// 스크롤하면 콘텐츠가 지나가며 blur가 드러난다
export const blurHeader = {
  headerTransparent: true,
  // 루트 screenOptions가 헤더에 배경색을 깔아둔다 — 여기서 지우지 않으면
  // 그 불투명 색이 아래 BarBackground를 덮어 blur가 아예 보이지 않는다
  headerStyle: { backgroundColor: "transparent" },
  headerBackground: () => <BarBackground style={StyleSheet.absoluteFill} />,
};

// 투명 헤더 밑으로 깔린 본문이 헤더 아래에서 시작하게 내릴 높이
export const useBlurHeaderInset = useHeaderHeight;
