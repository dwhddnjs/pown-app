import React from "react";
import { StyleSheet } from "react-native";
import { Text, View } from "../themed";
import useCurrentThemeColor from "@/hooks/use-current-theme-color";
import { useMonthlyPlanData } from "@/hooks/use-monthly-plan-data";
import { useChartStore } from "@/hooks/use-chart-store";
import { sortWorkoutPlanList } from "@/lib/function";
import { ChartEmptyState } from "./chart-empty-state";

const typeLabel: Record<string, string> = {
  chest: "가슴",
  back: "등",
  shoulder: "어깨",
  leg: "하체",
  arm: "팔",
};

export const WorkoutSummary = () => {
  const themeColor = useCurrentThemeColor();
  const { date } = useChartStore();
  const { monthlyPlanData } = useMonthlyPlanData(date);

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

  if (totalWorkouts === 0) {
    return (
      <View style={[styles.container, { backgroundColor: themeColor.itemColor }]}>
        <Text style={{ fontSize: 18, marginLeft: 6 }}>월간 요약</Text>
        <View
          style={{ height: 1, backgroundColor: themeColor.tabIconDefault }}
        />
        <ChartEmptyState
          message="이번 달 운동 기록이 없습니다."
          themeColor={themeColor}
        />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: themeColor.itemColor }]}>
      <Text style={{ fontSize: 18, marginLeft: 6 }}>월간 요약</Text>
      <View style={{ height: 1, backgroundColor: themeColor.tabIconDefault }} />
      <View style={[styles.grid, { backgroundColor: themeColor.itemColor }]}>
        <View
          style={[styles.gridItem, { backgroundColor: themeColor.itemColor }]}
        >
          <Text
            style={[styles.statValue, { color: themeColor.tint }]}
          >
            {totalWorkouts}
          </Text>
          <Text style={[styles.statLabel, { color: themeColor.subText }]}>총 운동</Text>
        </View>
        <View
          style={[styles.gridItem, { backgroundColor: themeColor.itemColor }]}
        >
          <Text
            style={[styles.statValue, { color: themeColor.tint }]}
          >
            {uniqueDays}일
          </Text>
          <Text style={[styles.statLabel, { color: themeColor.subText }]}>운동한 날</Text>
        </View>
        <View
          style={[styles.gridItem, { backgroundColor: themeColor.itemColor }]}
        >
          <Text
            style={[styles.statValue, { color: themeColor.tint }]}
          >
            {avgSets}
          </Text>
          <Text style={[styles.statLabel, { color: themeColor.subText }]}>평균 세트</Text>
        </View>
        <View
          style={[styles.gridItem, { backgroundColor: themeColor.itemColor }]}
        >
          <Text
            style={[styles.statValue, { color: themeColor.tint }]}
          >
            {completionRate}%
          </Text>
          <Text style={[styles.statLabel, { color: themeColor.subText }]}>달성률</Text>
        </View>
      </View>
      {mostTrained.count > 0 && (
        <View
          style={[
            styles.mostTrained,
            { backgroundColor: themeColor.itemColor, marginHorizontal: 6 },
          ]}
        >
          <Text style={{ fontFamily: "sb-l", color: themeColor.text }}>
            가장 많이 훈련한 부위
          </Text>
          <Text style={{ color: themeColor.tint, fontSize: 16 }}>
            {typeLabel[mostTrained.type] ?? mostTrained.type} (
            {mostTrained.count}회)
          </Text>
        </View>
      )}
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 12,
    paddingVertical: 20,
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
    fontSize: 12,
    fontFamily: "sb-l",
  },
  mostTrained: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 4,
  },
});
