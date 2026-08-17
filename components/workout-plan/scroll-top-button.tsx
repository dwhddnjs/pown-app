// component
import { StyleSheet } from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import {
  CircleButton,
  circleButtonSmall,
  FAB_GAP,
  FAB_SIZE_SMALL,
} from "@/components/circle-button";
// zustand
import { useWorkoutScrollStore } from "@/hooks/use-workout-scroll-store";
// hook
import { useT } from "@/hooks/use-t";
// navigation
import { useHeaderHeight } from "@react-navigation/elements";

// 스크롤 여부 구독을 이 버튼에 가둔다 — 화면 상태로 두면 최상단 경계를 넘나들
// 때마다 리스트를 든 화면 전체가 리렌더된다
export const ScrollTopButton = ({ onPress }: { onPress: () => void }) => {
  const scrolled = useWorkoutScrollStore((state) => state.scrolled);
  const headerHeight = useHeaderHeight();
  const t = useT();

  if (!scrolled) return null;

  return (
    <Animated.View
      entering={FadeIn.duration(220)}
      exiting={FadeOut.duration(160)}
      style={[styles.wrap, { top: headerHeight + FAB_GAP }]}
    >
      <CircleButton
        onPress={onPress}
        label={t("workout.scrollToTop")}
        icon="keyboard-double-arrow-up"
        iconSize={26}
        style={[circleButtonSmall, { borderWidth: 0 }]}
      />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  // 헤더 바로 아래 가로 중앙 — top은 헤더 높이라 런타임에 넣는다.
  // left:0/right:0으로 펼치면 투명한 띠가 리스트 터치를 먹으므로 버튼 폭만 잡는다.
  // fade는 Animated 래퍼가 맡는다.
  wrap: {
    position: "absolute",
    left: "50%",
    marginLeft: -FAB_SIZE_SMALL / 2,
    zIndex: 1000,
  },
});
