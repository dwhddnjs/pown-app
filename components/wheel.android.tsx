import React, { useEffect, useState } from "react";
// component
import {
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  useColorScheme,
  View,
  ViewStyle,
} from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  cancelAnimation,
  interpolate,
  runOnJS,
  SharedValue,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
// hooks
import useCurrentThemeColor from "@/hooks/use-current-theme-color";
// lib
import { hapticSelection } from "@/lib/haptics";
// expo

// iOS 휠(UIPickerView·UIDatePicker 스피너)을 JS로 그린 한 열. 안드로이드 전용 —
// option-picker.android.tsx, add-plan/date-time-spinner.android.tsx가 쓴다.
//
// 행들이 반지름 radius인 원통에 감겨 있다고 보고, 가운데에서 멀수록 위아래로 납작해지고(cos)
// 흐려진다. 한 행의 호 길이가 row(= 선택 띠 높이). 끌면 따라 돌고, 놓으면 한 칸에 맞춰 서며
// (플릭하면 여러 칸), 칸이 바뀔 때마다 틱 햅틱. 위아래 행을 누르면 그 행으로 돈다.
// 스크롤뷰 대신 팬 제스처로 굴린다 — 바텀시트 안에서는 시트의 드래그가 스크롤뷰 터치를 가로챈다

export type WheelMetrics = {
  height: number;
  row: number;
  radius: number;
  // 가운데에서 0·1·2…칸 떨어진 행의 글자 불투명도 (마지막 값은 90°). iOS는 다크에서 더 흐리다
  opacity: { light: number[]; dark: number[] };
};

type WheelColumnProps = {
  metrics: WheelMetrics;
  count: number;
  index: number;
  label: (index: number) => string;
  onChange: (index: number) => void;
  textStyle?: StyleProp<TextStyle>;
  // 특정 행만 다른 글자 스타일 (날짜 휠의 "오늘")
  rowTextStyle?: (index: number) => StyleProp<TextStyle>;
  style?: StyleProp<ViewStyle>;
};

// 선택 띠 색 — iOS quaternarySystemFill
export const WHEEL_BAND_COLOR = {
  light: "rgba(116,116,128,0.08)",
  dark: "rgba(118,118,128,0.18)",
} as const;

// 화면에 그릴 행 범위 — 90°(반지름)까지 보이므로 그 안에 드는 칸 수 + 여유 1
const visibleRows = (m: WheelMetrics) => Math.ceil(m.radius / m.row) + 2;

// 손을 뗀 속도로 얼마나 더 굴러갈지 — 플릭하면 여러 칸 넘어간다
const FLING = 0.18;
// 끝을 넘겨 당길 때 따라오는 비율 (iOS 고무줄)
const RUBBER = 0.35;
const SNAP = { damping: 28, stiffness: 180, overshootClamping: true };

type WheelRowProps = {
  index: number;
  offset: SharedValue<number>;
  metrics: WheelMetrics;
  label: string;
  textStyle?: StyleProp<TextStyle>;
};

const WheelRow = ({
  index,
  offset,
  metrics,
  label,
  textStyle,
}: WheelRowProps) => {
  const themeColor = useCurrentThemeColor();
  const { row, radius } = metrics;
  const opacity = metrics.opacity[useColorScheme() ?? "light"];
  const step = row / radius;
  const style = useAnimatedStyle(() => {
    const angle = (index - offset.value / row) * step;
    const half = Math.PI / 2;
    const clamped = Math.max(-half, Math.min(half, angle));
    const stops = opacity.map((_, i) => Math.min(i * step, half));
    stops[stops.length - 1] = half;
    return {
      opacity:
        Math.abs(angle) < half
          ? interpolate(Math.abs(angle), stops, opacity)
          : 0,
      transform: [
        { translateY: radius * Math.sin(clamped) },
        { scaleY: Math.cos(clamped) },
      ],
    };
  });
  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.row,
        { top: (metrics.height - row) / 2, height: row },
        style,
      ]}
    >
      <Text numberOfLines={1} style={[{ color: themeColor.text }, textStyle]}>
        {label}
      </Text>
    </Animated.View>
  );
};

export const WheelColumn = ({
  metrics,
  count,
  index,
  label,
  onChange,
  textStyle,
  rowTextStyle,
  style,
}: WheelColumnProps) => {
  const { height, row, radius } = metrics;
  const step = row / radius;
  const maxOffset = (count - 1) * row;
  const offset = useSharedValue(index * row);
  const start = useSharedValue(0);
  // 1천 행이 넘는 열(날짜)도 있어 가운데 근처만 그린다
  const [center, setCenter] = useState(index);
  const span = visibleRows(metrics);

  // 바깥에서 값이 바뀌면(초기화 등) 휠도 그 자리로 돌린다
  useEffect(() => {
    if (Math.round(offset.value / row) !== index) {
      offset.value = index * row;
      setCenter(index);
    }
  }, [index, offset, row]);

  const tick = (next: number) => {
    setCenter(next);
    hapticSelection();
  };
  useAnimatedReaction(
    () => Math.min(count - 1, Math.max(0, Math.round(offset.value / row))),
    (next, previous) => {
      if (previous !== null && next !== previous) runOnJS(tick)(next);
    },
  );

  const select = (next: number) => {
    if (next !== index) onChange(next);
  };
  const snapTo = (next: number, velocity = 0) => {
    "worklet";
    offset.value = withSpring(next * row, { ...SNAP, velocity }, (done) => {
      if (done) runOnJS(select)(next);
    });
  };

  const pan = Gesture.Pan()
    // 시트의 드래그보다 먼저 잡아야 휠이 돈다
    .activeOffsetY([-3, 3])
    .onBegin(() => {
      cancelAnimation(offset);
      start.value = offset.value;
    })
    .onUpdate((e) => {
      const next = start.value - e.translationY;
      offset.value =
        next < 0
          ? next * RUBBER
          : next > maxOffset
            ? maxOffset + (next - maxOffset) * RUBBER
            : next;
    })
    .onEnd((e) => {
      const projected = offset.value - e.velocityY * FLING;
      snapTo(
        Math.min(count - 1, Math.max(0, Math.round(projected / row))),
        -e.velocityY,
      );
    });

  // 누른 자리가 원통 위 몇 칸째인지 거꾸로 풀어 그 행으로 돌린다
  const tap = Gesture.Tap().onEnd((e) => {
    const ratio = Math.max(-1, Math.min(1, (e.y - height / 2) / radius));
    const steps = Math.round(Math.asin(ratio) / step);
    snapTo(
      Math.min(count - 1, Math.max(0, Math.round(offset.value / row) + steps)),
    );
  });

  const rows = [];
  for (
    let i = Math.max(0, center - span);
    i <= Math.min(count - 1, center + span);
    i++
  ) {
    rows.push(
      <WheelRow
        key={i}
        index={i}
        offset={offset}
        metrics={metrics}
        label={label(i)}
        textStyle={[textStyle, rowTextStyle?.(i)]}
      />,
    );
  }

  return (
    <GestureDetector gesture={Gesture.Exclusive(pan, tap)}>
      <View style={[{ height, overflow: "hidden" }, style]}>{rows}</View>
    </GestureDetector>
  );
};

const styles = StyleSheet.create({
  row: {
    position: "absolute",
    left: 0,
    right: 0,
    justifyContent: "center",
  },
});
