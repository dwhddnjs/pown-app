import { useEffect } from "react";
import { View, Text } from "@/components/Themed";
import { StatusBar } from "expo-status-bar";
import {
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import useCurrentThemeColor from "@/hooks/use-current-theme-color";
import { useMultiPlanStore } from "@/hooks/use-multi-plan-store";
import { WorkoutPlan } from "@/components/workout-plan/workout-plan";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import AntDesign from "@expo/vector-icons/AntDesign";
import { FontAwesome6 } from "@expo/vector-icons";

export default function MultiPlanScreen() {
  const themeColor = useCurrentThemeColor();
  const router = useRouter();
  const { tempPlans, setMultiPlanMode, removeTempPlan, resetMultiPlan } =
    useMultiPlanStore();

  useEffect(() => {
    setMultiPlanMode(true);
    return () => {
      resetMultiPlan();
    };
  }, []);

  const handleAddPlan = () => {
    router.push("/workout/add-multi-plan");
  };

  return (
    <View style={styles.container}>
      {tempPlans.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons
            name="notebook-multiple"
            size={82}
            color={themeColor.subText}
          />
          <View style={{ gap: 4, alignItems: "center" }}>
            <Text style={[styles.emptyTitle, { color: themeColor.subText }]}>
              추가된 운동이 없습니다
            </Text>
            <Text style={[styles.emptySubtitle, { color: themeColor.subText }]}>
              아래 버튼을 눌러 운동을 추가해보세요
            </Text>
          </View>
        </View>
      ) : (
        <ScrollView
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
          <FontAwesome6 name="plus" size={30} color={themeColor.tint} />
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
