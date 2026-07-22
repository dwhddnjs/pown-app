import { useEffect } from "react";
import { View, Text } from "@/components/themed";
import { StatusBar } from "expo-status-bar";
import {
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import { toast } from "sonner-native";
import useCurrentThemeColor from "@/hooks/use-current-theme-color";
import { useT } from "@/hooks/use-t";
import { useMultiPlanStore } from "@/hooks/use-multi-plan-store";
import { useWorkoutPlanStore } from "@/hooks/use-workout-plan-store";
import { WorkoutPlan } from "@/components/workout-plan/workout-plan";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { FontAwesome6 } from "@expo/vector-icons";
import { HeaderIconButton } from "@/components/header-icon-button";

export default function MultiPlanScreen() {
  const themeColor = useCurrentThemeColor();
  const t = useT();
  const router = useRouter();
  const { tempPlans, setMultiPlanMode, resetMultiPlan } = useMultiPlanStore();
  const { setWorkoutPlan } = useWorkoutPlanStore();

  useEffect(() => {
    setMultiPlanMode(true);
    return () => {
      resetMultiPlan();
    };
  }, []);

  const handleAddPlan = () => {
    router.push("/workout/add-multi-plan");
  };

  const onSaveAll = () => {
    if (tempPlans.length === 0) {
      return toast.error(t("routine.noWorkout"));
    }
    const baseId = Date.now();
    tempPlans.forEach((plan, idx) => {
      setWorkoutPlan({
        ...plan,
        id: baseId + idx,
      });
    });
    resetMultiPlan();
    router.back();
    toast.success(t("routine.savedCount", { n: tempPlans.length }));
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerRight: () =>
            tempPlans.length === 0 ? null : (
              <HeaderIconButton
                type="save"
                onPress={onSaveAll}
                style={{ marginTop: 16 }}
              />
            ),
        }}
      />
      {tempPlans.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons
            name="notebook-multiple"
            size={82}
            color={themeColor.subText}
          />
          <View style={{ gap: 4, alignItems: "center" }}>
            <Text style={[styles.emptyTitle, { color: themeColor.subText }]}>
              {t("routine.emptyTitle")}
            </Text>
            <Text style={[styles.emptySubtitle, { color: themeColor.subText }]}>
              {t("routine.emptyDesc")}
            </Text>
          </View>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
        >
          <View
            style={{
              borderRadius: 12,
              overflow: "hidden",

              backgroundColor: themeColor.itemColor,
            }}
          >
            {[...tempPlans].reverse().map((plan, index) => (
              <WorkoutPlan
                key={plan.id}
                item={plan}
                index={index}
                totalLength={tempPlans.length}
                hideProgress
              />
            ))}
          </View>
          <View style={{ height: 120 }} />
        </ScrollView>
      )}

      <View style={styles.addButtonContainer}>
        <TouchableOpacity
          onPress={handleAddPlan}
          style={[
            styles.addButton,
            {
              borderColor: themeColor.tint,
            },
          ]}
          activeOpacity={0.7}
        >
          <FontAwesome6 name="plus" size={30} color={themeColor.tintText} />
        </TouchableOpacity>
      </View>

      <StatusBar style={Platform.OS === "ios" ? "light" : "auto"} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingBottom: 80,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: "sb-m",
    marginTop: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    fontFamily: "sb-l",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  addButtonContainer: {
    position: "absolute",
    bottom: 40,
    alignSelf: "center",
    backgroundColor: "transparent",
  },
  addButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2.8,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
  },
});
