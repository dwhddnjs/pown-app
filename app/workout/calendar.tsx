import React, { useLayoutEffect } from "react";
// component
import { ScrollView, StyleSheet } from "react-native";
import { CalendarGrid } from "@/components/calendar";
// zustand
import { useChartStore } from "@/hooks/use-chart-store";
// hook
import useCurrentThemeColor from "@/hooks/use-current-theme-color";
// lib
import { convertChartDate } from "@/lib/function";
import { useLanguage } from "@/hooks/use-user-store";
// expo
import { useNavigation } from "expo-router";

export default function WorkoutCalendar() {
  const themeColor = useCurrentThemeColor();
  const { date } = useChartStore();
  const navigation = useNavigation();
  const lang = useLanguage();

  // 이 화면은 기록 탭에서 보던 달 하나만 보여준다 — 월 이동은 기록 탭 헤더에서 한다.
  // 어느 달인지는 헤더 타이틀이 알려준다.
  useLayoutEffect(() => {
    navigation.setOptions({ headerTitle: convertChartDate(date, lang) });
  }, [navigation, date, lang]);

  return (
    <ScrollView
      style={{ backgroundColor: themeColor.background }}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <CalendarGrid />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 48,
  },
});
