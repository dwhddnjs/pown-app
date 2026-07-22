// component
import { Appearance, StyleSheet } from "react-native";
import { Text, View } from "@/components/themed";
import { SettingSection } from "@/components/mypage/setting-section";
import { SettingItem } from "@/components/mypage/setting-item";
// zustand
import { useUserStore } from "@/hooks/use-user-store";
// hooks
import useCurrentThemeColor from "@/hooks/use-current-theme-color";
import { useT } from "@/hooks/use-t";
// expo
import { useRouter } from "expo-router";
// icon
import Entypo from "@expo/vector-icons/Entypo";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

const THEME_OPTIONS = [
  { key: "light", title: "theme.lightMode", icon: "white-balance-sunny" },
  { key: "dark", title: "theme.darkMode", icon: "weather-night" },
  { key: "system", title: "theme.systemMode", icon: "cellphone" },
] as const;

export default function ThemeMode() {
  const { setUser, theme } = useUserStore();
  const { back } = useRouter();

  const themeColor = useCurrentThemeColor();
  const t = useT();

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
        <Text style={[styles.title, { color: themeColor.tintText }]}>
          {t("theme.title")}
        </Text>
        <Text style={[styles.desc, { color: themeColor.subText }]}>
          {t("theme.desc")}
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
                color={themeColor.tintText}
              />
            }
            title={t(option.title)}
            right={
              theme === option.key ? (
                <Entypo name="check" size={18} color={themeColor.tintText} />
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
