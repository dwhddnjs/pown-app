import React from "react"
// component
import { StyleSheet } from "react-native"
import { Text, View } from "../Themed"
// hook
import useCurrneThemeColor from "@/hooks/use-current-theme-color"
// data
import { conditionData } from "@/constants/constants"
// lib
import { getIcon } from "../add-plan/condition-icon"
import { convertConditionType, getConditionCount } from "@/lib/function"
// hook
import { useChartStore } from "@/hooks/use-chart-store"
import { useMonthlyPlanData } from "@/hooks/use-monthly-plan-data"
import InfoIcon from "@expo/vector-icons/FontAwesome6"

const ConditionCount = () => {
  const themeColor = useCurrneThemeColor()
  const { date } = useChartStore()
  const { monthlyPlanData } = useMonthlyPlanData(date)
  const getCount = getConditionCount(monthlyPlanData)

  const isEmptyCount =
    (Object.values(getCount) as number[]).reduce(
      (acc: number, cur: number) => acc + cur
    ) === 0

  return (
    <View style={styles(themeColor).container}>
      <Text style={{ fontSize: 18 }}>컨디션 별 횟수</Text>
      <View style={{ height: 1, backgroundColor: themeColor.tabIconDefault }} />
      {isEmptyCount ? (
        <View style={[styles(themeColor).emptyContainer]}>
          <InfoIcon name="circle-info" size={16} color={themeColor.subText} />
          <Text
            style={{
              color: themeColor.subText,
            }}
          >
            기록된 컨디션 데이터가 없습니다.
          </Text>
        </View>
      ) : (
        <View style={[styles(themeColor).iconListContainer]}>
          {conditionData.map((item) => (
            <View style={styles(themeColor).iconItem} key={item.id}>
              <View style={styles(themeColor).numberCount}>
                <Text style={{ fontSize: 10 }}>
                  {getCount[`${convertConditionType(item.condition)}`]}
                </Text>
              </View>
              {getIcon(item.condition, 44, themeColor.tint)}
              <Text style={styles(themeColor).iconText}>{item.condition}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  )
}

export default ConditionCount

const styles = (color: any) =>
  StyleSheet.create({
    container: {
      backgroundColor: color.itemColor,
      paddingHorizontal: 12,
      paddingVertical: 20,
      borderRadius: 12,
      gap: 12,
    },
    iconListContainer: {
      backgroundColor: color.itemColor,
      justifyContent: "center",
      alignItems: "center",
      flexDirection: "row",
      gap: 9,
      paddingVertical: 4,
      flexWrap: "wrap",
    },
    iconItem: {
      backgroundColor: color.itemColor,
      justifyContent: "center",
      alignItems: "center",
      minWidth: 54,
      position: "relative",
    },
    iconText: {
      color: color.tint,
      fontSize: 10,
      fontFamily: "sb-l",
    },
    numberCount: {
      width: 18,
      height: 18,
      justifyContent: "center",
      alignItems: "center",
      borderRadius: 50,
      backgroundColor: color.subText,
      position: "absolute",
      top: -2,
      left: -2,
      zIndex: 1,
    },
    emptyContainer: {
      flexDirection: "row",
      paddingVertical: 12,
      paddingHorizontal: 4,
      gap: 6,
      backgroundColor: color.itemColor,
    },
  })
