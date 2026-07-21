import React from "react";
// component
import { TouchableOpacity, StyleSheet } from "react-native";
import { Text, View } from "@/components/themed";
// zustand
import { useChartStore } from "@/hooks/use-chart-store";
import { useMonthlyPlanData } from "@/hooks/use-monthly-plan-data";
import { WorkoutTypes } from "@/hooks/use-plan-store";
import { WorkoutPlanTypes } from "@/hooks/use-workout-plan-store";
// hook
import useCurrentThemeColor from "@/hooks/use-current-theme-color";
// lib
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  startOfWeek,
  endOfWeek,
  parse,
  isBefore,
  isSameMonth,
  startOfDay,
} from "date-fns";
import { removeSameItem } from "@/lib/function";
import { enUS, ko } from "date-fns/locale";
import { useLanguage } from "@/hooks/use-user-store";
import { useT } from "@/hooks/use-t";
import { Lang } from "@/lib/i18n";
// expo
import { useRouter } from "expo-router";
// icon
import Arm from "@/assets/images/svg/arm_icon.svg";
import Back from "@/assets/images/svg/back_icon.svg";
import Chest from "@/assets/images/svg/chest_icon.svg";
import Leg from "@/assets/images/svg/leg_icon.svg";
import Shoulder from "@/assets/images/svg/shoulder_icon.svg";
import Ionicons from "@expo/vector-icons/Ionicons";

const WEEKDAYS: Record<Lang, string[]> = {
  ko: ["일", "월", "화", "수", "목", "금", "토"],
  en: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
};

export const CalendarGrid = () => {
  const themeColor = useCurrentThemeColor();
  const t = useT();
  const lang = useLanguage();
  const { date } = useChartStore();
  const { monthlyPlanData } = useMonthlyPlanData(date);
  const workoutCount = removeSameItem(monthlyPlanData).length;
  const todayDate = format(new Date(), "yyyyMMdd");
  const router = useRouter();

  // 차트 스토어는 "yyyyMM" 문자열이라 그리드 계산용 Date로 변환한다
  const monthDate = parse(date, "yyyyMM", new Date());

  const firstDayOfMonth = startOfMonth(monthDate);
  const lastDayOfMonth = endOfMonth(monthDate);
  const firstDay = startOfWeek(firstDayOfMonth);
  const lastDay = endOfWeek(lastDayOfMonth);
  const days = eachDayOfInterval({ start: firstDay, end: lastDay });

  const getDayIcon = (isBeforeToday: boolean, findItem?: WorkoutPlanTypes) => {
    const icons = {
      chest: Chest,
      back: Back,
      shoulder: Shoulder,
      leg: Leg,
      arm: Arm,
    };
    const WorkoutIcon = findItem
      ? icons[findItem.type as WorkoutTypes]
      : undefined;

    if (WorkoutIcon) {
      return <WorkoutIcon width={40} height={40} />;
    }
    if (isBeforeToday) {
      return (
        <View style={[styles.emptyIcon, { backgroundColor: themeColor.empty }]}>
          <Ionicons name="close" size={24} color={themeColor.itemColor} />
        </View>
      );
    }
    return (
      <View style={[styles.emptyIcon, { backgroundColor: themeColor.empty }]} />
    );
  };

  const onOpenWorkoutModal = (findItem?: WorkoutPlanTypes) => {
    if (!findItem) {
      return;
    }
    // 기록 배열을 직렬화해 넘기는 대신 날짜만 넘기고 모달이 스토어에서 직접 조회한다
    router.push({
      pathname: "/(modals)/calendar-workout",
      params: { date: findItem.createdAt.split(" ")[0] },
    });
  };

  return (
    <View style={{ gap: 24 }}>
      <View style={{ gap: 4 }}>
        <View style={styles.titleContainer}>
          <Text style={{ fontSize: 24 }}>
            {isSameMonth(monthDate, new Date())
              ? t("calendar.thisMonth")
              : format(monthDate, lang === "ko" ? "M월" : "MMM", {
                  locale: lang === "ko" ? ko : enUS,
                })}{" "}
            {t("calendar.gymVisits")}
          </Text>
          <Text style={{ fontSize: 20, color: themeColor.tint }}>
            {t("common.count", { n: workoutCount })}
          </Text>
        </View>
        <Text style={{ fontFamily: "sb-l", color: themeColor.subText }}>
          {t("calendar.hint")}
        </Text>
      </View>
      <View
        style={[
          styles.calendarContainer,
          { backgroundColor: themeColor.itemColor },
        ]}
      >
        <View
          style={{
            flexDirection: "row",
            backgroundColor: themeColor.itemColor,
          }}
        >
          {WEEKDAYS[lang].map((day) => (
            <Text key={day} style={{ flex: 1, textAlign: "center" }}>
              {day}
            </Text>
          ))}
        </View>

        {/* 고정 35~42칸 그리드라 가상화가 불필요 — ScrollView 안 FlatList 중첩 에러(VirtualizedLists) 방지 */}
        <View
          style={[styles.daysGrid, { backgroundColor: themeColor.itemColor }]}
        >
          {days.map((item) => {
            const isCurrentMonth = item.getMonth() === monthDate.getMonth();
            const findItem = monthlyPlanData.findLast((el) => {
              const split = el.createdAt.split(".");
              const dayKey = format(item, "yyyyMMdd");
              const itemDate = `${split[0]}${split[1]}${split[2].slice(0, 2)}`;
              return dayKey === itemDate;
            });
            const isToday = todayDate === format(item, "yyyyMMdd");
            const beforeToday = isBefore(
              startOfDay(item),
              startOfDay(new Date()),
            );

            return (
              <TouchableOpacity
                key={item.toString()}
                style={[styles.numberIcon, { opacity: isCurrentMonth ? 1 : 0.4 }]}
                onPress={() => onOpenWorkoutModal(findItem)}
              >
                <View
                  style={[
                    {
                      borderRadius: 50,
                      borderWidth: 1,
                      borderColor: themeColor.background,
                    },
                    isToday && {
                      borderWidth: 3,
                      borderColor: themeColor.tint,
                    },
                  ]}
                >
                  {getDayIcon(beforeToday, findItem)}
                </View>
                <Text
                  style={[
                    { fontFamily: "sb-l", color: themeColor.text },
                    isToday && { fontFamily: "sb-m", color: themeColor.tint },
                  ]}
                >
                  {format(item, "d")}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  calendarContainer: {
    paddingVertical: 20,
    gap: 12,
    borderRadius: 12,
    paddingHorizontal: 6,
  },
  daysGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  numberIcon: {
    width: `${100 / 7}%`,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    gap: 2,
    marginBottom: 8,
  },
  emptyIcon: {
    width: 38,
    height: 38,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  titleContainer: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "flex-end",
    gap: 12,
  },
});
