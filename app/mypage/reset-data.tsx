import { useState } from "react";
// component
import { StyleSheet } from "react-native";
import { Text, View } from "@/components/themed";
import { Dialog } from "@/components/dialog";
import { Button } from "@/components/button";
import { SettingSection } from "@/components/mypage/setting-section";
import { SettingItem } from "@/components/mypage/setting-item";
import { toast } from "sonner-native";
// zustand
import { useUserStore } from "@/hooks/use-user-store";
import { useWorkoutPlanStore } from "@/hooks/use-workout-plan-store";
import { useShortsStore } from "@/hooks/use-shorts-store";
// hooks
import useCurrentThemeColor from "@/hooks/use-current-theme-color";
import { useT } from "@/hooks/use-t"
// lib
import { createBackup, restoreBackup } from "@/lib/backup";
// expo
import { useRouter } from "expo-router";
// icon
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

export default function ResetData() {
  const { onResetPlanList } = useWorkoutPlanStore();

  const { onReset } = useUserStore();
  const { onResetVideo } = useShortsStore();
  const { back } = useRouter();
  const themeColor = useCurrentThemeColor();
  const t = useT();
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);

  const onSubmit = () => {
    setIsResetDialogOpen(false);
    onResetPlanList();
    onReset();
    onResetVideo();
    toast.success(t("data.resetDone"));
    back();
  };

  return (
    <View style={styles.container}>
      <View style={styles.textContainer}>
        <Text style={[styles.title, { color: themeColor.tintText }]}>
          {t("data.title")}
        </Text>
        <Text style={[styles.desc, { color: themeColor.subText }]}>
          {t("data.desc")}
        </Text>
      </View>
      <SettingSection title={t("data.backupSection")}>
        <SettingItem
          icon={
            <MaterialCommunityIcons
              name="tray-arrow-up"
              size={20}
              color={themeColor.tintText}
            />
          }
          title={t("data.backup")}
          value={t("data.backupDesc")}
          onPress={() => createBackup()}
        />
        <SettingItem
          icon={
            <MaterialCommunityIcons
              name="tray-arrow-down"
              size={20}
              color={themeColor.tintText}
            />
          }
          title={t("data.restore")}
          value={t("data.restoreDesc")}
          onPress={() => restoreBackup()}
        />
      </SettingSection>
      <SettingSection title={t("data.resetSection")}>
        <SettingItem
          icon={
            <MaterialCommunityIcons
              name="trash-can-outline"
              size={20}
              color={themeColor.fail}
            />
          }
          title={t("data.resetAll")}
          titleColor={themeColor.fail}
          onPress={() => setIsResetDialogOpen(true)}
        />
      </SettingSection>
      {isResetDialogOpen && (
        <Dialog
          isOpen={isResetDialogOpen}
          onClose={() => setIsResetDialogOpen(false)}
          modalHeight={300}
        >
          <View
            style={{
              backgroundColor: themeColor.itemColor,
              paddingHorizontal: 20,
              gap: 24,
            }}
          >
            <View style={{ backgroundColor: themeColor.itemColor, gap: 4 }}>
              <Text style={{ fontSize: 18 }}>
                {t("data.resetConfirm")}
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  color: themeColor.subText,
                  fontFamily: "sb-l",
                }}
              >
                * 운동 기록·내정보·숏츠가 모두 삭제되며 복구할 수 없어요.
              </Text>
            </View>
            <View
              style={{
                flexDirection: "row",
                backgroundColor: themeColor.itemColor,
                gap: 12,
              }}
            >
              <Button
                type="solid"
                style={{
                  flex: 1,
                  marginHorizontal: 0,
                  backgroundColor: themeColor.subText,
                }}
                onPress={() => setIsResetDialogOpen(false)}
              >
                {t("common.cancel")}
              </Button>
              <Button
                type="solid"
                style={{
                  flex: 1,
                  marginHorizontal: 0,
                  backgroundColor: themeColor.fail,
                }}
                onPress={onSubmit}
              >
                {t("common.deleteAction")}
              </Button>
            </View>
          </View>
        </Dialog>
      )}
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
