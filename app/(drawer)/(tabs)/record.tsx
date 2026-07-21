import React, { useCallback, useEffect, useRef } from "react";
// component
import { ScrollView } from "react-native";
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

export default function Record() {
  const themeColor = useCurrentThemeColor();
  const headerHeight = useHeaderHeight();
  const { date } = useChartStore();
  const scrollRef = useRef<ScrollView>(null);

  // 월은 리셋하지 않는다 — use-chart-store는 이 탭과 운동 달력 화면이 공유하는
  // "지금 보고 있는 달"이라, 달력에서 월을 고르고 돌아왔을 때 되돌리면 안 된다.
  // 스크롤만 올린다(월이 그대로면 아래 useEffect가 돌지 않으므로 여기서 처리).
  useFocusEffect(
    useCallback(() => {
      scrollRef.current?.scrollTo({ y: 0, animated: false });
    }, []),
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
