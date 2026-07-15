import React, { useMemo } from "react";
// component
import { StyleSheet } from "react-native";
import { Text, View } from "../themed";
import { BarChart } from "react-native-gifted-charts";
// hook
import useCurrentThemeColor from "@/hooks/use-current-theme-color";
import { getEquipmentCount } from "@/lib/function";
import { useMonthlyPlanData } from "@/hooks/use-monthly-plan-data";
import { useChartStore } from "@/hooks/use-chart-store";
import { ChartEmptyState } from "./chart-empty-state";

export const EquipmentChart = () => {
  const themeColor = useCurrentThemeColor();
  const { date } = useChartStore();
  const { monthlyPlanData } = useMonthlyPlanData(date);
  const equipmentCount = getEquipmentCount(monthlyPlanData);

  const isEmptyCount =
    (Object.values(equipmentCount) as number[]).reduce(
      (acc: number, cur: number) => acc + cur,
    ) === 0;

  // 최대 기록에 여유를 두되 최소 5 — 축을 데이터에 맞춰야 작은 값도 막대가 보인다
  const maxValue = Math.max(
    5,
    Math.ceil(Math.max(...(Object.values(equipmentCount) as number[])) * 1.2),
  );

  const barData1 = useMemo(
    () => [
      {
        value: equipmentCount.babel,
        label: "바벨",
        frontColor: themeColor.tint,
      },
      {
        value: equipmentCount.dumbel,
        label: "덤벨",
        frontColor: themeColor.tint,
      },
      {
        value: equipmentCount.machine,
        label: "머신",
        frontColor: themeColor.tint,
      },
      {
        value: equipmentCount.smith,
        label: "스미스",
        frontColor: themeColor.tint,
      },
      {
        value: equipmentCount.cable,
        label: "케이블",
        frontColor: themeColor.tint,
      },
      {
        value: equipmentCount.body,
        label: "맨몸",
        frontColor: themeColor.tint,
      },
    ],
    [equipmentCount, themeColor.tint],
  );

  return (
    <View style={[styles.container, { backgroundColor: themeColor.itemColor }]}>
      <Text style={{ fontSize: 18, marginLeft: 6 }}>주로 뭐로 운동했지?</Text>
      <View
        style={{
          height: 1,
          backgroundColor: themeColor.tabIconDefault,
        }}
      />
      {isEmptyCount ? (
        <ChartEmptyState
          message="기록된 운동장비 데이터가 없습니다."
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
            barWidth={24}
            noOfSections={5}
            maxValue={maxValue}
            barBorderRadius={4}
            frontColor={themeColor.subText}
            disableScroll
            data={barData1}
            shiftY={10}
            sideWidth={15}
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
              fontWeight: "bold",
              fontFamily: "sb-l",
            }}
            yAxisTextStyle={{
              color: themeColor.text,
              fontWeight: "bold",
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
    overflow: "hidden",
  },
});
