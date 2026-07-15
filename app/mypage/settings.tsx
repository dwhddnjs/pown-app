// component
import { ScrollView, StyleSheet } from "react-native";
import { UserDataCard } from "@/components/mypage/user-data-card";
import { SettingSection } from "@/components/mypage/setting-section";
import { SettingItem } from "@/components/mypage/setting-item";
import { toast } from "sonner-native";
// zustand
import { useUserStore } from "@/hooks/use-user-store";
// hooks
import useCurrentThemeColor from "@/hooks/use-current-theme-color";
// expo
import { useRouter } from "expo-router";
import * as Linking from "expo-linking";
import Constants from "expo-constants";
// icon
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

const THEME_LABEL = {
  light: "라이트",
  dark: "다크",
  system: "시스템",
} as const;

export default function Settings() {
  const { theme } = useUserStore();
  const themeColor = useCurrentThemeColor();

  const { push } = useRouter();

  const appVersion = Constants.expoConfig?.version ?? "";

  const onContact = async () => {
    try {
      await Linking.openURL(
        `mailto:syd1215no@gmail.com?subject=${encodeURIComponent("Pown 문의")}`,
      );
    } catch {
      toast.error("메일 앱을 열 수 없어요.");
    }
  };

  return (
    <ScrollView
      style={{ backgroundColor: themeColor.background }}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <UserDataCard />

      <SettingSection title="일반">
        <SettingItem
          icon={
            <MaterialCommunityIcons
              name="account-edit"
              size={20}
              color={themeColor.tint}
            />
          }
          title="내정보 작성"
          chevron
          onPress={() => push("/mypage/user-info")}
        />
        <SettingItem
          icon={
            <MaterialCommunityIcons
              name="circle-half-full"
              size={20}
              color={themeColor.tint}
            />
          }
          title="컬러모드 선택"
          value={THEME_LABEL[theme]}
          chevron
          onPress={() => push("/mypage/theme-mode")}
        />
        <SettingItem
          icon={
            <MaterialCommunityIcons
              name="calculator-variant"
              size={20}
              color={themeColor.tint}
            />
          }
          title="중량 계산기"
          chevron
          onPress={() => push("/(modals)/calculate")}
        />
      </SettingSection>

      <SettingSection title="데이터">
        <SettingItem
          icon={
            <MaterialCommunityIcons
              name="database-outline"
              size={20}
              color={themeColor.tint}
            />
          }
          title="데이터 관리"
          value="백업 · 복원 · 초기화"
          chevron
          onPress={() => push("/mypage/reset-data")}
        />
      </SettingSection>

      <SettingSection title="앱 정보">
        <SettingItem
          icon={
            <MaterialCommunityIcons
              name="email-outline"
              size={20}
              color={themeColor.tint}
            />
          }
          title="문의하기"
          chevron
          onPress={onContact}
        />
        <SettingItem
          icon={
            <MaterialCommunityIcons
              name="information-outline"
              size={20}
              color={themeColor.tint}
            />
          }
          title="앱 버전"
          value={appVersion}
        />
      </SettingSection>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 48,
    gap: 24,
  },
});
