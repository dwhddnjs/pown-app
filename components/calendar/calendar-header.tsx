import React from "react"
// component
import { StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
// expo
import { BlurView } from "expo-blur"
// hook
import useCurrentThemeColor from "@/hooks/use-current-theme-color"
import { useCalendarStore } from "@/hooks/use-calendar-store"
// lib
import { format, isSameMonth } from "date-fns"
// icon
import AntDesign from "@expo/vector-icons/AntDesign"

const CalendarHeader = () => {
  const themeColor = useCurrentThemeColor()
  const { date, nextMonth, prevMonth } = useCalendarStore()

  const title = format(date, "yyyy년 MM월")
  const isCurrentMonth = isSameMonth(date, new Date())

  return (
    <BlurView intensity={80} tint="default" style={styles.blur}>
      <SafeAreaView edges={["top"]}>
        <View style={styles.container}>
          <TouchableOpacity
            style={[styles.button, { paddingLeft: 12 }]}
            onPress={() => prevMonth()}
          >
            <AntDesign name="leftcircleo" size={28} color={themeColor.tint} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: themeColor.text }]}>
            {title}
          </Text>
          <TouchableOpacity
            style={[
              styles.button,
              { paddingRight: 12, opacity: isCurrentMonth ? 0.3 : 1 },
            ]}
            disabled={isCurrentMonth}
            onPress={() => nextMonth()}
          >
            <AntDesign name="rightcircleo" size={28} color={themeColor.tint} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </BlurView>
  )
}

export default CalendarHeader

const styles = StyleSheet.create({
  blur: {
    width: "100%",
    paddingBottom: 6,
    alignItems: "center",
  },
  container: {
    backgroundColor: "transparent",
    gap: 32,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  button: {
    paddingVertical: 8,
  },
  title: {
    fontSize: 18,
    textAlign: "center",
    fontFamily: "sb-m",
  },
})
