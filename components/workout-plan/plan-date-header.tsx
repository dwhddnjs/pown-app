import React, { useMemo } from "react";
// component
import { View as RNView, StyleSheet } from "react-native";
import { Text, View } from "@/components/themed";
import { Stat } from "@/components/heart-rate/heart-rate-row";
// zustand
import { summarizeDay, useHeartRateStore } from "@/hooks/use-heart-rate-store";
// hooks
import { useT } from "@/hooks/use-t";
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
  // 객체를 돌려주는 셀렉터는 매번 새 참조라 무한 리렌더가 난다 — 배열만 구독한다
  const records = useHeartRateStore((state) => state.records);
  const heart = useMemo(() => summarizeDay(records, date), [records, date]);
  const t = useT();

  return (
    <RNView>
      <View style={[styles.header, { backgroundColor: themeColor.tint }]}>
        <Text
          style={[styles.date, { color: themeColor.onTint }]}
        >{`🗓️  ${formatDate(date, lang)}`}</Text>
        {/* 점은 배경을 뚫은 구멍처럼 보여야 하므로 onTint가 아니라 background */}
        <View
          style={[styles.dot, { backgroundColor: themeColor.background }]}
        />
      </View>
      {/* 심박수 측정 요약 — 헤더 아래 카드 첫 줄. 세 화면 모두 헤더 밑에 itemColor
          카드가 이어지므로 카드의 일부처럼 보인다. 측정 박스와 같은 칸, 중요도 순 */}
      {heart && (
        <RNView
          style={[styles.summary, { backgroundColor: themeColor.itemColor }]}
        >
          <RNView style={styles.stats}>
            <Stat
              compact
              label={t("heartRate.activeKcal")}
              value={String(heart.activeKcal)}
              unit="kcal"
            />
            <Stat
              compact
              label={t("heartRate.duration")}
              value={t("heartRate.minutes", {
                n: Math.max(1, Math.round(heart.durationSec / 60)),
              })}
            />
            {heart.minHR != null && heart.maxHR != null && (
              <Stat
                compact
                label={t("heartRate.range")}
                value={`${heart.minHR}–${heart.maxHR}`}
                unit="bpm"
              />
            )}
            <Stat
              compact
              label={t("heartRate.totalKcal")}
              value={String(heart.totalKcal)}
              unit="kcal"
            />
          </RNView>
          <RNView
            style={[styles.divider, { backgroundColor: themeColor.divider }]}
          />
        </RNView>
      )}
    </RNView>
  );
};

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
  summary: {
    paddingHorizontal: 12,
  },
  stats: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    // 구분선은 헤더와 같은 12 안쪽에 두고 칸만 4 더 들인다
    paddingHorizontal: 4,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
  },
});
