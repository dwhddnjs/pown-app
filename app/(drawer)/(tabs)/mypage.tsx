import { useEffect, useRef } from "react"
// component
import {
  AppState,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
} from "react-native"
import { Text, View } from "@/components/Themed"
import { IconTitle } from "@/components/IconTitle"
import { UserDataCard } from "@/components/mypage/user-data-card"
// expo
import { useRouter } from "expo-router"
// icon
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons"
import AntDesign from "@expo/vector-icons/AntDesign"
// zustand
import { useUserStore } from "@/hooks/use-user-store"
// hooks
import useCurrneThemeColor from "@/hooks/use-current-theme-color"

export default function TabTwoScreen() {
  const { onReset, ...result } = useUserStore()
  const themeColor = useCurrneThemeColor()

  const { push } = useRouter()

  return <View>신작 준비중</View>
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    gap: 12,
    paddingTop: 24,
  },

  settingsContainer: {
    gap: 12,
  },
  settings: {
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
})
