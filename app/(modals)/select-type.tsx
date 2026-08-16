import { View, Text } from "@/components/themed";
import { StatusBar } from "expo-status-bar";
import { Platform, StyleSheet } from "react-native";
import { BODY_PART_ITEMS } from "@/constants/body-part";
import { IconTitleButton } from "@/components/icon-title-button";
import { useRouter } from "expo-router";
import { useLanguage } from "@/hooks/use-user-store";
import { tBodyPart } from "@/lib/i18n";
import { useT } from "@/hooks/use-t";
import { PlanDateButton } from "@/components/add-plan/plan-date-button";
import { SelectTypeDateSheet } from "@/components/add-plan/select-type-date-sheet";

export default function ModalScreen() {
  const t = useT();
  const lang = useLanguage();

  const router = useRouter();

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
      <StatusBar style={Platform.OS === "ios" ? "light" : "auto"} />
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
