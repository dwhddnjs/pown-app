import React, { useMemo } from "react";
// component
import { StyleSheet } from "react-native";
import { Text, View } from "../Themed";
import { PieChart } from "react-native-gifted-charts";
// hook
import { ThemeColorType } from "@/constants/Colors";
import useCurrentThemeColor from "@/hooks/use-current-theme-color";
// lib
import {
  convertChartValuesToPercentage,
  sortWorkoutPlanList,
} from "@/lib/function";
import { useChartStore } from "@/hooks/use-chart-store";
import { useMonthlyPlanData } from "@/hooks/use-monthly-plan-data";
import { ChartEmptyState } from "./chart-empty-state";

const WorkoutPieChart = () => {
  const themeColor = useCurrentThemeColor();
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

  const chartValue = useMemo(
    () => [
      { value: listCount.back, color: "#F13C33", title: "등" },
      { value: listCount.chest, color: "#FFC134", title: "가슴" },
      { value: listCount.shoulder, color: "#3CC42E", title: "어깨" },
      { value: listCount.leg, color: "#3A76E2", title: "하체" },
      { value: listCount.arm, color: "#9A48C1", title: "팔" },
    ],
    [listCount],
  );

  const percentageData = useMemo(
    () => convertChartValuesToPercentage(chartValue),
    [chartValue],
  );

  return (
    <View style={[styles(themeColor).container]}>
      <Text style={{ fontSize: 18, marginLeft: 6 }}>
        주로 어느 부위 운동을 했지?
      </Text>
      <View style={{ height: 1, backgroundColor: themeColor.tabIconDefault }} />
      {isEmptyCount ? (
        <ChartEmptyState
          message="기록된 운동부위 데이터가 없습니다."
          themeColor={themeColor}
        />
      ) : (
        <View
          style={[styles(themeColor).itemContainer, { marginHorizontal: 6 }]}
        >
          <PieChart
            data={percentageData}
            donut
            shadow
            showText
            showValuesAsLabels
            textColor={themeColor.text}
            fontWeight="bold"
            textBackgroundRadius={26}
            backgroundColor={themeColor.itemColor}
          />
          <View style={{ backgroundColor: themeColor.itemColor }}>
            {(
              percentageData as {
                value: number;
                color: string;
                title: string;
                text: string;
              }[]
            ).map((item) => (
              <View
                style={{
                  flexDirection: "row",
                  backgroundColor: themeColor.itemColor,
                }}
                key={item.title}
              >
                <Text style={{ color: item.color, fontSize: 12 }}>
                  {item.title} :{" "}
                </Text>
                <Text style={{ fontSize: 12 }}>{item.text}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );
};

export default WorkoutPieChart;

const styles = (color: ThemeColorType) =>
  StyleSheet.create({
    container: {
      backgroundColor: color.itemColor,
      paddingHorizontal: 12,
      paddingVertical: 20,
      borderRadius: 12,
      gap: 12,
    },
    itemContainer: {
      backgroundColor: color.itemColor,
      flexDirection: "row",
      paddingVertical: 4,
      justifyContent: "space-between",
    },
    emptyContainer: {
      flexDirection: "row",
      paddingVertical: 12,
      paddingHorizontal: 4,
      gap: 6,
      backgroundColor: color.itemColor,
    },
  });
