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
    <View style={styles.container}>
      <View style={styles.textContainer}>
        <Text style={[styles.title, { color: themeColor.tint }]}>
          {t("language.title")}
        </Text>
        <Text style={[styles.desc, { color: themeColor.subText }]}>
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
                <Entypo name="check" size={18} color={themeColor.tint} />
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
  flag: {
    fontSize: 18,
  },
});
