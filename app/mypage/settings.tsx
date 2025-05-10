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

export default function settings() {
  const { onReset, ...result } = useUserStore()
  const themeColor = useCurrneThemeColor()

  const { push } = useRouter()

  return (
    <View style={styles.container}>
      <UserDataCard />
      <View style={styles.settingsContainer}>
        {/* 내정보 */}
        <TouchableOpacity
          style={[styles.settings, { backgroundColor: themeColor.itemColor }]}
          onPress={() => push("/mypage/user-info")}
        >
          <IconTitle style={{ backgroundColor: themeColor.itemColor }}>
            <MaterialCommunityIcons
              name="account-edit"
              size={20}
              color={themeColor.tint}
            />
            <Text>내정보 작성</Text>
          </IconTitle>
          <AntDesign name="up" size={20} color={themeColor.subText} />
        </TouchableOpacity>

        {/* 컬러모드 */}
        <TouchableOpacity
          style={[styles.settings, { backgroundColor: themeColor.itemColor }]}
          onPress={() => push("/mypage/theme-mode")}
        >
          <IconTitle style={{ backgroundColor: themeColor.itemColor }}>
            <MaterialCommunityIcons
              name="circle-half-full"
              size={20}
              color={themeColor.tint}
            />
            <Text>컬러모드 선택</Text>
          </IconTitle>
          <AntDesign name="up" size={20} color={themeColor.subText} />
        </TouchableOpacity>

        {/* 데이터 초기화 */}
        <TouchableOpacity
          style={[styles.settings, { backgroundColor: themeColor.itemColor }]}
          onPress={() => push("/mypage/reset-data")}
        >
          <IconTitle style={{ backgroundColor: themeColor.itemColor }}>
            <MaterialCommunityIcons
              name="database-remove"
              size={20}
              color={themeColor.tint}
            />
            <Text>데이터 관리</Text>
          </IconTitle>
          <AntDesign name="up" size={20} color={themeColor.subText} />
        </TouchableOpacity>
      </View>
    </View>
  )
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
