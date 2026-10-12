import React from "react";
// component
import { LayoutChangeEvent, StyleProp, ViewStyle } from "react-native";
// expo
import { BlurView } from "expo-blur";

type BarBackgroundProps = {
  // header: 화면 위 헤더, tab: 하단 탭바
  bar?: "header" | "tab";
  style?: StyleProp<ViewStyle>;
  onLayout?: (event: LayoutChangeEvent) => void;
  children?: React.ReactNode;
};

// 헤더·탭바 배경 — 뒤로 지나가는 콘텐츠가 비치는 블러.
// 탭바는 시스템 탭바와 같은 재질(systemChromeMaterial)을 쓴다
export const BarBackground = ({
  bar = "header",
  style,
  onLayout,
  children,
}: BarBackgroundProps) => (
  <BlurView
    intensity={80}
    tint={bar === "tab" ? "systemChromeMaterial" : "default"}
    style={style}
    onLayout={onLayout}
  >
    {children}
  </BlurView>
);
