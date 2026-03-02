import React from "react";
// component
import { ScrollView, StyleSheet } from "react-native";
import { View } from "@/components/Themed";
import {
  BodyChart,
  ConditionCount,
  EquipmentChart,
  SbdChart,
  WorkoutCount,
  WorkoutPieChart,
  WorkoutSummary,
} from "@/components/chart";
// hook
import useCurrentThemeColor from "@/hooks/use-current-theme-color";
// lib
import { useHeaderHeight } from "@react-navigation/elements";

export default function chart() {
  const themeColor = useCurrentThemeColor();
  const headerHeight = useHeaderHeight();

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        scrollEventThrottle={16}
        style={{ flex: 1 }}
        contentContainerStyle={{
          gap: 24,
          paddingTop: headerHeight,
          paddingHorizontal: 20,
          paddingBottom: 180,
          backgroundColor: themeColor.background,
        }}
      >
        <WorkoutSummary />
        <WorkoutCount />
        <WorkoutPieChart />
        <ConditionCount />
        <EquipmentChart />
        <SbdChart />
        <BodyChart />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({});
