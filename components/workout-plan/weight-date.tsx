import React from "react";
// component
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { toast } from "sonner-native";
// zustand
import { useWorkoutPlanStore } from "@/hooks/use-workout-plan-store";
import { useMultiPlanStore } from "@/hooks/use-multi-plan-store";
// lib
import { formatTime } from "@/lib/function";
import { tEquipment, tWorkout } from "@/lib/i18n";
import { useLanguage } from "@/hooks/use-user-store";
// expo
import { Ionicons } from "@expo/vector-icons";
import { useActionSheet } from "@expo/react-native-action-sheet";
import { usePathname, useRouter } from "expo-router";
// hook
import useCurrentThemeColor from "@/hooks/use-current-theme-color";
import { useT } from "@/hooks/use-t";

interface WeightDateProps {
  id: number;
  workout: string;
  weight: string;
  date: string;
  equipment: string;
  type: string;
}

export const WeightDate = ({
  id,
  workout,
  weight,
  date,
  type,
  equipment,
}: WeightDateProps) => {
  const themeColor = useCurrentThemeColor();
  const t = useT();
  const lang = useLanguage();
  const { showActionSheetWithOptions } = useActionSheet();
  const { push } = useRouter();
  const { setRemovePlan } = useWorkoutPlanStore();
  const { removeTempPlan, setEditingPlan, tempPlans } = useMultiPlanStore();
  const pathname = usePathname();
  const isMultiPlan = pathname.includes("multi-plan");

  const onPress = () => {
    const options = [t("common.delete"), t("common.edit"), t("common.cancel")];
    const destructiveButtonIndex = 0;
    const cancelButtonIndex = 2;

    showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex,
        destructiveButtonIndex,
      },
      (selectedIndex: number | undefined) => {
        switch (selectedIndex) {
          case 1:
            if (isMultiPlan) {
              const plan = tempPlans.find((p) => p.id === id);
              if (plan) {
                setEditingPlan(plan);
                push("/workout/add-multi-plan");
              }
            } else {
              push(`/edit-plan/${type}/${id}`);
            }
            break;

          case destructiveButtonIndex:
            if (isMultiPlan) {
              removeTempPlan(id);
              toast.success(t("workout.deleted"));
            } else {
              setRemovePlan(id);
              toast.success(t("workout.deleted"));
            }
            break;

          case cancelButtonIndex:
            break;
        }
      },
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: themeColor.itemColor }]}>
      <View style={styles.dateDropDown}>
        <Text style={[styles.date, { color: themeColor.subText }]}>
          {formatTime(date)}
        </Text>
        {pathname !== "/calendar-workout" && (
          <TouchableOpacity onPress={onPress} style={{ paddingLeft: 16 }}>
            <Ionicons
              name="ellipsis-horizontal"
              size={20}
              color={themeColor.text}
            />
          </TouchableOpacity>
        )}
      </View>
      <Text
        style={[styles.title, { color: themeColor.tintText }]}
      >{`${tEquipment(equipment, lang)} ${tWorkout(workout, lang)}`}</Text>
      <Text style={[styles.weight, { color: themeColor.text }]}>
        {t("workout.target", { weight })}{" "}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "column",
  },

  dateDropDown: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  titleWeight: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 6,
  },

  title: {
    fontSize: 16,
    fontFamily: "sb-m",
  },

  weight: {
    // fontSize: 16
    fontFamily: "sb-m",
  },

  date: {
    fontFamily: "sb-l",
  },
});
