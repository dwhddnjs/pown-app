import React from "react"
// component
import { ScrollView, StyleSheet } from "react-native"
import { View } from "@/components/Themed"
// hook
import useCurrneThemeColor from "@/hooks/use-current-theme-color"
import {
  BodyChart,
  ConditionCount,
  EquipmentChart,
  SbdChart,
  WorkoutCount,
  WorkoutPieChart,
} from "@/components/chart"

export default function chart() {
  const themeColor = useCurrneThemeColor()
  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        scrollEventThrottle={16}
        style={{ flex: 1 }}
        contentContainerStyle={{
          gap: 24,
          padding: 24,
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

const styles = () => StyleSheet.create({})
