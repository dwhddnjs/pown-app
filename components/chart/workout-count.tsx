import React from "react";
// component
import { StyleSheet } from "react-native";
import { Text, View } from "../themed";
// icon
import Back from "@/assets/images/svg/back_icon.svg";
import Arm from "@/assets/images/svg/arm_icon.svg";
import Chest from "@/assets/images/svg/chest_icon.svg";
import Leg from "@/assets/images/svg/leg_icon.svg";
import Shoulder from "@/assets/images/svg/shoulder_icon.svg";
import { ChartEmptyState } from "./chart-empty-state";
// hook
import useCurrentThemeColor from "@/hooks/use-current-theme-color";
import { useT } from "@/hooks/use-t";
import { sortWorkoutPlanList } from "@/lib/function";
import { useMonthlyPlanData } from "@/hooks/use-monthly-plan-data";
import { useChartStore } from "@/hooks/use-chart-store";

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
    <View style={[styles.container, { backgroundColor: themeColor.itemColor }]}>
      <Text style={{ fontSize: 18, marginLeft: 6 }}>{t("chart.countTitle")}</Text>
      <View style={{ height: 1, backgroundColor: themeColor.tabIconDefault }} />
      {isEmptyCount ? (
        <ChartEmptyState
          message={t("chart.countEmpty")}
          themeColor={themeColor}
        />
      ) : (
        <View
          style={[
            styles.iconListContainer,
            { backgroundColor: themeColor.itemColor, marginHorizontal: 6 },
          ]}
        >
          <View
            style={[
              styles.iconItem,
              { backgroundColor: themeColor.itemColor },
            ]}
          >
            <Back />
            <Text style={{ color: themeColor.tint }}>{t("common.count", { n: listCount.back })}</Text>
          </View>
          <View
            style={[
              styles.iconItem,
              { backgroundColor: themeColor.itemColor },
            ]}
          >
            <Chest />
            <Text style={{ color: themeColor.tint }}>{t("common.count", { n: listCount.chest })}</Text>
          </View>
          <View
            style={[
              styles.iconItem,
              { backgroundColor: themeColor.itemColor },
            ]}
          >
            <Shoulder />
            <Text style={{ color: themeColor.tint }}>
              {t("common.count", { n: listCount.shoulder })}
            </Text>
          </View>
          <View
            style={[
              styles.iconItem,
              { backgroundColor: themeColor.itemColor },
            ]}
          >
            <Leg />
            <Text style={{ color: themeColor.tint }}>{t("common.count", { n: listCount.leg })}</Text>
          </View>
          <View
            style={[
              styles.iconItem,
              { backgroundColor: themeColor.itemColor },
            ]}
          >
            <Arm />
            <Text style={{ color: themeColor.tint }}>{t("common.count", { n: listCount.arm })}</Text>
          </View>
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
    gap: 12,
  },
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
