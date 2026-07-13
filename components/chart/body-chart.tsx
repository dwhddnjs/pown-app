import React from "react";
// component
import { StyleSheet, useWindowDimensions } from "react-native";
import { Text, View } from "../themed";
import { LineChart } from "react-native-gifted-charts";
// hook
import useCurrentThemeColor from "@/hooks/use-current-theme-color";
import { useUserStore } from "@/hooks/use-user-store";
import { useChartStore } from "@/hooks/use-chart-store";
// lib
import { getMonthlyBodyData } from "@/lib/function";
import { ChartEmptyState } from "./chart-empty-state";

export const BodyChart = () => {
  const themeColor = useCurrentThemeColor();
  const { userInfo } = useUserStore();
  const { date } = useChartStore();
  const { width } = useWindowDimensions();

  const bodyData = getMonthlyBodyData(userInfo, date);
  const isEmptyData = bodyData.length === 0;
  // 화면 폭 - (차트 탭 좌우 패딩 + 카드 패딩 + y축 라벨 영역)
  const chartWidth = width - 110;

  return (
    <View
      style={[styles.container, { backgroundColor: themeColor.itemColor }]}
    >
      <Text
        style={{
          fontSize: 18,
          paddingHorizontal: 12,
          paddingTop: 20,
          marginLeft: 6,
        }}
      >
        몸무게의 변화
      </Text>
      <View
        style={{
          height: 1,
          backgroundColor: themeColor.tabIconDefault,
          marginHorizontal: 12,
        }}
      />
      {isEmptyData ? (
        <ChartEmptyState
          message="기록된 몸무게 데이터가 없습니다."
          themeColor={themeColor}
        />
      ) : (
        <View
          style={{
            backgroundColor: themeColor.itemColor,
            paddingVertical: 4,
            paddingLeft: 12,
          }}
        >
          <LineChart
            disableScroll
            areaChart
            data={bodyData}
            rotateLabel
            width={chartWidth}
            adjustToWidth
            dataPointsColor={themeColor.tint}
            color={themeColor.tint}
            thickness={2}
            startFillColor={themeColor.pressed}
            endFillColor={themeColor.itemColor}
            startOpacity={0.9}
            endOpacity={0.2}
            initialSpacing={10}
            endSpacing={10}
            noOfSections={5}
            hideRules
            yAxisTextStyle={{ color: themeColor.text }}
            yAxisThickness={0}
            xAxisColor={themeColor.subText}
            xAxisThickness={0}
            yAxisColor={themeColor.subText}
            xAxisLabelTextStyle={{
              textAlign: "center",
              fontFamily: "sb-l",
              color: themeColor.text,
            }}
            pointerConfig={{
              pointerStripHeight: 160,
              pointerStripColor: themeColor.subText,
              pointerStripWidth: 1,
              pointerColor: themeColor.tint,
              radius: 6,
              pointerLabelWidth: 100,
              activatePointersOnLongPress: true,
              // autoAdjustPointerLabelPosition: true,
              pointerLabelComponent: (
                items: { id: number; value: number; date: string }[],
                index: number,
              ) => {
                return (
                  <View
                    style={{
                      borderRadius: 8,
                      backgroundColor: themeColor.background,
                      paddingVertical: 6,
                      paddingHorizontal: 4,
                      gap: 4,
                      position: "absolute",
                      left: items[0].id >= 21 ? -80 : 5,
                      top: 4,
                      borderColor: themeColor.subText,
                    }}
                  >
                    <Text style={{ fontSize: 10 }}>{items[0].date}</Text>
                    <Text
                      style={{ fontWeight: "bold", color: themeColor.tint }}
                    >
                      {items[0].value + "kg"}
                    </Text>
                  </View>
                );
              },
            }}
          />
        </View>
      )}
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    paddingBottom: 18,
    borderRadius: 12,
    gap: 12,
  },
});
