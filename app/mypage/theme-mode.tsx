// component
import { Text, View } from "@/components/Themed"
import { Appearance, StyleSheet, TouchableOpacity } from "react-native"
import { toast } from "sonner-native"
// icon
import Entypo from "@expo/vector-icons/Entypo"
// zustand
import { useUserStore } from "@/hooks/use-user-store"
// expo
import { useRouter } from "expo-router"
// hook
import useCurrneThemeColor from "@/hooks/use-current-theme-color"

export default function ThemeMode() {
  const { setUser, theme } = useUserStore()
  const { back } = useRouter()

  const themeColor = useCurrneThemeColor()

  const onSubmitTheme = (theme: "light" | "dark" | "system") => {
    let result: "light" | "dark" | "system" | null = theme
    if (theme === "system") {
      result = null
    }
    setUser("theme", theme)
    Appearance.setColorScheme(result as Exclude<typeof result, "system">)
    back()
  }

  return (
    <View style={styles.main}>
      <View style={styles.textContainer}>
        <Text style={[styles.title, { color: themeColor.tint }]}>
          컬러모드를 선택해 보세요!
        </Text>
        <Text style={styles.desc}>
          다크모드가 마음에 안 들면 라이트모드로 사용해보세요 밝은 화면과 좋은
          눈뽕이 당신과 함께 할 것 입니다 하지만 다크모드를 권장합니다.
        </Text>
      </View>
      <TouchableOpacity
        style={[
          styles.item,
          {
            backgroundColor: themeColor.itemColor,
            borderBottomColor: themeColor.background,
          },
        ]}
        onPress={() => onSubmitTheme("light")}
      >
        <Text>라이트 모드</Text>
        {theme === "light" && (
          <Entypo name="check" size={20} color={themeColor.tint} />
        )}
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.item,
          {
            backgroundColor: themeColor.itemColor,
            borderBottomColor: themeColor.background,
          },
        ]}
        onPress={() => onSubmitTheme("dark")}
      >
        <Text>다크 모드</Text>
        {theme === "dark" && (
          <Entypo name="check" size={20} color={themeColor.tint} />
        )}
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.item,
          {
            backgroundColor: themeColor.itemColor,
            borderBottomColor: themeColor.background,
          },
        ]}
        onPress={() => onSubmitTheme("system")}
      >
        <Text>시스템 기본 설정</Text>
        {theme === "system" && (
          <Entypo name="check" size={20} color={themeColor.tint} />
        )}
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  main: {
    paddingTop: 24,
    flex: 1,
  },
  item: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 2,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  textContainer: {
    gap: 12,
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  title: {
    fontSize: 18,
  },
  desc: {
    fontFamily: "sb-l",
  },
})
