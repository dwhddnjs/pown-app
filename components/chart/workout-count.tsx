import React from "react";
// component
import { StyleSheet } from "react-native";
import { Text, View } from "../themed";
import { ChartCard } from "./chart-card";
// hook
import useCurrentThemeColor from "@/hooks/use-current-theme-color";
import { useT } from "@/hooks/use-t";
import { sortWorkoutPlanList } from "@/lib/stats";
import { useMonthlyPlanData } from "@/hooks/use-monthly-plan-data";
import { useChartStore } from "@/hooks/use-chart-store";
// icon
import { BODY_PART_ITEMS } from "@/constants/body-part";

export const WorkoutCount = () => {
  const themeColor = useCurrentThemeColor();
  const t = useT();
  const { date } = useChartStore();
  const { monthlyPlanData } = useMonthlyPlanData(date);
  const listCount = sortWorkoutPlanList(monthlyPlanData);

  const isEmptyCount =
    listCount.arm +
      listCount.back +
      listCount.chest +
      listCount.leg +
      listCount.shoulder ===
    0;

  return (
    <ChartCard
      title={t("chart.countTitle")}
      isEmpty={isEmptyCount}
      emptyMessage={t("chart.countEmpty")}
    >
      <View
        style={[
          styles.iconListContainer,
          { backgroundColor: themeColor.itemColor },
        ]}
      >
        {BODY_PART_ITEMS.map(({ type, icon: Icon }) => (
          <View
            key={type}
            style={[styles.iconItem, { backgroundColor: themeColor.itemColor }]}
          >
            <Icon />
            <Text style={{ color: themeColor.tintText }}>
              {t("common.count", { n: listCount[type] })}
            </Text>
          </View>
        ))}
      </View>
    </ChartCard>
  );
};

const styles = StyleSheet.create({
  iconItem: {
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
  },
  iconListContainer: {
    justifyContent: "space-between",
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
    paddingVertical: 4,
  },
});
