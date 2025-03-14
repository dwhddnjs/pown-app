import React from "react"
// component
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native"
import { DrawerToggleButton } from "@react-navigation/drawer"
// expo
import { BlurView } from "expo-blur"
import { useRouter } from "expo-router"
import FontAwesome from "@expo/vector-icons/FontAwesome"
// hook
import useCurrneThemeColor from "@/hooks/use-current-theme-color"
import { useChartStore } from "@/hooks/use-chart-store"
import { convertChartDate } from "@/lib/function"
// icon
import AntDesign from "@expo/vector-icons/AntDesign"

const ChartHeader = () => {
  const themeColor = useCurrneThemeColor()
  const { date, setDate } = useChartStore()

  const onClickDate = (type: string) => {
    setDate(type)
  }

  return (
    <BlurView intensity={80} tint="default" style={styles.blur}>
      <SafeAreaView>
        <View style={styles.container}>
          <TouchableOpacity
            style={[styles.button, { paddingLeft: 12 }]}
            onPress={() => onClickDate("prev")}
          >
            <AntDesign name="leftcircleo" size={28} color={themeColor.tint} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: themeColor.text }]}>
            {convertChartDate(date)}
          </Text>
          <TouchableOpacity
            style={[styles.button, { paddingRight: 12 }]}
            onPress={() => onClickDate("next")}
          >
            <AntDesign name="rightcircleo" size={28} color={themeColor.tint} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </BlurView>
  )
}

export default ChartHeader

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
