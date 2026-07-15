import React from "react";
// component
import { StyleSheet } from "react-native";
import { Text, View } from "../themed";
import { BarChart } from "react-native-gifted-charts";
// hook
import useCurrentThemeColor from "@/hooks/use-current-theme-color";
import { useUserStore } from "@/hooks/use-user-store";
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
      label: "스쿼트",
    },
    {
      value: lastestWeight?.sq != null ? Number(lastestWeight.sq) : undefined,
      frontColor: themeColor?.tint,
    },
    {
      value: firstWeight?.bp != null ? Number(firstWeight.bp) : undefined,
      frontColor: themeColor?.subText,
      spacing: 8,
      label: "벤치프레스",
    },
    {
      value: lastestWeight?.bp != null ? Number(lastestWeight.bp) : undefined,
      frontColor: themeColor?.tint,
    },
    {
      value: firstWeight?.dl != null ? Number(firstWeight.dl) : undefined,
      frontColor: themeColor?.subText,
      spacing: 8,
      label: "데드리프트",
    },
    {
      value: lastestWeight?.dl != null ? Number(lastestWeight.dl) : undefined,
      frontColor: themeColor?.tint,
    },
  ];

  const barValues = data.map((item) => item.value ?? 0);
  // 최대 기록보다 한 눈금 여유를 두고 50kg 단위로 올림 — 축 라벨은 자동 생성에 맡긴다
  const maxValue = Math.max(
    100,
    Math.ceil((Math.max(...barValues, 0) * 1.1) / 50) * 50,
  );

  return (
    <View style={[styles.container, { backgroundColor: themeColor.itemColor }]}>
      <Text style={{ fontSize: 18, marginLeft: 6 }}>3대중량의 변화</Text>
      {/* 범례 설명은 차트가 그려질 때만 의미가 있다 */}
      {firstWeight && (
        <Text
          style={{
            fontSize: 12,
            fontFamily: "sb-l",
            marginLeft: 6,
            color: themeColor.subText,
          }}
        >
          회색: 최초 기록  ·  컬러: 선택한 달의 마지막 기록
        </Text>
      )}
      <View style={{ height: 1, backgroundColor: themeColor.tabIconDefault }} />
      {!firstWeight ? (
        <ChartEmptyState
          message="기록된 3대중량 데이터가 없습니다."
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
            noOfSections={6}
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
            showLine
            lineConfig={{
              color: themeColor.success,
              thickness: 3,
              curved: true,
              hideDataPoints: true,
              shiftY: 60,
              initialSpacing: 2,
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
