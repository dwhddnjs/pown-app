import React from "react"
// component
import { StyleSheet } from "react-native"
import { Text, View } from "../Themed"
import { PieChart } from "react-native-gifted-charts"
// hook
import useCurrneThemeColor from "@/hooks/use-current-theme-color"
import { userWorkoutPlanStore } from "@/hooks/use-workout-plan-store"
// lib
import {
  convertChartValuesToPercentage,
  sortWorkoutPlanList,
} from "@/lib/function"

const WorkoutPieChart = () => {
  const themeColor = useCurrneThemeColor()
  const { workoutPlanList } = userWorkoutPlanStore()
  const listCount = sortWorkoutPlanList(workoutPlanList)

  const chartValue = workoutPlanList && [
    { value: listCount.back, color: "#F13C33", title: "등" },
    { value: listCount.chest, color: "#FFC134", title: "가슴" },
    { value: listCount.shoulder, color: "#3CC42E", title: "어깨" },
    { value: listCount.leg, color: "#3A76E2", title: "하체" },
    { value: listCount.arm, color: "#9A48C1", title: "팔" },
  ]

  return (
    <View style={[styles(themeColor).container]}>
      <Text style={{ fontSize: 18 }}>난 어떤운동을 많이 했지?</Text>
      <View style={{ height: 1, backgroundColor: themeColor.tabIconDefault }} />
      <View style={styles(themeColor).itemContainer}>
        <PieChart
          data={convertChartValuesToPercentage(chartValue)}
          donut
          shadow
          showText
          showValuesAsLabels
          textColor={themeColor.text}
          fontWeight="bold"
          textBackgroundRadius={26}
          backgroundColor={themeColor.itemColor}
        />
        <View style={{ backgroundColor: themeColor.itemColor }}>
          {convertChartValuesToPercentage(chartValue).map((item: any) => (
            <View
              style={{
                flexDirection: "row",
                backgroundColor: themeColor.itemColor,
              }}
            >
              <Text style={{ color: item.color, fontSize: 12 }}>
                {item.title} :{" "}
              </Text>
              <Text style={{ fontSize: 12 }}>{item.text}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  )
}

export default WorkoutPieChart

const styles = (color: any) =>
  StyleSheet.create({
    container: {
      backgroundColor: color.itemColor,
      padding: 18,
      borderRadius: 12,
      gap: 12,
    },
    itemContainer: {
      backgroundColor: color.itemColor,
      flexDirection: "row",
      paddingVertical: 4,
      justifyContent: "space-between",
    },
  })
