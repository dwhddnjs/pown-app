// component
import { Appearance } from "react-native";
import { Text, View } from "@/components/themed";
import { SettingSection } from "@/components/mypage/setting-section";
import { SettingItem } from "@/components/mypage/setting-item";
// zustand
import { useUserStore } from "@/hooks/use-user-store";
// hooks
import useCurrentThemeColor from "@/hooks/use-current-theme-color";
import { useT } from "@/hooks/use-t";
import { settingsScreenStyles } from "@/components/mypage/settings-screen-styles";
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
    <View style={settingsScreenStyles.container}>
      <View style={settingsScreenStyles.textContainer}>
        <Text
          style={[settingsScreenStyles.title, { color: themeColor.tintText }]}
        >
          {t("theme.title")}
        </Text>
        <Text
          style={[settingsScreenStyles.desc, { color: themeColor.subText }]}
        >
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
