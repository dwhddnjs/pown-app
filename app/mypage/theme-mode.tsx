// component
import { Appearance, StyleSheet } from "react-native";
import { Text, View } from "@/components/themed";
import { SettingSection } from "@/components/mypage/setting-section";
import { SettingItem } from "@/components/mypage/setting-item";
// zustand
import { useUserStore } from "@/hooks/use-user-store";
// hooks
import useCurrentThemeColor from "@/hooks/use-current-theme-color";
// expo
import { useRouter } from "expo-router";
// icon
import Entypo from "@expo/vector-icons/Entypo";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

const THEME_OPTIONS = [
  { key: "light", title: "라이트 모드", icon: "white-balance-sunny" },
  { key: "dark", title: "다크 모드", icon: "weather-night" },
  { key: "system", title: "시스템 기본 설정", icon: "cellphone" },
] as const;

export default function ThemeMode() {
  const { setUser, theme } = useUserStore();
  const { back } = useRouter();

  const themeColor = useCurrentThemeColor();

  const onSubmitTheme = (theme: "light" | "dark" | "system") => {
    let result: "light" | "dark" | "system" | null = theme;
    if (theme === "system") {
      result = null;
    }
    setUser("theme", theme);
    Appearance.setColorScheme(result as Exclude<typeof result, "system">);
    back();
  };

  return (
    <View style={styles.container}>
      <View style={styles.textContainer}>
        <Text style={[styles.title, { color: themeColor.tint }]}>
          컬러모드를 선택해 보세요!
        </Text>
        <Text style={[styles.desc, { color: themeColor.subText }]}>
          다크모드가 마음에 안 들면 라이트모드로 사용해보세요 밝은 화면과 좋은
          눈뽕이 당신과 함께 할 것 입니다 하지만 다크모드를 권장합니다.
        </Text>
      </View>
      <SettingSection>
        {THEME_OPTIONS.map((option) => (
          <SettingItem
            key={option.key}
            icon={
              <MaterialCommunityIcons
                name={option.icon}
                size={20}
                color={themeColor.tint}
              />
            }
            title={option.title}
            right={
              theme === option.key ? (
                <Entypo name="check" size={18} color={themeColor.tint} />
              ) : undefined
            }
            onPress={() => onSubmitTheme(option.key)}
          />
        ))}
      </SettingSection>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 24,
    paddingHorizontal: 20,
    gap: 24,
  },
  textContainer: {
    gap: 8,
  },
  title: {
    fontSize: 18,
  },
  desc: {
    fontFamily: "sb-l",
    fontSize: 13,
    lineHeight: 19,
  },
});
