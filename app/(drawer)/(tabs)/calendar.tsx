import React, { useState } from "react"
import {
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ScrollView,
} from "react-native"
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  startOfWeek,
  endOfWeek,
  parse,
  isBefore,
  startOfDay,
} from "date-fns"
import { Text, View } from "@/components/Themed"
// lib
import { useHeaderHeight } from "@react-navigation/elements"
import useCurrneThemeColor from "@/hooks/use-current-theme-color"
// icon
import Arm from "@/assets/images/svg/arm_icon.svg"
import Back from "@/assets/images/svg/back_icon.svg"
import Chest from "@/assets/images/svg/chest_icon.svg"
import Leg from "@/assets/images/svg/leg_icon.svg"
import Shoulder from "@/assets/images/svg/shoulder_icon.svg"
import Ionicons from "@expo/vector-icons/Ionicons"
// zustand
import { useCalendarStore } from "@/hooks/use-calendar-store"
import { useMonthlyPlanData } from "@/hooks/use-monthly-plan-data"
import { WorkoutTypes } from "@/hooks/use-plan-store"
import { removeSameItem } from "@/lib/function"
import { useRouter } from "expo-router"
import { WorkoutPlanTypes } from "@/hooks/use-workout-plan-store"

export default function calendar() {
  const headerHeight = useHeaderHeight()
  const themeColor = useCurrneThemeColor()
  const { date } = useCalendarStore()
  const { monthlyPlanData } = useMonthlyPlanData(format(date, "yyyyMM"))
  const workoutCount = removeSameItem(monthlyPlanData).length
  const todayDate = format(new Date(), "yyyyMMdd")

  const firstDayOfMonth = startOfMonth(date)
  const lastDayOfMonth = endOfMonth(date)
  const firstDay = startOfWeek(firstDayOfMonth)
  const lastDay = endOfWeek(lastDayOfMonth)
  const days = eachDayOfInterval({ start: firstDay, end: lastDay })
  const router = useRouter()

  const getDayIcon = (isBefore: boolean, findItem: any) => {
    const icons = {
      chest: Chest,
      back: Back,
      shoulder: Shoulder,
      leg: Leg,
      arm: Arm,
    }
    const WorkoutIcon = findItem && icons[findItem.type as WorkoutTypes]

    if (isBefore) {
      if (findItem) {
        return <WorkoutIcon width={40} height={40} />
      }
      return (
        <View style={[styles(themeColor).emptyIcon]}>
          <Ionicons name="close" size={24} color={themeColor.itemColor} />
        </View>
      )
    } else if (findItem) {
      return <WorkoutIcon width={40} height={40} />
    }
    return <View style={styles(themeColor).emptyIcon} />
  }

  const onOpenWorkoutModal = (findItem?: WorkoutPlanTypes) => {
    if (!findItem) {
      return
    }
    const findSplitDate = findItem.createdAt.split(".")
    const findYear = findSplitDate[0]
    const findMonth = findSplitDate[1]
    const findDay = findSplitDate[2].slice(0, 2)
    const filterWorkoutPlanList = monthlyPlanData.filter((item) => {
      const itemSplitDate = item.createdAt.split(".")
      const itemYear = itemSplitDate[0]
      const itemMonth = itemSplitDate[1]
      const itemDay = itemSplitDate[2].slice(0, 2)

      return (
        findYear === itemYear && findMonth === itemMonth && findDay === itemDay
      )
    })

    router.push({
      pathname: "/(modals)/calendar-workout",
      params: { data: JSON.stringify(filterWorkoutPlanList) },
    } as any)
  }

  return (
    <View style={{ flex: 1, paddingTop: 24 }}>
      <ScrollView
        scrollEventThrottle={16}
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: headerHeight,
          backgroundColor: themeColor.background,
          gap: 24,
        }}
        nestedScrollEnabled={true}
      >
        <View style={{ gap: 4 }}>
          <View style={styles(themeColor).titleContainer}>
            <Text style={{ fontSize: 24 }}>이번달 헬스장 간 횟수</Text>
            <Text style={{ fontSize: 20, color: themeColor.tint }}>
              {workoutCount}회
            </Text>
          </View>
          <Text style={{ fontFamily: "sb-l", color: themeColor.subText }}>
            운동한 날짜을 눌러서, 그날의 운동 기록을 확인해보세요.
          </Text>
        </View>
        <View style={styles(themeColor).calendarContainer}>
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

          <FlatList
            data={days}
            numColumns={7}
            keyExtractor={(item) => item.toString()}
            nestedScrollEnabled={true}
            renderItem={({ item }) => {
              const isCurrentMonth = item.getMonth() === date.getMonth()
              const findItem = monthlyPlanData.findLast((el) => {
                const split = el.createdAt.split(".")
                const date = format(item, "yyyyMMdd")
                const itemDate = `${split[0]}${split[1]}${split[2].slice(0, 2)}`
                return date === itemDate
              })
              const isToday = todayDate === format(item, "yyyyMMdd")
              const beforeToday = isBefore(
                startOfDay(item),
                startOfDay(new Date())
              )

              return (
                <TouchableOpacity
                  style={[
                    styles(themeColor).numberIcon,
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
              )
            }}
          />
        </View>
      </ScrollView>
    </View>
  )
}

const styles = (color: any) =>
  StyleSheet.create({
    calendarContainer: {
      paddingVertical: 20,
      backgroundColor: color.itemColor,
      gap: 12,
      borderRadius: 12,
      paddingHorizontal: 6,
    },
    numberIcon: {
      flex: 1,
      borderRadius: 50,
      justifyContent: "center",
      alignItems: "center",
      gap: 2,
      marginBottom: 8,
    },
    emptyIcon: {
      width: 38,
      height: 38,
      backgroundColor: color.empty,
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
  })
