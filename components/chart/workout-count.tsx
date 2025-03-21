import React from "react"
// component
import { StyleSheet } from "react-native"
import { Text, View } from "../Themed"
// icon
import Back from "@/assets/images/svg/back_icon.svg"
import Arm from "@/assets/images/svg/arm_icon.svg"
import Chest from "@/assets/images/svg/chest_icon.svg"
import Leg from "@/assets/images/svg/leg_icon.svg"
import Shoulder from "@/assets/images/svg/shoulder_icon.svg"
// hook
import useCurrneThemeColor from "@/hooks/use-current-theme-color"
import { sortWorkoutPlanList } from "@/lib/function"
import { useMonthlyPlanData } from "@/hooks/use-monthly-plan-data"
import { useChartStore } from "@/hooks/use-chart-store"

const WorkoutCount = () => {
  const themeColor = useCurrneThemeColor()
  const { date } = useChartStore()
  const { monthlyPlanData } = useMonthlyPlanData(date)
  const listCount = sortWorkoutPlanList(monthlyPlanData)

  return (
    <View style={[styles(themeColor).container]}>
      <Text style={{ fontSize: 18 }}>기록한 운동 횟수</Text>
      <View style={{ height: 1, backgroundColor: themeColor.tabIconDefault }} />
      <View style={[styles(themeColor).iconListContainer]}>
        <View style={[styles(themeColor).iconItem]}>
          <Back />
          <Text style={{ color: themeColor.tint }}>{listCount.back}회</Text>
        </View>
        <View style={[styles(themeColor).iconItem]}>
          <Chest />
          <Text style={{ color: themeColor.tint }}>{listCount.chest}회</Text>
        </View>
        <View style={[styles(themeColor).iconItem]}>
          <Shoulder />
          <Text style={{ color: themeColor.tint }}>{listCount.shoulder}회</Text>
        </View>
        <View style={[styles(themeColor).iconItem]}>
          <Leg />
          <Text style={{ color: themeColor.tint }}>{listCount.leg}회</Text>
        </View>
        <View style={[styles(themeColor).iconItem]}>
          <Arm />
          <Text style={{ color: themeColor.tint }}>{listCount.arm}회</Text>
        </View>
      </View>
    </View>
  )
}

export default WorkoutCount

const styles = (color: any) =>
  StyleSheet.create({
    container: {
      backgroundColor: color.itemColor,
      paddingHorizontal: 12,
      paddingVertical: 20,
      borderRadius: 12,
      gap: 12,
      marginTop: 24,
    },
    iconItem: {
      backgroundColor: color.itemColor,
      justifyContent: "space-between",
      alignItems: "center",
      gap: 8,
    },
    iconListContainer: {
      backgroundColor: color.itemColor,
      justifyContent: "space-between",
      alignItems: "center",
      flexDirection: "row",
      gap: 8,
      paddingVertical: 4,
    },
  })
