import React, { useState } from "react";
import { TouchableOpacity, StyleSheet, ScrollView } from "react-native";
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
import { Text, View } from "@/components/themed";
// lib
import { useHeaderHeight } from "@react-navigation/elements";
import useCurrentThemeColor from "@/hooks/use-current-theme-color";
// icon
import Arm from "@/assets/images/svg/arm_icon.svg";
import Back from "@/assets/images/svg/back_icon.svg";
import Chest from "@/assets/images/svg/chest_icon.svg";
import Leg from "@/assets/images/svg/leg_icon.svg";
import Shoulder from "@/assets/images/svg/shoulder_icon.svg";
import Ionicons from "@expo/vector-icons/Ionicons";
// zustand
import { useCalendarStore } from "@/hooks/use-calendar-store";
import { useMonthlyPlanData } from "@/hooks/use-monthly-plan-data";
import { WorkoutTypes } from "@/hooks/use-plan-store";
import { removeSameItem } from "@/lib/function";
import { useRouter } from "expo-router";
import { WorkoutPlanTypes } from "@/hooks/use-workout-plan-store";

export default function Calendar() {
  const headerHeight = useHeaderHeight();
  const themeColor = useCurrentThemeColor();
  const { date } = useCalendarStore();
  const { monthlyPlanData } = useMonthlyPlanData(format(date, "yyyyMM"));
  const workoutCount = removeSameItem(monthlyPlanData).length;
  const todayDate = format(new Date(), "yyyyMMdd");

  const firstDayOfMonth = startOfMonth(date);
  const lastDayOfMonth = endOfMonth(date);
  const firstDay = startOfWeek(firstDayOfMonth);
  const lastDay = endOfWeek(lastDayOfMonth);
  const days = eachDayOfInterval({ start: firstDay, end: lastDay });
  const router = useRouter();

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
    <View style={{ flex: 1, paddingTop: 24 }}>
      <ScrollView
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: headerHeight,
          backgroundColor: themeColor.background,
          gap: 24,
        }}
      >
        <View style={{ gap: 4 }}>
          <View style={styles.titleContainer}>
            <Text style={{ fontSize: 24 }}>
              {isSameMonth(date, new Date()) ? "이번달" : format(date, "M월")}{" "}
              헬스장 간 횟수
            </Text>
            <Text style={{ fontSize: 20, color: themeColor.tint }}>
              {workoutCount}회
            </Text>
          </View>
          <Text style={{ fontFamily: "sb-l", color: themeColor.subText }}>
            운동한 날짜를 눌러서, 그날의 운동 기록을 확인해보세요.
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
            {["일", "월", "화", "수", "목", "금", "토"].map((day) => (
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
              const isCurrentMonth = item.getMonth() === date.getMonth();
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
                  style={[
                    styles.numberIcon,
                    { opacity: isCurrentMonth ? 1 : 0.4 },
                  ]}
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
      </ScrollView>
    </View>
  );
}

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
