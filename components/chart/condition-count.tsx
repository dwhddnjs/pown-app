import React from "react";
// component
import { StyleSheet } from "react-native";
import { Text, View } from "../themed";
// hook
import useCurrentThemeColor from "@/hooks/use-current-theme-color";
import { useLanguage } from "@/hooks/use-user-store";
import { tCondition } from "@/lib/i18n";
import { useT } from "@/hooks/use-t";
// data
import { conditionData } from "@/constants/constants";
// lib
import { getIcon } from "../add-plan/condition-icon";
import { convertConditionType, getConditionCount } from "@/lib/function";
// hook
import { useChartStore } from "@/hooks/use-chart-store";
import { useMonthlyPlanData } from "@/hooks/use-monthly-plan-data";
import { ChartEmptyState } from "./chart-empty-state";

export const ConditionCount = () => {
  const themeColor = useCurrentThemeColor();
  const t = useT();
  const lang = useLanguage();
  const { date } = useChartStore();
  const { monthlyPlanData } = useMonthlyPlanData(date);
  const getCount = getConditionCount(monthlyPlanData);

  const isEmptyCount =
    (Object.values(getCount) as number[]).reduce(
      (acc: number, cur: number) => acc + cur,
    ) === 0;

  return (
    <View style={[styles.container, { backgroundColor: themeColor.itemColor }]}>
      <Text style={{ fontSize: 18 }}>{t("chart.conditionTitle")}</Text>
      <View style={{ height: 1, backgroundColor: themeColor.divider }} />
      {isEmptyCount ? (
        <ChartEmptyState
          message={t("chart.conditionEmpty")}
          themeColor={themeColor}
        />
      ) : (
        <View
          style={[
            styles.iconListContainer,
            { backgroundColor: themeColor.itemColor },
          ]}
        >
          {conditionData.map((item) => (
            <View
              style={[
                styles.iconItem,
                { backgroundColor: themeColor.itemColor },
              ]}
              key={item.id}
            >
              {/* 아이콘과 같은 크기의 래퍼를 둬야 배지가 글리프 밖 모서리에 붙는다 */}
              <View
                style={[
                  styles.iconBox,
                  { backgroundColor: themeColor.itemColor },
                ]}
              >
                <View
                  style={[
                    styles.numberCount,
                    {
                      borderColor: themeColor.tint,
                      borderWidth: 1.5,
                      backgroundColor: "transparent",
                    },
                  ]}
                >
                  <Text style={{ fontSize: 10 }}>
                    {(() => {
                      const key = convertConditionType(item.condition);
                      return key ? (getCount[key] ?? 0) : 0;
                    })()}
                  </Text>
                </View>
                {getIcon(item.condition, 44, themeColor.tint)}
              </View>
              <Text style={[styles.iconText, { color: themeColor.tintText }]}>
                {tCondition(item.condition, lang)}
              </Text>
            </View>
          ))}
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
  iconListContainer: {
    flexDirection: "row",
    rowGap: 12,
    paddingVertical: 4,
    flexWrap: "wrap",
  },
  // 9개를 5열 고정 폭으로 깔아야 2행(4개)이 가운데로 밀리지 않고 열이 맞는다
  iconItem: {
    justifyContent: "center",
    alignItems: "center",
    width: "20%",
  },
  iconBox: {
    width: 44,
    height: 44,
    position: "relative",
  },
  iconText: {
    fontSize: 10,
    fontFamily: "sb-l",
  },
  numberCount: {
    width: 18,
    height: 18,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 50,
    position: "absolute",
    top: -6,
    left: -6,
    zIndex: 1,
  },
});
