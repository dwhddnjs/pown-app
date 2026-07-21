import { View, Text } from "@/components/themed";
import { StatusBar } from "expo-status-bar";
import { Platform, StyleSheet, TouchableOpacity } from "react-native";
import Arm from "@/assets/images/svg/arm_icon.svg";
import Back from "@/assets/images/svg/back_icon.svg";
import Chest from "@/assets/images/svg/chest_icon.svg";
import Leg from "@/assets/images/svg/leg_icon.svg";
import Shoulder from "@/assets/images/svg/shoulder_icon.svg";
import { IconTitleButton } from "@/components/icon-title-button";
import { useRouter } from "expo-router";
import { formatPlanDateTime } from "@/lib/date";
import { useLanguage } from "@/hooks/use-user-store";
import { tBodyPart } from "@/lib/i18n";
import Entypo from "@expo/vector-icons/Entypo";
import useCurrentThemeColor from "@/hooks/use-current-theme-color";
import { useT } from "@/hooks/use-t";
import { SelectTypeDateSheet } from "@/components/add-plan/select-type-date-sheet";
import { useIsDialogOpenStore } from "@/hooks/use-is-dialog-open-store";
import { usePlanStore } from "@/hooks/use-plan-store";

export default function ModalScreen() {
  const themeColor = useCurrentThemeColor();
  const t = useT();
  const lang = useLanguage();
  const { open, setOpen } = useIsDialogOpenStore();
  const { date } = usePlanStore();

  const iconButtonData = [
    {
      id: 1,
      title: tBodyPart("back", lang),
      icon: Back,
      type: "back",
    },
    {
      id: 2,
      title: tBodyPart("chest", lang),
      icon: Chest,
      type: "chest",
    },
    {
      id: 3,
      title: tBodyPart("shoulder", lang),
      icon: Shoulder,
      type: "shoulder",
    },
    {
      id: 4,
      title: tBodyPart("leg", lang),
      icon: Leg,
      type: "leg",
    },
    {
      id: 5,
      title: tBodyPart("arm", lang),
      icon: Arm,
      type: "arm",
    },
  ];
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.titleDate}>
        <Text style={styles.title}>{t("plan.selectPart")}</Text>
        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => setOpen(true)}
        >
          <Text style={[styles.date, { color: themeColor.tint }]}>
            {`📆 ${formatPlanDateTime(date, lang)}`}
          </Text>
          <Entypo name="select-arrows" size={18} color={themeColor.tint} />
        </TouchableOpacity>
      </View>

      <View style={styles.iconContainer}>
        {iconButtonData.map((item) => (
          <IconTitleButton
            key={item.id}
            Icon={item.icon}
            title={item.title}
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
    paddingTop: 165,
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
  dateButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "flex-end",
    gap: 4,
  },
});
