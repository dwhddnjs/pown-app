import React from "react";
// component
import { StyleSheet, useWindowDimensions } from "react-native";
import { Text, View } from "../themed";
import { LineChart } from "react-native-gifted-charts";
// hook
import useCurrentThemeColor from "@/hooks/use-current-theme-color";
import { useLanguage, useUserStore } from "@/hooks/use-user-store";
import { useT } from "@/hooks/use-t";
import { useChartStore } from "@/hooks/use-chart-store";
// lib
import { getMonthlyBodyData } from "@/lib/function";
import { ChartEmptyState } from "./chart-empty-state";

const POINTER_LABEL_WIDTH = 90;
// 차트 높이를 고정해야 세로선을 정확히 꽉 채울 수 있다(pointerStripHeight = 높이).
const CHART_HEIGHT = 200;

export const BodyChart = () => {
  const themeColor = useCurrentThemeColor();
  const t = useT();
  const lang = useLanguage();
  const { userInfo } = useUserStore();
  const { date } = useChartStore();
  const { width } = useWindowDimensions();

  const bodyData = getMonthlyBodyData(userInfo, date, lang);
  const isEmptyData = bodyData.length === 0;

  // 데이터가 1개면 라인/영역이 안 그려지고 점만 찍힌다.
  // 같은 값의 숨긴 포인트를 덧붙여 평탄한 라인+영역이 그려지게 한다.
  const chartData =
    bodyData.length === 1
      ? [bodyData[0], { ...bodyData[0], label: "", hideDataPoint: true }]
      : bodyData;

  // 차트를 카드 폭에 꽉 채운다 + 마지막 회전 라벨 잘림 방지.
  // 차트 내부 가로 뷰포트(=width prop)가 카드 폭과 같으면, 마지막 라벨을 보이려 점을
  // 안쪽으로 넣어야 하고 → 오른쪽에 빈 여백이 남는다.
  // 해결: 마지막 점을 카드 오른쪽 끝에 붙이고, 뷰포트를 카드 밖(패딩)으로 LABEL_OVERFLOW
  // 만큼 넓혀 회전 라벨이 그 넘치는 공간에 그려지게 한다(카드/탭은 클리핑 안 함).
  const Y_AXIS_LABEL_WIDTH = 40;
  const INITIAL_SPACING = 6;
  const LABEL_OVERFLOW = 28;
  // 카드 콘텐츠 폭 = 화면폭 - (차트 탭 패딩 20*2 + 카드 패딩 12*2)
  const cardContentWidth = width - 64;
  // 마지막 점의 플롯 x좌표(카드 오른쪽 끝에 붙도록)
  const lastPlotX = cardContentWidth - Y_AXIS_LABEL_WIDTH;
  // 뷰포트를 라벨이 넘칠 만큼만 카드 밖으로 확장
  const chartWidth = lastPlotX + LABEL_OVERFLOW;
  const pointSpacing =
    chartData.length > 1
      ? (lastPlotX - INITIAL_SPACING) / (chartData.length - 1)
      : 0;

  // 몸무게는 좁은 대역(예: 70~80kg)에서 움직이므로 0부터 그리면 변화가 안 보인다.
  // 데이터 min/max 주변을 5kg 눈금으로 감싸 y축을 잡는다. (offset 아래로는 잘리므로 주의)
  const weights = bodyData.map((d) => d.value);
  const minWeight = weights.length ? Math.min(...weights) : 0;
  const maxWeight = weights.length ? Math.max(...weights) : 0;
  const yAxisOffset = Math.max(0, Math.floor((minWeight - 3) / 5) * 5);
  const yAxisMax = Math.ceil((maxWeight + 3) / 5) * 5;
  // offset-상대 축 높이. 최소 10kg 폭은 확보해 단일/평탄 데이터도 보기 좋게.
  const maxValue = Math.max(yAxisMax - yAxisOffset, 10);
  const noOfSections = 5;

  return (
    <View style={[styles.container, { backgroundColor: themeColor.itemColor }]}>
      <Text style={{ fontSize: 18, marginLeft: 6 }}>{t("chart.bodyTitle")}</Text>
      <View style={{ height: 1, backgroundColor: themeColor.tabIconDefault }} />
      {isEmptyData ? (
        <ChartEmptyState
          message={t("chart.bodyEmpty")}
          themeColor={themeColor}
        />
      ) : (
        <View
          style={{
            backgroundColor: themeColor.itemColor,
            paddingVertical: 4,
          }}
        >
          <LineChart
            disableScroll
            areaChart
            data={chartData}
            rotateLabel
            height={CHART_HEIGHT}
            width={chartWidth}
            spacing={pointSpacing}
            dataPointsColor={themeColor.tint}
            color={themeColor.tint}
            thickness={2}
            startFillColor={themeColor.pressed}
            endFillColor={themeColor.itemColor}
            startOpacity={0.9}
            endOpacity={0.2}
            initialSpacing={INITIAL_SPACING}
            endSpacing={0}
            noOfSections={noOfSections}
            maxValue={maxValue}
            yAxisOffset={yAxisOffset}
            stepValue={maxValue / noOfSections}
            hideRules
            yAxisLabelWidth={Y_AXIS_LABEL_WIDTH}
            yAxisTextStyle={{ color: themeColor.text }}
            yAxisThickness={0}
            xAxisColor={themeColor.subText}
            xAxisThickness={0}
            yAxisColor={themeColor.subText}
            xAxisLabelTextStyle={{
              textAlign: "center",
              fontFamily: "sb-l",
              fontSize: 12,
              color: themeColor.text,
            }}
            pointerConfig={{
              // pointerStripHeight = 차트 높이 → 세로선이 위→아래 꽉 참 + 라벨 marginTop 0(보임).
              pointerStripHeight: CHART_HEIGHT,
              pointerStripColor: themeColor.subText,
              pointerStripWidth: 1,
              pointerColor: themeColor.tint,
              radius: 6,
              pointerLabelWidth: POINTER_LABEL_WIDTH,
              activatePointersOnLongPress: true,
              // autoAdjust는 넓힌 뷰포트 기준으로 잘못 판단(오른쪽 넘침)하므로 끄고 index로 직접 배치.
              autoAdjustPointerLabelPosition: false,
              // uptoDataPoint=false + stripHeight=높이 → 선 꽉 참. 라벨 y = shiftPointerLabelY - 37.
              pointerStripUptoDataPoint: false,
              shiftPointerLabelY: 45,
              pointerLabelComponent: (
                items: { id: number; value: number; date: string }[],
                _secondaryItems: unknown,
                index: number,
              ) => {
                // 컨테이너는 pointerX-4에 위치하고 세로선은 pointerX+8(≈컨테이너 기준 12)에 그려진다.
                // 박스의 선쪽 가장자리를 선에서 GAP만큼 떨어뜨려 양 끝 모두 살짝 간격 있게 통일한다.
                const LINE_X = 12;
                const GAP = 0;
                const isFirst = index === 0;
                const isLast = index === chartData.length - 1;
                const left = isFirst
                  ? LINE_X + GAP // 박스는 선 오른쪽, GAP만큼 띄움
                  : isLast
                    ? LINE_X - GAP - POINTER_LABEL_WIDTH // 박스는 선 왼쪽, GAP만큼 띄움
                    : LINE_X - POINTER_LABEL_WIDTH / 2;
                return (
                  <View
                    style={{
                      position: "absolute",
                      left,
                      top: 0,
                      width: POINTER_LABEL_WIDTH,
                      borderRadius: 8,
                      backgroundColor: themeColor.background,
                      paddingVertical: 6,
                      paddingHorizontal: 8,
                      gap: 4,
                      borderWidth: 1,
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
    paddingVertical: 20,
    paddingHorizontal: 12,
    borderRadius: 12,
    gap: 12,
  },
});
