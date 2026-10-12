import React from "react";
// component
import { View as RNView, StyleSheet } from "react-native";
import { Text, View } from "@/components/themed";
import { RoundedSide } from "@/components/rounded-side";
import { DayHeartRateSummary } from "@/components/heart-rate";
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
}) => {
  return (
    <RNView>
      {/* 카드 위 모서리. 아래 모서리는 그룹 마지막 행(plan-list-row 등)이 RoundedSide로 맡는다 */}
      <RoundedSide side="top">
        <RNView style={[styles.header, { backgroundColor: themeColor.tint }]}>
          {/* 이모지는 날짜와 다른 Text로 둔다 — 한 줄에 섞으면 이모지 글꼴(플랫폼·기기마다
              다르다)이 줄 높이를 바꿔, iOS에선 가운데던 날짜가 안드로이드에선 띠 위에 붙었다 */}
          <RNView style={styles.title}>
            <Text style={styles.emoji}>🗓️</Text>
            <Text style={[styles.date, { color: themeColor.onTint }]}>
              {formatDate(date, lang)}
            </Text>
          </RNView>
          {/* 점은 배경을 뚫은 구멍처럼 보여야 하므로 onTint가 아니라 background */}
          <View
            style={[styles.dot, { backgroundColor: themeColor.background }]}
          />
        </RNView>
      </RoundedSide>
      {/* 그날 심박수 측정 요약 — iOS 전용, 안드로이드는 아무것도 그리지 않는다 */}
      <DayHeartRateSummary date={date} themeColor={themeColor} />
    </RNView>
  );
};

const styles = StyleSheet.create({
  // 띠 높이는 iOS 실측(29pt)에 맞춰 고정하고 내용은 가운데 — 글자 줄 높이에 기대면
  // 플랫폼마다 달라진다. 글자 크기를 키운 기기에선 띠도 같이 자라게 최소 높이로 둔다
  header: {
    minHeight: 29,
    paddingHorizontal: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    flexDirection: "row",
    alignItems: "center",
    // 예전 "🗓️  날짜"(공백 두 칸)와 같은 간격
    gap: 6.5,
  },
  emoji: {
    fontSize: 14,
  },
  // sb 글꼴은 아래 여백(descent)이 커서 글자가 줄 상자 위쪽으로 쏠린다 — 가운데 정렬만 하면
  // 날짜가 떠 보여서, 원래 iOS 모습(위 9.7pt·아래 8pt)이 되도록 2.5pt 내린다
  date: {
    fontSize: 14,
    fontFamily: "sb-l",
    marginTop: 5,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 50,
  },
});
