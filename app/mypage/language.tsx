// component
import { StyleSheet } from "react-native";
import { Text, View } from "@/components/themed";
import { SettingSection } from "@/components/mypage/setting-section";
import { SettingItem } from "@/components/mypage/setting-item";
// zustand
import { useLanguage, useUserStore } from "@/hooks/use-user-store";
// hooks
import useCurrentThemeColor from "@/hooks/use-current-theme-color";
import { useT } from "@/hooks/use-t";
// lib
import { Lang, LANG_LABEL } from "@/lib/i18n";
import { settingsScreenStyles } from "@/components/mypage/settings-screen-styles";
// expo
import { useRouter } from "expo-router";
// icon
import Entypo from "@expo/vector-icons/Entypo";

const LANG_OPTIONS: { key: Lang; flag: string }[] = [
  { key: "ko", flag: "🇰🇷" },
  { key: "en", flag: "🇺🇸" },
];

export default function Language() {
  const { setUser } = useUserStore();
  const language = useLanguage();
  const { back } = useRouter();

  const themeColor = useCurrentThemeColor();
  const t = useT();

  const onSubmitLanguage = (lang: Lang) => {
    setUser("language", lang);
    back();
  };

  return (
    <View style={settingsScreenStyles.container}>
      <View style={settingsScreenStyles.textContainer}>
        <Text
          style={[settingsScreenStyles.title, { color: themeColor.tintText }]}
        >
          {t("language.title")}
        </Text>
        <Text
          style={[settingsScreenStyles.desc, { color: themeColor.subText }]}
        >
          {t("language.desc")}
        </Text>
      </View>
      <SettingSection>
        {LANG_OPTIONS.map((option) => (
          <SettingItem
            key={option.key}
            icon={<Text style={styles.flag}>{option.flag}</Text>}
            title={LANG_LABEL[option.key]}
            right={
              language === option.key ? (
                <Entypo name="check" size={18} color={themeColor.tintText} />
              ) : undefined
            }
            onPress={() => onSubmitLanguage(option.key)}
          />
        ))}
      </SettingSection>
    </View>
  );
}

const styles = StyleSheet.create({
  flag: {
    fontSize: 18,
  },
});
