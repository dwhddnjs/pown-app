import React from "react";
// component
import { View as RNView, StyleSheet } from "react-native";

// 연속 곡률이 퍼지는 길이(반경 × 약 1.53)보다 길게 숨긴다
const RADIUS = 12;
const HIDDEN = 24;

// 위나 아래 두 모서리만 연속 곡률로 둥글린다. RN은 모서리마다 반경이 다르면
// borderCurve를 무시하고 원호로 그린다(RN 0.79 RCTViewComponentView 확인) — 그래서
// 네 모서리를 똑같이 둥글린 판을 숨길 쪽으로 늘리고, 바깥 뷰가 그 너머를 잘라낸다.
// 늘린 만큼 패딩을 줘 레이아웃 높이는 그대로다(가상화 리스트의 셀 높이가 안 바뀐다).
// 배경은 자식이 칠한다 — themed View처럼 테마 배경을 네모로 칠하는 뷰로 감싸면 모서리가 덮인다.
// side가 null이면 둥글리지 않는다 — 재활용 셀이 마지막 행↔중간 행을 오가도 트리가 같아야
// 자식이 다시 마운트되지 않는다
export const RoundedSide = ({
  side,
  children,
}: {
  side: "top" | "bottom" | null;
  children: React.ReactNode;
}) => (
  <RNView style={side && styles.clip}>
    <RNView style={side && [styles.plate, styles[side]]}>{children}</RNView>
  </RNView>
);

const styles = StyleSheet.create({
  clip: {
    overflow: "hidden",
  },
  plate: {
    borderRadius: RADIUS,
    borderCurve: "continuous",
    overflow: "hidden",
  },
  top: {
    marginBottom: -HIDDEN,
    paddingBottom: HIDDEN,
  },
  bottom: {
    marginTop: -HIDDEN,
    paddingTop: HIDDEN,
  },
});
