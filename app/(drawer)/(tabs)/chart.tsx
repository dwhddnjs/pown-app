import React, { useCallback, useEffect, useRef } from "react";
// component
import { ScrollView, StyleSheet } from "react-native";
import { View } from "@/components/themed";
import {
  BodyChart,
  ConditionCount,
  EquipmentChart,
  SbdChart,
  WorkoutCount,
  WorkoutPieChart,
  WorkoutSummary,
} from "@/components/chart";
// zustand
import { useChartStore } from "@/hooks/use-chart-store";
// hook
import useCurrentThemeColor from "@/hooks/use-current-theme-color";
// lib
import { useHeaderHeight } from "@react-navigation/elements";
// expo
import { useFocusEffect } from "expo-router";

export default function Chart() {
  const themeColor = useCurrentThemeColor();
  const headerHeight = useHeaderHeight();
  const { date, onReset } = useChartStore();
  const scrollRef = useRef<ScrollView>(null);

  // 탭에 들어올 때마다 현재 달로 리셋 — 과거 달에 머문 채 방치되는 것 방지
  useFocusEffect(
    useCallback(() => {
      onReset();
    }, [onReset]),
  );

  useEffect(() => {
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  }, [date]);

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        ref={scrollRef}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
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
