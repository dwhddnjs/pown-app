import { useRef, useState } from "react";
// component
import { Pressable, StyleSheet } from "react-native";
import { Text, View } from "@/components/themed";
import { Dialog } from "@/components/dialog";
import { Button } from "@/components/button";
import { SettingSection } from "@/components/mypage/setting-section";
import { SettingItem } from "@/components/mypage/setting-item";
import { toast } from "sonner-native";
// zustand
import { useUserStore } from "@/hooks/use-user-store";
import {
  useWorkoutPlanStore,
  WorkoutPlanTypes,
} from "@/hooks/use-workout-plan-store";
import { useShortsStore } from "@/hooks/use-shorts-store";
// hooks
import useCurrentThemeColor from "@/hooks/use-current-theme-color";
import { useT } from "@/hooks/use-t";
// lib
import { createBackup, restoreBackup } from "@/lib/backup";
import seedWorkoutPlans from "@/assets/seed-workout-plans.json";
// expo
import { useRouter } from "expo-router";
// icon
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

// 숨김 기능: 화면 우측 최하단을 이만큼 연속으로 눌러야 시드 주입이 뜬다
const SEED_TAP_COUNT = 5;

type Confirm = {
  title: string;
  desc: string;
  action: string;
  actionColor: string;
  onConfirm: () => void;
};

export default function ResetData() {
  const { onResetPlanList, onSetMockout } = useWorkoutPlanStore();

  const { onReset } = useUserStore();
  const { onResetVideo } = useShortsStore();
  const { back } = useRouter();
  const themeColor = useCurrentThemeColor();
  const t = useT();
  const [confirm, setConfirm] = useState<Confirm | null>(null);
  const seedTaps = useRef(0);

  const onResetAll = () => {
    setConfirm(null);
    onResetPlanList();
    onReset();
    onResetVideo();
    toast.success(t("data.resetDone"));
    back();
  };

  const onSeed = () => {
    setConfirm(null);
    // JSON import는 progress 같은 리터럴 유니온을 string으로 넓혀서 읽는다
    onSetMockout(seedWorkoutPlans as WorkoutPlanTypes[]);
    toast.success(t("data.seedDone", { n: seedWorkoutPlans.length }));
    back();
  };

  const onSeedTap = () => {
    seedTaps.current += 1;
    if (seedTaps.current < SEED_TAP_COUNT) return;
    seedTaps.current = 0;
    setConfirm({
      title: t("data.seedConfirm", { n: seedWorkoutPlans.length }),
      desc: t("data.seedDesc"),
      action: t("data.seedAction"),
      actionColor: themeColor.tint,
      onConfirm: onSeed,
    });
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
          onPress={() =>
            setConfirm({
              title: t("data.resetConfirm"),
              desc: "* 운동 기록·내정보·숏츠가 모두 삭제되며 복구할 수 없어요.",
              action: t("common.deleteAction"),
              actionColor: themeColor.fail,
              onConfirm: onResetAll,
            })
          }
        />
      </SettingSection>
      <Pressable style={styles.seedHitArea} onPress={onSeedTap} />
      {confirm && (
        <Dialog
          isOpen={!!confirm}
          onClose={() => setConfirm(null)}
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
              <Text style={{ fontSize: 18 }}>{confirm.title}</Text>
              <Text
                style={{
                  fontSize: 14,
                  color: themeColor.subText,
                  fontFamily: "sb-l",
                }}
              >
                {confirm.desc}
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
                onPress={() => setConfirm(null)}
              >
                {t("common.cancel")}
              </Button>
              <Button
                type="solid"
                style={{
                  flex: 1,
                  marginHorizontal: 0,
                  backgroundColor: confirm.actionColor,
                }}
                onPress={confirm.onConfirm}
              >
                {confirm.action}
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
  // 우측 최하단 숨김 탭 영역 — 보이지 않고, 다른 항목과 겹치지 않는 빈 자리다
  seedHitArea: {
    position: "absolute",
    right: 0,
    bottom: 0,
    width: 80,
    height: 80,
  },
});
