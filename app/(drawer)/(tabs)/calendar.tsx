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
} from "date-fns"
import { Text, View } from "@/components/Themed"
// lib
import { useHeaderHeight } from "@react-navigation/elements"
import useCurrneThemeColor from "@/hooks/use-current-theme-color"
// icon
import Ionicons from "@expo/vector-icons/Ionicons"
import Arm from "@/assets/images/svg/arm_icon.svg"
import Back from "@/assets/images/svg/back_icon.svg"
import Chest from "@/assets/images/svg/chest_icon.svg"
import Leg from "@/assets/images/svg/leg_icon.svg"
import Shoulder from "@/assets/images/svg/shoulder_icon.svg"
// zustand
import { useCalendarStore } from "@/hooks/use-calendar-store"
import { useMonthlyPlanData } from "@/hooks/use-monthly-plan-data"
import { WorkoutTypes } from "@/hooks/use-plan-store"

export default function calendar() {
  const headerHeight = useHeaderHeight()
  const themeColor = useCurrneThemeColor()
  const { date } = useCalendarStore()
  const { monthlyPlanData } = useMonthlyPlanData(format(date, "yyyyMM"))
  const firstDayOfMonth = startOfMonth(date)
  const lastDayOfMonth = endOfMonth(date)
  const firstDay = startOfWeek(firstDayOfMonth)
  const lastDay = endOfWeek(lastDayOfMonth)
  const days = eachDayOfInterval({ start: firstDay, end: lastDay })

  const getWorkoutIcon = (type: WorkoutTypes) => {
    const icons = {
      chest: Chest,
      back: Back,
      shoulder: Shoulder,
      leg: Leg,
      arm: Arm,
    }
    const IconComponent = icons[type]

    return <IconComponent width={40} height={40} />
  }

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        scrollEventThrottle={16}
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingTop: headerHeight,
          backgroundColor: themeColor.background,
        }}
        nestedScrollEnabled={true} // 🚨 비추천, 성능 저하 가능성 있음
      >
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
            renderItem={({ item }) => {
              const isCurrentMonth = item.getMonth() === date.getMonth()
              const findItem = monthlyPlanData.find((el) => {
                const split = el.createdAt.split(".")
                const date = format(item, "yyyyMMdd")
                const itemDate = `${split[0]}${split[1]}${split[2].slice(0, 2)}`
                return date === itemDate
              })
              return (
                <TouchableOpacity
                  style={[
                    styles(themeColor).numberIcon,
                    { opacity: isCurrentMonth ? 1 : 0.4 },
                  ]}
                >
                  {!findItem ? (
                    <View style={styles(themeColor).emptyIcon} />
                  ) : (
                    getWorkoutIcon(findItem.type as WorkoutTypes)
                  )}
                  <Text
                    style={{
                      fontFamily: "sb-l",
                      color: themeColor.tint,
                    }}
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
      paddingVertical: 24,
      backgroundColor: color.itemColor,
      gap: 12,
      borderRadius: 12,
      paddingHorizontal: 8,
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
      backgroundColor: color.tabBar,
      borderRadius: 50,
    },
  })
