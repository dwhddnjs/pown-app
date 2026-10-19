import React from "react";
// component
import { StyleSheet } from "react-native";
import { useDrawerProgress } from "@react-navigation/drawer";
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
} from "react-native-reanimated";
// hook
import useCurrentThemeColor from "@/hooks/use-current-theme-color";

// ponytail: 아이폰 화면 모서리(약 48~62)에 눈대중으로 맞춘 값 — 기기별로 다르게 보이면 여기만 조정
const CARD_RADIUS = 48;

// 드로어가 열리면 보던 화면이 둥근 카드가 되어 오른쪽으로 밀려나고, 뒤에 깔린 드로어가 드러난다
// (drawerType "back"). 닫혀 있으면 반경 0이라 평소 화면은 그대로다 — 모서리가 평평한 기기 포함.
// 라이브러리 막(overlay)은 네모라 카드 모서리 밖까지 덮어서 투명으로 두고(탭하면 닫기는 그대로),
// 어둡게 하는 막·테두리는 여기서 카드 모양대로 그린다
export const DrawerCard = ({ children }: { children: React.ReactNode }) => {
  const progress = useDrawerProgress();
  const themeColor = useCurrentThemeColor();

  const radiusStyle = useAnimatedStyle(() => ({
    borderRadius: interpolate(
      progress.value,
      [0, 0.2],
      [0, CARD_RADIUS],
      Extrapolation.CLAMP,
    ),
  }));
  const dimStyle = useAnimatedStyle(() => ({ opacity: progress.value }));

  return (
    <Animated.View
      style={[
        styles.card,
        { backgroundColor: themeColor.background },
        radiusStyle,
      ]}
    >
      {children}
      <Animated.View
        pointerEvents="none"
        style={[
          styles.dim,
          { borderColor: themeColor.divider },
          radiusStyle,
          dimStyle,
        ]}
      />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    overflow: "hidden",
    borderCurve: "continuous",
  },
  // 테두리가 있으면 overflow hidden이 있어야 연속 곡률이 유지된다
  dim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    borderWidth: StyleSheet.hairlineWidth,
    borderCurve: "continuous",
    overflow: "hidden",
  },
});
