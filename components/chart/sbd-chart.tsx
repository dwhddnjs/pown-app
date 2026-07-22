import React from "react";
// component
import { StyleSheet } from "react-native";
import { Text, View } from "../themed";
import { BarChart } from "react-native-gifted-charts";
// hook
import useCurrentThemeColor from "@/hooks/use-current-theme-color";
import { useLanguage, useUserStore } from "@/hooks/use-user-store";
import { tWorkout } from "@/lib/i18n";
import { useT } from "@/hooks/use-t";
import { useMonthlyPlanData } from "@/hooks/use-monthly-plan-data";
import { useChartStore } from "@/hooks/use-chart-store";
import { ChartEmptyState } from "./chart-empty-state";

export const SbdChart = () => {
  const { userInfo } = useUserStore();
  const { date } = useChartStore();
  const { monthlyUserInfoData } = useMonthlyPlanData(date);
  const firstWeight = userInfo[0];
  const lastestWeight = monthlyUserInfoData[monthlyUserInfoData.length - 1];

  const themeColor = useCurrentThemeColor();
  const t = useT();
  const lang = useLanguage();
  const data: {
    value?: number;
    frontColor: string;
    spacing?: number;
    label?: string;
  }[] = [
    {
      value: firstWeight?.sq != null ? Number(firstWeight.sq) : undefined,
      frontColor: themeColor?.subText,
      spacing: 8,
      label: tWorkout("스쿼트", lang),
    },
    {
      value: lastestWeight?.sq != null ? Number(lastestWeight.sq) : undefined,
      frontColor: themeColor?.tint,
    },
    {
      value: firstWeight?.bp != null ? Number(firstWeight.bp) : undefined,
      frontColor: themeColor?.subText,
      spacing: 8,
      label: tWorkout("벤치프레스", lang),
    },
    {
      value: lastestWeight?.bp != null ? Number(lastestWeight.bp) : undefined,
      frontColor: themeColor?.tint,
    },
    {
      value: firstWeight?.dl != null ? Number(firstWeight.dl) : undefined,
      frontColor: themeColor?.subText,
      spacing: 8,
      label: tWorkout("데드리프트", lang),
    },
    {
      value: lastestWeight?.dl != null ? Number(lastestWeight.dl) : undefined,
      frontColor: themeColor?.tint,
    },
  ];

  const barValues = data.map((item) => item.value ?? 0);
  // 최대 기록보다 한 눈금 여유를 두고 50kg 단위로 올림.
  // 50의 배수를 5구간으로 나눠야 눈금이 10 단위 정수로 떨어진다
  // (6구간이면 1250/6 = 208.33 → 208,416,625... 처럼 읽을 수 없는 라벨이 된다).
  const NO_OF_SECTIONS = 5;
  const maxValue = Math.max(
    100,
    Math.ceil((Math.max(...barValues, 0) * 1.1) / 50) * 50,
  );

  return (
    <View style={[styles.container, { backgroundColor: themeColor.itemColor }]}>
      <Text style={{ fontSize: 18 }}>{t("chart.sbdTitle")}</Text>
      {/* 범례 설명은 차트가 그려질 때만 의미가 있다 */}
      {firstWeight && (
        <Text
          style={{
            fontSize: 12,
            fontFamily: "sb-l",
            color: themeColor.subText,
          }}
        >
          {t("chart.sbdLegend")}
        </Text>
      )}
      <View style={{ height: 1, backgroundColor: themeColor.divider }} />
      {!firstWeight ? (
        <ChartEmptyState
          message={t("chart.sbdEmpty")}
          themeColor={themeColor}
        />
      ) : (
        <View
          style={{
            overflow: "hidden",
            backgroundColor: themeColor.itemColor,
            paddingVertical: 4,
          }}
        >
          <BarChart
            data={data}
            barWidth={28}
            disableScroll
            barBorderRadius={4}
            yAxisTextStyle={{ color: themeColor.text, fontFamily: "sb-l" }}
            maxValue={maxValue}
            noOfSections={NO_OF_SECTIONS}
            labelWidth={65}
            yAxisThickness={1}
            xAxisThickness={1}
            yAxisColor={themeColor.subText}
            xAxisColor={themeColor.subText}
            rulesColor={themeColor.subText}
            barInnerComponent={(item) => (
              <Text
                style={{ textAlign: "center", fontSize: 10, paddingTop: 2 }}
              >
                {item?.value}
              </Text>
            )}
            xAxisLabelTextStyle={{
              color: themeColor.text,
              textAlign: "center",
              fontFamily: "sb-l",
            }}
          />
        </View>
      )}
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
});
