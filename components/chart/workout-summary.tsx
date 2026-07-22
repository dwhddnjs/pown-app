import React from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import { Text, View } from "../themed";
import useCurrentThemeColor from "@/hooks/use-current-theme-color";
import { useMonthlyPlanData } from "@/hooks/use-monthly-plan-data";
import { useChartStore } from "@/hooks/use-chart-store";
import { sortWorkoutPlanList } from "@/lib/function";
import { useLanguage } from "@/hooks/use-user-store";
import { useT } from "@/hooks/use-t";
import { tBodyPart } from "@/lib/i18n";
import { ChartEmptyState } from "./chart-empty-state";
// expo
import { useRouter } from "expo-router";
// icon
import AntDesign from "@expo/vector-icons/AntDesign";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

export const WorkoutSummary = () => {
  const themeColor = useCurrentThemeColor();
  const t = useT();
  const lang = useLanguage();
  const { date } = useChartStore();
  const { monthlyPlanData } = useMonthlyPlanData(date);
  const { push } = useRouter();

  const totalWorkouts = monthlyPlanData.length;
  const listCount = sortWorkoutPlanList(monthlyPlanData);

  const mostTrained = Object.entries(listCount).reduce<{
    type: string;
    count: number;
  }>(
    (max, [type, count]) =>
      (count as number) > max.count ? { type, count: count as number } : max,
    { type: "", count: 0 },
  );

  const totalSets = monthlyPlanData.reduce(
    (sum, plan) => sum + plan.setWithCount.length,
    0,
  );
  const avgSets =
    totalWorkouts > 0 ? (totalSets / totalWorkouts).toFixed(1) : "0";

  const completedSets = monthlyPlanData.reduce(
    (sum, plan) =>
      sum + plan.setWithCount.filter((s) => s.progress === "완료").length,
    0,
  );
  const completionRate =
    totalSets > 0 ? Math.round((completedSets / totalSets) * 100) : 0;

  const uniqueDays = new Set(
    monthlyPlanData.map((p) => p.createdAt.split(" ")[0]),
  ).size;

  return (
    <View style={[styles.container, { backgroundColor: themeColor.itemColor }]}>
      <Text style={{ fontSize: 18 }}>
        {t("chart.monthlySummary")}
      </Text>
      <View style={{ height: 1, backgroundColor: themeColor.divider }} />
      {totalWorkouts === 0 ? (
        <ChartEmptyState
          message={t("chart.emptyMonth")}
          themeColor={themeColor}
        />
      ) : (
        <>
          <View
            style={[styles.grid, { backgroundColor: themeColor.itemColor }]}
          >
            <View
              style={[
                styles.gridItem,
                { backgroundColor: themeColor.itemColor },
              ]}
            >
              <Text style={[styles.statValue, { color: themeColor.tintText }]}>
                {totalWorkouts}
              </Text>
              <Text style={[styles.statLabel, { color: themeColor.subText }]}>
                {t("chart.totalWorkout")}
              </Text>
            </View>
            <View
              style={[
                styles.gridItem,
                { backgroundColor: themeColor.itemColor },
              ]}
            >
              <Text style={[styles.statValue, { color: themeColor.tintText }]}>
                {t("common.days", { n: uniqueDays })}
              </Text>
              <Text style={[styles.statLabel, { color: themeColor.subText }]}>
                {t("chart.workoutDays")}
              </Text>
            </View>
            <View
              style={[
                styles.gridItem,
                { backgroundColor: themeColor.itemColor },
              ]}
            >
              <Text style={[styles.statValue, { color: themeColor.tintText }]}>
                {avgSets}
              </Text>
              <Text style={[styles.statLabel, { color: themeColor.subText }]}>
                {t("chart.avgSets")}
              </Text>
            </View>
            <View
              style={[
                styles.gridItem,
                { backgroundColor: themeColor.itemColor },
              ]}
            >
              <Text style={[styles.statValue, { color: themeColor.tintText }]}>
                {completionRate}%
              </Text>
              <Text style={[styles.statLabel, { color: themeColor.subText }]}>
                {t("chart.completionRate")}
              </Text>
            </View>
          </View>
          {mostTrained.count > 0 && (
            <View
              style={[
                styles.mostTrained,
                { backgroundColor: themeColor.itemColor },
              ]}
            >
              <Text style={{ fontFamily: "sb-l", color: themeColor.text }}>
                {t("chart.mostTrained")}
              </Text>
              <Text style={{ color: themeColor.tintText, fontSize: 16 }}>
                {tBodyPart(mostTrained.type, lang)} (
                {t("common.count", { n: mostTrained.count })})
              </Text>
            </View>
          )}
          <View
            style={{ height: 1, backgroundColor: themeColor.divider }}
          />
          {/* 캘린더는 "날짜 → 그날 기록" 탐색 도구라 상시 노출 대신 여기서 연다.
              기록이 없는 달엔 빈 달력만 열리므로 링크도 감춘다. */}
          {/* SettingItem과 같은 평평한 row — 아이콘/텍스트를 중첩 View로 묶으면 정렬이 틀어진다 */}
          <TouchableOpacity
            style={styles.calendarLink}
            onPress={() => push("/workout/calendar")}
            activeOpacity={0.6}
          >
            <MaterialCommunityIcons
              name="calendar-month-outline"
              size={20}
              color={themeColor.tintText}
            />
            <Text style={styles.calendarLinkText}>
              {t("chart.openCalendar")}
            </Text>
            <AntDesign name="right" size={15} color={themeColor.subText} />
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 12,
    paddingTop: 20,
    // 마지막 줄(달력 링크)은 자체 padding + 글자 line box의 디센더 여유분이 더 붙어
    // 그대로 20을 주면 아래가 8pt 더 떠 보인다. 시각적 여백을 위와 맞춘 값.
    paddingBottom: 12,
    borderRadius: 12,
    marginTop: 24,
    gap: 12,
  },
  grid: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  gridItem: {
    alignItems: "center",
    gap: 4,
    flex: 1,
  },
  statValue: {
    fontSize: 22,
    fontFamily: "sb-b",
  },
  statLabel: {
    // 영어 라벨은 두 줄로 접히므로 가운데 정렬해야 숫자와 축이 맞는다
    textAlign: "center",
    fontSize: 12,
    fontFamily: "sb-l",
  },
  mostTrained: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 4,
  },
  calendarLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 4,
  },
  calendarLinkText: {
    flex: 1,
    fontSize: 15,
    // 아이콘(20)과 같은 line box 높이를 줘야 alignItems:"center"가 글리프 기준으로 맞는다
    lineHeight: 20,
  },
});
