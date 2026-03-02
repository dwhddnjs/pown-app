import React from "react";
// component
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { toast } from "sonner-native";
// zustand
import {
  useWorkoutPlanStore,
  WorkoutPlanTypes,
} from "@/hooks/use-workout-plan-store";
import { useMultiPlanStore } from "@/hooks/use-multi-plan-store";
// lib
import { formatTime } from "@/lib/function";
// expo
import { Ionicons } from "@expo/vector-icons";
import { useActionSheet } from "@expo/react-native-action-sheet";
import { usePathname, useRouter } from "expo-router";
// hook
import useCurrentThemeColor from "@/hooks/use-current-theme-color";

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
  const { showActionSheetWithOptions } = useActionSheet();
  const { push } = useRouter();
  const { setRemovePlan } = useWorkoutPlanStore();
  const { removeTempPlan, setEditingPlan, tempPlans } = useMultiPlanStore();
  const pathname = usePathname();
  const isMultiPlan = pathname.includes("multi-plan");

  const onPress = () => {
    const options = ["삭제", "수정", "취소"];
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
              toast.success("운동계획이 삭제 되었습니다!");
            } else {
              setRemovePlan(id);
              toast.success("운동계획이 삭제 되었습니다!");
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
        style={[styles.title, { color: themeColor.tint }]}
      >{`${equipment} ${workout}`}</Text>
      <Text style={[styles.weight, { color: themeColor.text }]}>
        {`목표 • ${weight}kg`}{" "}
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
