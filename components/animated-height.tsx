import React, { ReactNode, useEffect } from "react";
// component
import {
  LayoutChangeEvent,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

// 심박 버튼이 박스로 펼쳐지는 것과 잔디가 접히는 것이 같은 곡선이어야 한 동작으로 보인다
const MORPH_TIMING = { duration: 300, easing: Easing.out(Easing.cubic) };

type AnimatedHeightProps = {
  children: ReactNode;
  // true면 내용은 그대로 둔 채 높이 0으로 접는다
  collapsed?: boolean;
  style?: StyleProp<ViewStyle>;
};

// 내용 높이가 바뀌면 그 사이를 애니메이션한다. 형제가 일반 흐름으로 쌓이는 곳(리스트
// 헤더)에서만 쓴다 — FlashList 셀 안에서는 아래 셀 위치를 JS가 정하므로 따라오지 않는다
export const AnimatedHeight = ({
  children,
  collapsed = false,
  style,
}: AnimatedHeightProps) => {
  // -1: 아직 안 잼. 첫 측정은 애니메이션하지 않는다(나타날 때 자라나 보이지 않게)
  const content = useSharedValue(-1);
  const open = useSharedValue(collapsed ? 0 : 1);

  useEffect(() => {
    open.value = withTiming(collapsed ? 0 : 1, MORPH_TIMING);
  }, [collapsed, open]);

  const animatedStyle = useAnimatedStyle(() => ({
    height: Math.max(content.value, 0) * open.value,
    opacity: open.value,
  }));

  const onLayout = (event: LayoutChangeEvent) => {
    const next = event.nativeEvent.layout.height;
    content.value = content.value < 0 ? next : withTiming(next, MORPH_TIMING);
  };

  return (
    <Animated.View style={[styles.clip, style, animatedStyle]}>
      <View style={styles.content} onLayout={onLayout}>
        {children}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  clip: {
    overflow: "hidden",
  },
  // 흐름 안에 두면 Yoga가 자식을 "부모 높이 이하"로 재서, 접히는 동안 측정값이 0까지
  // 따라 내려가 다시 펼 수 없었다(잔디가 안 돌아왔다). 절대 위치면 늘 제 높이로 잰다.
  // 대신 첫 측정 전 한 프레임은 높이 0이다 — 화면에 처음 붙는 순간이라 보이지 않는다
  content: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
  },
});
