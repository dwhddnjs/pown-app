import React, { useMemo } from "react";
// component
import { StyleSheet } from "react-native";
import { Text, View } from "../themed";
import { PieChart } from "react-native-gifted-charts";
// hook
import useCurrentThemeColor from "@/hooks/use-current-theme-color";
import { useLanguage } from "@/hooks/use-user-store";
import { tBodyPart } from "@/lib/i18n";
import { useT } from "@/hooks/use-t";
// lib
import {
  convertChartValuesToPercentage,
  sortWorkoutPlanList,
} from "@/lib/function";
import { useChartStore } from "@/hooks/use-chart-store";
import { useMonthlyPlanData } from "@/hooks/use-monthly-plan-data";
import { ChartEmptyState } from "./chart-empty-state";

export const WorkoutPieChart = () => {
  const themeColor = useCurrentThemeColor();
  const t = useT();
  const lang = useLanguage();
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
      { value: listCount.back, color: "#F13C33", title: tBodyPart("back", lang) },
      { value: listCount.chest, color: "#FFC134", title: tBodyPart("chest", lang) },
      { value: listCount.shoulder, color: "#3CC42E", title: tBodyPart("shoulder", lang) },
      { value: listCount.leg, color: "#3A76E2", title: tBodyPart("leg", lang) },
      { value: listCount.arm, color: "#9A48C1", title: tBodyPart("arm", lang) },
    ],
    [listCount, lang],
  );

  const percentageData = useMemo(
    () => convertChartValuesToPercentage(chartValue),
    [chartValue],
  );

  return (
    <View style={[styles.container, { backgroundColor: themeColor.itemColor }]}>
      <Text style={{ fontSize: 18, marginLeft: 6 }}>
        {t("chart.partTitle")}
      </Text>
      <View style={{ height: 1, backgroundColor: themeColor.tabIconDefault }} />
      {isEmptyCount ? (
        <ChartEmptyState
          message={t("chart.partEmpty")}
          themeColor={themeColor}
        />
      ) : (
        <View
          style={[
            styles.itemContainer,
            { backgroundColor: themeColor.itemColor, marginHorizontal: 6 },
          ]}
        >
          <PieChart
            data={percentageData}
            // 기본 radius(120)면 도넛만 240pt라 영어 범례가 카드 밖으로 밀린다
            radius={90}
            // 링이 얇아지면 그 위의 "50%" 라벨이 잘린다 — 링 폭 45pt 확보
            innerRadius={45}
            donut
            shadow
            showText
            showValuesAsLabels
            textColor={themeColor.text}
            fontWeight="bold"
            textBackgroundRadius={26}
            backgroundColor={themeColor.itemColor}
          />
          <View
            style={{
              backgroundColor: themeColor.itemColor,
              justifyContent: "center",
              flexShrink: 1,
              gap: 6,
            }}
          >
            {(
              percentageData as {
                value: number;
                color: string;
                title: string;
                text: string;
              }[]
            )
              // 0%인 부위는 범례에서 제외 — 라이트 테마에서 컬러 텍스트 대비가 낮아 색은 견본으로만 표시
              .filter((item) => item.value > 0)
              .map((item) => (
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 6,
                    backgroundColor: themeColor.itemColor,
                  }}
                  key={item.title}
                >
                  <View
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: 5,
                      backgroundColor: item.color,
                    }}
                  />
                  <Text style={{ fontSize: 12 }}>
                    {item.title} {item.text}
                  </Text>
                </View>
              ))}
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
  itemContainer: {
    flexDirection: "row",
    paddingVertical: 4,
    justifyContent: "space-between",
  },
});
