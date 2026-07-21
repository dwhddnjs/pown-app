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
      <Text style={{ fontSize: 18, marginLeft: 6 }}>{t("chart.conditionTitle")}</Text>
      <View style={{ height: 1, backgroundColor: themeColor.tabIconDefault }} />
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
              <View
                style={[
                  styles.numberCount,
                  { backgroundColor: themeColor.subText },
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
              <Text style={[styles.iconText, { color: themeColor.tint }]}>
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
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    gap: 9,
    paddingVertical: 4,
    flexWrap: "wrap",
  },
  iconItem: {
    justifyContent: "center",
    alignItems: "center",
    minWidth: 54,
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
    top: -2,
    left: -2,
    zIndex: 1,
  },
});
