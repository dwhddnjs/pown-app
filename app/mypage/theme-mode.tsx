import { Text, View } from "@/components/Themed"
import Colors from "@/constants/Colors"
import {
  Appearance,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
} from "react-native"
import Entypo from "@expo/vector-icons/Entypo"
import { useUserStore } from "@/hooks/use-user-store"
import { useRouter } from "expo-router"
import { toast } from "sonner-native"

export default function ThemeMode() {
  const { setUser, theme } = useUserStore()
  const { back } = useRouter()
  const colorScheme = useColorScheme()

  const onSubmitTheme = (theme: "light" | "dark" | "system") => {
    let result: "light" | "dark" | "system" | null = theme
    if (theme === "system") {
      result = null
    }
    setUser("theme", theme)
    Appearance.setColorScheme(result as Exclude<typeof result, "system">)
    back()
    toast.success("컬러모드가 변경 되었습니다!")
  }

  return (
    <View style={styles.main}>
      <TouchableOpacity
        style={[
          styles.item,
          {
            backgroundColor: Colors[colorScheme ?? "light"].itemColor,
            borderBottomColor: Colors[colorScheme ?? "light"].background,
          },
        ]}
        onPress={() => onSubmitTheme("light")}
      >
        <Text>라이트 모드</Text>
        {theme === "light" && (
          <Entypo
            name="check"
            size={20}
            color={Colors[colorScheme ?? "light"].tint}
          />
        )}
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.item,
          {
            backgroundColor: Colors[colorScheme ?? "light"].itemColor,
            borderBottomColor: Colors[colorScheme ?? "light"].background,
          },
        ]}
        onPress={() => onSubmitTheme("dark")}
      >
        <Text>다크 모드</Text>
        {theme === "dark" && (
          <Entypo
            name="check"
            size={20}
            color={Colors[colorScheme ?? "light"].tint}
          />
        )}
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.item,
          {
            backgroundColor: Colors[colorScheme ?? "light"].itemColor,
            borderBottomColor: Colors[colorScheme ?? "light"].background,
          },
        ]}
        onPress={() => onSubmitTheme("system")}
      >
        <Text>시스템 기본 설정</Text>
        {theme === "system" && (
          <Entypo
            name="check"
            size={20}
            color={Colors[colorScheme ?? "light"].tint}
          />
        )}
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  main: {
    paddingTop: 36,
    flex: 1,
  },
  item: {
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderBottomWidth: 2,

    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
})
