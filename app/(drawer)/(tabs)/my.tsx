// component
import { ScrollView, StyleSheet } from "react-native";
import { UserDataCard } from "@/components/mypage/user-data-card";
import { SettingSection } from "@/components/mypage/setting-section";
import { SettingItem } from "@/components/mypage/setting-item";
import { toast } from "sonner-native";
// zustand
import { useLanguage, useUserStore } from "@/hooks/use-user-store";
// hooks
import useCurrentThemeColor from "@/hooks/use-current-theme-color";
import { useT } from "@/hooks/use-t";
import { useHeaderHeight } from "@react-navigation/elements";
// lib
import { LANG_LABEL, TKey } from "@/lib/i18n";
import { openMail } from "@/lib/open-mail";
// expo
import { useRouter } from "expo-router";
import * as Clipboard from "expo-clipboard";
import Constants from "expo-constants";
// icon
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

const THEME_LABEL: Record<"light" | "dark" | "system", TKey> = {
  light: "my.theme.light",
  dark: "my.theme.dark",
  system: "my.theme.system",
};

export default function My() {
  const { theme } = useUserStore();
  const language = useLanguage();
  const themeColor = useCurrentThemeColor();
  const t = useT();
  // 헤더가 투명해 콘텐츠가 그 아래로 지나간다 — 첫 카드가 가리지 않게 밀어준다
  const headerHeight = useHeaderHeight();

  const { push } = useRouter();

  const appVersion = Constants.expoConfig?.version ?? "";

  const contactEmail = "syd1215no@gmail.com";

  // 메일 앱을 못 열면(시뮬레이터·메일 미설정) 주소를 클립보드에 복사한다
  const onContact = async () => {
    if (await openMail(contactEmail, t("my.contactSubject"))) return;
    await Clipboard.setStringAsync(contactEmail);
    toast.success(t("my.emailCopied"));
  };

  return (
    <ScrollView
      style={{ backgroundColor: themeColor.background }}
      contentContainerStyle={[
        styles.content,
        { paddingTop: headerHeight + 24 },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <UserDataCard />

      <SettingSection title={t("my.general")}>
        <SettingItem
          icon={
            <MaterialCommunityIcons
              name="account-edit"
              size={20}
              color={themeColor.tintText}
            />
          }
          title={t("my.userInfo")}
          chevron
          onPress={() => push("/mypage/user-info")}
        />
        <SettingItem
          icon={
            <MaterialCommunityIcons
              name="circle-half-full"
              size={20}
              color={themeColor.tintText}
            />
          }
          title={t("my.themeMode")}
          value={t(THEME_LABEL[theme])}
          chevron
          onPress={() => push("/mypage/theme-mode")}
        />
        <SettingItem
          icon={
            <MaterialCommunityIcons
              name="translate"
              size={20}
              color={themeColor.tintText}
            />
          }
          title={t("my.language")}
          value={LANG_LABEL[language]}
          chevron
          onPress={() => push("/mypage/language")}
        />
        <SettingItem
          icon={
            <MaterialCommunityIcons
              name="calculator-variant"
              size={20}
              color={themeColor.tintText}
            />
          }
          title={t("my.calculator")}
          chevron
          onPress={() => push("/(modals)/calculate")}
        />
      </SettingSection>

      <SettingSection title={t("my.data")}>
        <SettingItem
          icon={
            <MaterialCommunityIcons
              name="database-outline"
              size={20}
              color={themeColor.tintText}
            />
          }
          title={t("my.dataManage")}
          value={t("my.dataManageDesc")}
          chevron
          onPress={() => push("/mypage/reset-data")}
        />
      </SettingSection>

      <SettingSection title={t("my.appInfo")}>
        <SettingItem
          icon={
            <MaterialCommunityIcons
              name="email-outline"
              size={20}
              color={themeColor.tintText}
            />
          }
          title={t("my.contact")}
          chevron
          onPress={onContact}
        />
        <SettingItem
          icon={
            <MaterialCommunityIcons
              name="information-outline"
              size={20}
              color={themeColor.tintText}
            />
          }
          title={t("my.appVersion")}
          value={appVersion}
        />
      </SettingSection>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 20,
    paddingBottom: 180,
    gap: 24,
  },
});
