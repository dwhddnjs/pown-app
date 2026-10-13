import React from "react";
// component
import { StyleSheet, useColorScheme, View } from "react-native";
import {
  WHEEL_BAND_COLOR,
  WheelColumn,
  WheelMetrics,
} from "@/components/wheel";

type OptionPickerProps = {
  selectedValue: string;
  items: { label: string; value: string }[];
  onChange: (value: string) => void;
};

// iOS 휠(UIPickerView)을 시뮬레이터에서 잰 값 (pt) — 반지름 86.5 원통, 한 행 호 47(= 선택 띠),
// 가운데·한 칸·두 칸 떨어진 행의 글자 불투명도
const METRICS: WheelMetrics = {
  height: 216,
  row: 47,
  radius: 86.5,
  opacity: {
    light: [0.77, 0.34, 0.2, 0.05],
    dark: [0.71, 0.34, 0.2, 0.05],
  },
};

// 휠의 높이 — 이걸 담는 시트가 높이를 맞춘다
export const OPTION_PICKER_HEIGHT = METRICS.height;

// 목록에서 하나 고르기 — 안드로이드엔 네이티브 휠이 없어 iOS 휠을 그대로 그린다 (wheel.android.tsx).
// 글꼴은 iOS처럼 시스템 글꼴
export const OptionPicker = ({
  selectedValue,
  items,
  onChange,
}: OptionPickerProps) => {
  const bandColor = WHEEL_BAND_COLOR[useColorScheme() ?? "light"];
  const index = Math.max(
    0,
    items.findIndex((item) => item.value === selectedValue),
  );

  return (
    <View>
      <View style={[styles.band, { backgroundColor: bandColor }]} />
      <WheelColumn
        metrics={METRICS}
        count={items.length}
        index={index}
        label={(i) => items[i].label}
        onChange={(i) => onChange(items[i].value)}
        textStyle={styles.label}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  // 선택 띠 — 열 좌우로 9.5씩 들인 둥근 칸
  band: {
    position: "absolute",
    top: (METRICS.height - METRICS.row) / 2,
    height: METRICS.row,
    left: 9.5,
    right: 9.5,
    borderRadius: 8,
    borderCurve: "continuous",
  },
  // iOS는 22pt 시스템 글꼴(SF) — 안드로이드 시스템 글꼴(Noto CJK)은 한글이 10% 커서 한 단계 줄인다
  label: {
    fontSize: 21,
    textAlign: "center",
  },
});
