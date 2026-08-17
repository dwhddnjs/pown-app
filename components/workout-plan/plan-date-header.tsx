import React from "react";
// component
import { StyleSheet } from "react-native";
import { Text, View } from "@/components/themed";
// lib
import { formatDate } from "@/lib/date";
import { ThemeColorType } from "@/constants/colors";
import { Lang } from "@/lib/i18n";

// 기록 목록 카드의 날짜 헤더. 운동 탭·검색·달력 히스토리가 같은 걸 쓴다 —
// 세 군데에 복사해 두니 검색 화면만 점이 빠지고, 달력 히스토리만 글자색이
// background(라이트에서 밝은 회색)로 갈라져 있었다. 셋 다 onTint로 통일한다.
// 색·언어는 prop으로 받는다 (재활용되는 셀에서 renderItem 의존성이 되어야 한다)
export const PlanDateHeader = ({
  date,
  themeColor,
  lang,
}: {
  date: string;
  themeColor: ThemeColorType;
  lang?: Lang;
}) => (
  <View style={[styles.header, { backgroundColor: themeColor.tint }]}>
    <Text
      style={[styles.date, { color: themeColor.onTint }]}
    >{`🗓️  ${formatDate(date, lang)}`}</Text>
    {/* 점은 배경을 뚫은 구멍처럼 보여야 하므로 onTint가 아니라 background */}
    <View style={[styles.dot, { backgroundColor: themeColor.background }]} />
  </View>
);

const styles = StyleSheet.create({
  header: {
    borderTopRightRadius: 12,
    borderTopLeftRadius: 12,
    paddingTop: 2,
    paddingBottom: 4,
    paddingHorizontal: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  date: {
    fontSize: 14,
    fontFamily: "sb-l",
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 50,
    marginTop: 4,
  },
});
