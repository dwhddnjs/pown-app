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

  // gifted-charts는 x축 라벨을 점보다 왼쪽에 치우쳐 그린다(실측). marginLeft로 되민다.
  // marginLeft는 라벨 컨테이너 폭도 같이 줄여 실제 이동량은 값의 절반이다.
  const xAxisLabelStyle = {
    textAlign: "center" as const,
    fontFamily: "sb-l",
    fontSize: 12,
    color: themeColor.text,
    marginLeft: 20,
  };

  // 선·영역을 축 좌우 끝에 딱 붙이려 첫/마지막 점을 축 끝에 둔다(spacing 0).
  // 그러면 두 라벨의 바깥쪽 절반이 SVG 캔버스를 벗어나 잘리므로, 그 절반만큼
  // transform으로 안쪽으로 당긴다(정렬은 그만큼 어긋나지만 양 끝 라벨뿐).
  const edgeLabelData = chartData.map((d, i) =>
    i === 0
      ? { ...d, labelTextStyle: { ...xAxisLabelStyle, marginLeft: 14 } }
      : i === chartData.length - 1
        ? {
            ...d,
            labelTextStyle: {
              ...xAxisLabelStyle,
              transform: [{ translateX: -16 }],
            },
          }
        : d,
  );

  const Y_AXIS_LABEL_WIDTH = 40;
  // 카드 콘텐츠 폭 = 화면폭 - (차트 탭 패딩 20*2 + 카드 패딩 12*2)
  const cardContentWidth = width - 64;
  const chartWidth = cardContentWidth - Y_AXIS_LABEL_WIDTH;
  const pointSpacing =
    chartData.length > 1 ? chartWidth / (chartData.length - 1) : 0;

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
      <Text style={{ fontSize: 18 }}>{t("chart.bodyTitle")}</Text>
      <View style={{ height: 1, backgroundColor: themeColor.divider }} />
      {isEmptyData ? (
        <ChartEmptyState
          message={t("chart.bodyEmpty")}
          themeColor={themeColor}
        />
      ) : (
        <View
          style={{
            // gifted-charts가 그리는 축·격자선 실폭은 width prop보다 20pt쯤 넓다.
            // 계산으로 맞추지 말고 카드 안쪽 폭에서 잘라낸다(equipment-chart와 동일).
            overflow: "hidden",
            backgroundColor: themeColor.itemColor,
            paddingVertical: 4,
          }}
        >
          <LineChart
            disableScroll
            areaChart
            data={edgeLabelData}
            height={CHART_HEIGHT}
            width={chartWidth}
            spacing={pointSpacing}
            dataPointsColor={themeColor.tint}
            color={themeColor.tintText}
            thickness={2}
            startFillColor={themeColor.pressed}
            endFillColor={themeColor.itemColor}
            startOpacity={0.9}
            endOpacity={0.2}
            initialSpacing={0}
            endSpacing={0}
            noOfSections={noOfSections}
            maxValue={maxValue}
            yAxisOffset={yAxisOffset}
            stepValue={maxValue / noOfSections}
            // 같은 탭의 막대 차트들과 축·격자 표현을 맞춘다
            rulesType="dashed"
            rulesColor={themeColor.divider}
            yAxisLabelWidth={Y_AXIS_LABEL_WIDTH}
            yAxisTextStyle={{ color: themeColor.text }}
            yAxisThickness={1}
            xAxisColor={themeColor.subText}
            xAxisThickness={1}
            yAxisColor={themeColor.subText}
            xAxisLabelTextStyle={xAxisLabelStyle}
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
                      style={{ fontWeight: "bold", color: themeColor.tintText }}
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
