import React, { useMemo } from "react";
// component
import { StyleSheet } from "react-native";
import { Text, View } from "../themed";
import { BarChart } from "react-native-gifted-charts";
// hook
import useCurrentThemeColor from "@/hooks/use-current-theme-color";
import { useLanguage } from "@/hooks/use-user-store";
import { tEquipment } from "@/lib/i18n";
import { useT } from "@/hooks/use-t";
import { getEquipmentCount } from "@/lib/function";
import { useMonthlyPlanData } from "@/hooks/use-monthly-plan-data";
import { useChartStore } from "@/hooks/use-chart-store";
import { ChartEmptyState } from "./chart-empty-state";

export const EquipmentChart = () => {
  const themeColor = useCurrentThemeColor();
  const t = useT();
  const lang = useLanguage();
  const { date } = useChartStore();
  const { monthlyPlanData } = useMonthlyPlanData(date);
  const equipmentCount = getEquipmentCount(monthlyPlanData);

  const isEmptyCount =
    (Object.values(equipmentCount) as number[]).reduce(
      (acc: number, cur: number) => acc + cur,
    ) === 0;

  // 최대 기록에 여유를 두되 최소 5 — 축을 데이터에 맞춰야 작은 값도 막대가 보인다.
  // maxValue가 NO_OF_SECTIONS의 배수가 아니면 눈금이 1.6 간격이 되어 라벨이
  // 0,1,3,4,6,8 처럼 찍힌다 → 반드시 배수로 올림한다.
  const NO_OF_SECTIONS = 5;
  const rawMax = Math.max(
    5,
    Math.ceil(Math.max(...(Object.values(equipmentCount) as number[])) * 1.2),
  );
  const maxValue = Math.ceil(rawMax / NO_OF_SECTIONS) * NO_OF_SECTIONS;

  const barData1 = useMemo(
    () => [
      {
        value: equipmentCount.babel,
        label: tEquipment("바벨", lang),
        frontColor: themeColor.tint,
      },
      {
        value: equipmentCount.dumbel,
        label: tEquipment("덤벨", lang),
        frontColor: themeColor.tint,
      },
      {
        value: equipmentCount.machine,
        label: tEquipment("머신", lang),
        frontColor: themeColor.tint,
      },
      {
        value: equipmentCount.smith,
        label: tEquipment("스미스", lang),
        frontColor: themeColor.tint,
      },
      {
        value: equipmentCount.cable,
        label: tEquipment("케이블", lang),
        frontColor: themeColor.tint,
      },
      {
        value: equipmentCount.body,
        label: tEquipment("맨몸", lang),
        frontColor: themeColor.tint,
      },
    ],
    [equipmentCount, themeColor.tint, lang],
  );

  return (
    <View style={[styles.container, { backgroundColor: themeColor.itemColor }]}>
      <Text style={{ fontSize: 18 }}>{t("chart.equipmentTitle")}</Text>
      <View
        style={{
          height: 1,
          backgroundColor: themeColor.divider,
        }}
      />
      {isEmptyCount ? (
        <ChartEmptyState
          message={t("chart.equipmentEmpty")}
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
            noOfSections={NO_OF_SECTIONS}
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
            // 영어 기구명은 기본 라벨 폭(barWidth=24)에서 "Bar…"로 잘리고,
            // 넓히면 옆 라벨과 겹친다 → 영어일 때만 기울여 전체를 보여준다.
            // 한국어는 원래 다 들어가므로 그대로 둔다.
            labelWidth={lang === "en" ? 60 : undefined}
            rotateLabel={lang === "en"}
            xAxisLabelsHeight={lang === "en" ? 44 : undefined}
            xAxisLabelsVerticalShift={lang === "en" ? 12 : undefined}
            xAxisLabelTextStyle={{
              color: themeColor.text,
              fontWeight: "bold",
              fontSize: lang === "en" ? 9 : undefined,
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
