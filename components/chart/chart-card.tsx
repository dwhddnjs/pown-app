import React from "react";
// component
import { StyleProp, StyleSheet, ViewStyle } from "react-native";
import { Text, View } from "../themed";
import { ChartEmptyState } from "./chart-empty-state";
// hook
import useCurrentThemeColor from "@/hooks/use-current-theme-color";

interface ChartCardProps {
  title: string;
  // 제목 아래 보조 설명 (SBD 차트의 범례 안내). 없으면 줄 자체가 생기지 않는다.
  subtitle?: string;
  isEmpty: boolean;
  emptyMessage: string;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

// 기록 탭 카드 한 장의 공통 껍데기 — 제목 / 구분선 / (비었으면) 안내문.
// 차트 7종이 같은 마크업을 각자 들고 있어서 카드 여백을 한 번 바꾸려면
// 일곱 파일을 같이 고쳐야 했다.
export const ChartCard = ({
  title,
  subtitle,
  isEmpty,
  emptyMessage,
  children,
  style,
}: ChartCardProps) => {
  const themeColor = useCurrentThemeColor();

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: themeColor.itemColor },
        style,
      ]}
    >
      <Text style={styles.title}>{title}</Text>
      {subtitle ? (
        <Text style={[styles.subtitle, { color: themeColor.subText }]}>
          {subtitle}
        </Text>
      ) : null}
      <View style={{ height: 1, backgroundColor: themeColor.divider }} />
      {isEmpty ? (
        <ChartEmptyState message={emptyMessage} themeColor={themeColor} />
      ) : (
        children
      )}
    </View>
  );
};

// 차트 본문을 감싸는 상자. gifted-charts가 그리는 축·격자 실폭이 width prop보다
// 넓어서 카드 안쪽 폭에서 잘라내야 한다(계산으로 맞추면 기기마다 어긋난다).
export const ChartBody = ({ children }: { children: React.ReactNode }) => {
  const themeColor = useCurrentThemeColor();

  return (
    <View style={[styles.body, { backgroundColor: themeColor.itemColor }]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 20,
    paddingHorizontal: 12,
    borderRadius: 12,
    gap: 12,
  },
  title: {
    fontSize: 18,
  },
  subtitle: {
    fontSize: 12,
    fontFamily: "sb-l",
  },
  body: {
    overflow: "hidden",
    paddingVertical: 4,
  },
});
