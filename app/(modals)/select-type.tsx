import { useEffect } from "react";
// component
import { StyleSheet } from "react-native";
import { View, Text } from "@/components/themed";
import { IconTitleButton } from "@/components/icon-title-button";
import { PlanDateButton } from "@/components/add-plan/plan-date-button";
import { SelectTypeDateSheet } from "@/components/add-plan/select-type-date-sheet";
import { ModalStatusBar } from "@/components/navigation/modal-status-bar";
// zustand
import { usePlanStore } from "@/hooks/use-plan-store";
// hook
import { useLanguage } from "@/hooks/use-user-store";
import { useT } from "@/hooks/use-t";
// lib
import { tBodyPart } from "@/lib/i18n";
// expo
import { useRouter } from "expo-router";
// icon
import { BODY_PART_ITEMS } from "@/constants/body-part";

export default function ModalScreen() {
  const t = useT();
  const lang = useLanguage();

  const router = useRouter();
  const { setDate } = usePlanStore();

  // 폼 날짜는 스토어가 만들어질 때(앱을 켤 때)와 폼을 떠날 때만 지금으로 맞춰진다 — 앱을 켜고
  // 한참 뒤 처음 추가하면 켠 시각이 기본값으로 남았다. 새 기록은 여는 순간의 시각부터 시작한다
  useEffect(() => {
    setDate(new Date());
  }, [setDate]);

  return (
    <View style={styles.container}>
      <View style={styles.titleDate}>
        <Text style={styles.title}>{t("plan.selectPart")}</Text>
        <PlanDateButton textStyle={styles.date} />
      </View>

      <View style={styles.iconContainer}>
        {BODY_PART_ITEMS.map((item) => (
          <IconTitleButton
            key={item.type}
            Icon={item.icon}
            title={tBodyPart(item.type, lang)}
            onClick={() => {
              router.dismiss();
              setTimeout(() => {
                router.push(`/add-plan/${item.type}`);
              }, 100);
            }}
          />
        ))}
      </View>
      <ModalStatusBar />
      <SelectTypeDateSheet />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    paddingTop: 180,
    gap: 50,
  },

  titleDate: {
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },

  iconContainer: {
    flexDirection: "row",
    gap: 12,
  },
  title: {
    fontSize: 24,
    // 영어 제목은 두 줄로 접히므로 가운데 정렬이 필요하다
    textAlign: "center",
  },
  date: {
    fontSize: 14,
    fontFamily: "sb-l",
  },
});
