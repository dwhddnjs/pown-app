import React from "react"
// component
import { ScrollView, StyleSheet } from "react-native"
import { Text, View } from "@/components/Themed"

// hook
import useCurrneThemeColor from "@/hooks/use-current-theme-color"
import {
  ConditionCount,
  WorkoutCount,
  WorkoutPieChart,
} from "@/components/chart"

export default function chart() {
  const themeColor = useCurrneThemeColor()
  return (
    <View style={{ flex: 1, padding: 24 }}>
      <ScrollView
        scrollEventThrottle={16}
        style={{ flex: 1 }}
        contentContainerStyle={{
          gap: 24,
        }}
      >
        <WorkoutCount />
        <WorkoutPieChart />
        <ConditionCount />
      </ScrollView>
    </View>
  )
}

const styles = () => StyleSheet.create({})
