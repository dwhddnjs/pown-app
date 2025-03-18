import React from "react"
// component
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native"
// expo
import { BlurView } from "expo-blur"
// hook
import useCurrneThemeColor from "@/hooks/use-current-theme-color"
import { useChartStore } from "@/hooks/use-chart-store"
import { convertChartDate } from "@/lib/function"
// icon
import AntDesign from "@expo/vector-icons/AntDesign"
import { useCalendarStore } from "@/hooks/use-calendar-store"

const CalenderHeader = () => {
  const themeColor = useCurrneThemeColor()
  const { date, nextMonth, prevMonth } = useCalendarStore()
  const title = `${date.getFullYear()}년 ${date.getMonth() + 1}월`

  return (
    <BlurView intensity={80} tint="default" style={styles.blur}>
      <SafeAreaView>
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
            style={[styles.button, { paddingRight: 12 }]}
            onPress={() => nextMonth()}
          >
            <AntDesign name="rightcircleo" size={28} color={themeColor.tint} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </BlurView>
  )
}

export default CalenderHeader

const styles = StyleSheet.create({
  blur: {
    width: "100%",
    paddingBottom: 4,
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
