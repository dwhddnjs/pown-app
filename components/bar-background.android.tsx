import React from "react";
// component
import {
  LayoutChangeEvent,
  StyleProp,
  useColorScheme,
  View,
  ViewStyle,
} from "react-native";

type BarBackgroundProps = {
  // header: 화면 위 헤더, tab: 하단 탭바
  bar?: "header" | "tab";
  style?: StyleProp<ViewStyle>;
  onLayout?: (event: LayoutChangeEvent) => void;
  children?: React.ReactNode;
};

// iOS 블러(bar-background.ios.tsx)가 앱 배경 위에서 실제로 내는 색을 시뮬레이터에서 실측한 값
const BAR_COLOR = {
  light: { header: "#F3F2F8", tab: "#FAFAFC" },
  dark: { header: "#1B1B1B", tab: "#252426" },
} as const;

// 헤더·탭바 배경 — 불투명. expo-blur의 안드로이드 블러는 실험 기능이라 그냥 두면
// 반투명 회색 막만 깔린다. 대신 iOS 블러가 보이는 색을 그대로 칠한다
export const BarBackground = ({
  bar = "header",
  style,
  onLayout,
  children,
}: BarBackgroundProps) => {
  const scheme = useColorScheme() ?? "light";
  return (
    <View
      onLayout={onLayout}
      style={[{ backgroundColor: BAR_COLOR[scheme][bar] }, style]}
    >
      {children}
    </View>
  );
};
