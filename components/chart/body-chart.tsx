import React from "react";
// component
import { useWindowDimensions } from "react-native";
import { Text, View } from "../themed";
import { LineChart } from "react-native-gifted-charts";
import { LinearGradient, Stop } from "react-native-svg";
// hook
import useCurrentThemeColor from "@/hooks/use-current-theme-color";
import { useLanguage, useUserStore } from "@/hooks/use-user-store";
import { useT } from "@/hooks/use-t";
import { useChartStore } from "@/hooks/use-chart-store";
// lib
import { getMonthlyBodyData } from "@/lib/stats";
import { ChartBody, ChartCard } from "./chart-card";

const POINTER_LABEL_WIDTH = 90;
// x축 날짜 라벨 폭 — "30일"(12pt)이 들어간다. 라벨끼리는 GAP 이상 띄운다
const LABEL_WIDTH = 32;
const LABEL_GAP = 4;
// 차트 높이를 고정해야 세로선을 정확히 꽉 채울 수 있다(pointerStripHeight = 높이).
const CHART_HEIGHT = 200;
// 영역 그라데이션 — 원래 청록 0.9 → 카드색 0.2였는데, 색이 바뀌는 그라데이션을 iOS는 색·투명도를 따로
// 섞고(비-프리멀티플라이) 안드로이드는 투명도를 곱한 채 섞어(프리멀티플라이) 안드로이드만 선형으로
// 옅어졌다. 색은 청록 하나로 두고 iOS가 섞던 청록의 비중 (0.9 - 0.7t)(1 - t)을 단계로 찍으면 두 플랫폼이
// 같은 그라데이션을 그린다 (9단계면 곡선과의 차이가 색값 1 미만)
const AREA_STOPS = Array.from({ length: 9 }, (_, index) => index / 8);

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

  const xAxisLabelStyle = {
    fontFamily: "sb-l",
    fontSize: 12,
    color: themeColor.text,
  };

  const Y_AXIS_LABEL_WIDTH = 40;
  // 카드 콘텐츠 폭 = 화면폭 - (차트 탭 패딩 20*2 + 카드 패딩 12*2)
  const cardContentWidth = width - 64;
  const chartWidth = cardContentWidth - Y_AXIS_LABEL_WIDTH;
  const pointSpacing =
    chartData.length > 1 ? chartWidth / (chartData.length - 1) : 0;

  // gifted-charts는 라벨 칸 폭을 점 간격으로 잡는다 — 한 달에 8번 넘게 재면 칸이 좁아져
  // "15···"로 잘렸다. 라벨에 고정 폭을 주고(칸 밖으로 넘쳐 그려진다) 겹치는 라벨은 건너뛴다.
  // 위치는 첫 점을 0으로 한 좌표다. 선·영역을 축 끝에 붙이려 양 끝 점이 캔버스 끝에 있어
  // 바깥으로 나간 글자는 잘린다 — 양 끝 라벨만 축 끝에 맞춰 안쪽으로 붙인다.
  const last = chartData.length - 1;
  const labelStart = (i: number) =>
    i === 0
      ? 0
      : i === last
        ? pointSpacing * i - LABEL_WIDTH
        : pointSpacing * i - LABEL_WIDTH / 2;
  // 라벨 칸의 왼쪽 끝 — 점보다 칸 반 + 10 왼쪽이고, 첫 칸만 14 오른쪽이다(라이브러리 실측·소스)
  const slotStart = (i: number) =>
    pointSpacing * i - pointSpacing / 2 + (i === 0 ? 4 : -10);
  let prevEnd = -Infinity;
  const labeledData = chartData.map((d, i) => {
    const start = labelStart(i);
    const fits =
      !!d.label &&
      start >= prevEnd + LABEL_GAP &&
      (i === last || start + LABEL_WIDTH + LABEL_GAP <= labelStart(last));
    if (!fits) return { ...d, label: "" };
    prevEnd = start + LABEL_WIDTH;
    return {
      ...d,
      labelTextStyle: {
        ...xAxisLabelStyle,
        width: LABEL_WIDTH,
        marginLeft: start - slotStart(i),
        textAlign: i === 0 ? "left" : i === last ? "right" : "center",
      } as const,
    };
  });

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
    <ChartCard
      title={t("chart.bodyTitle")}
      isEmpty={isEmptyData}
      emptyMessage={t("chart.bodyEmpty")}
    >
      <ChartBody>
        <LineChart
          disableScroll
          areaChart
          data={labeledData}
          height={CHART_HEIGHT}
          width={chartWidth}
          spacing={pointSpacing}
          dataPointsColor={themeColor.tint}
          color={themeColor.tintText}
          thickness={2}
          areaGradientComponent={() => (
            <LinearGradient id="Gradient" x1="0" y1="0" x2="0" y2="1">
              {AREA_STOPS.map((offset) => (
                <Stop
                  key={offset}
                  offset={offset}
                  stopColor={themeColor.pressed}
                  stopOpacity={(0.9 - 0.7 * offset) * (1 - offset)}
                />
              ))}
            </LinearGradient>
          )}
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
          // 축 글자도 앱 글꼴 — 빠지면 시스템 글꼴(SF / Roboto)이라 플랫폼마다 모양이 다르다
          yAxisTextStyle={{ color: themeColor.text, fontFamily: "sb-l" }}
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
                    borderCurve: "continuous",
                    overflow: "hidden",
                    backgroundColor: themeColor.background,
                    paddingVertical: 6,
                    paddingHorizontal: 8,
                    gap: 4,
                    borderWidth: 1,
                    borderColor: themeColor.subText,
                  }}
                >
                  <Text style={{ fontSize: 10 }}>{items[0].date}</Text>
                  {/* fontWeight 없이 — 안드로이드는 sb-m에 가짜 굵게를 입힌다 */}
                  <Text style={{ color: themeColor.tintText }}>
                    {items[0].value + "kg"}
                  </Text>
                </View>
              );
            },
          }}
        />
      </ChartBody>
    </ChartCard>
  );
};
