import React from "react"
// component
import { ScrollView, StyleSheet } from "react-native"
import { View } from "@/components/Themed"
import {
  BodyChart,
  ConditionCount,
  EquipmentChart,
  SbdChart,
  WorkoutCount,
  WorkoutPieChart,
} from "@/components/chart"
// hook
import useCurrneThemeColor from "@/hooks/use-current-theme-color"
// lib
import { useHeaderHeight } from "@react-navigation/elements"

export default function chart() {
  const themeColor = useCurrneThemeColor()
  const headerHeight = useHeaderHeight()

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        scrollEventThrottle={16}
        style={{ flex: 1 }}
        contentContainerStyle={{
          gap: 24,
          paddingTop: headerHeight,
          paddingHorizontal: 12,
          paddingBottom: 24,
          backgroundColor: themeColor.background,
        }}
      >
        <WorkoutCount />
        <WorkoutPieChart />
        <ConditionCount />
        <EquipmentChart />
        <SbdChart />
        <BodyChart />
      </ScrollView>
    </View>
  )
}

const styles = (color: any) => StyleSheet.create({})
