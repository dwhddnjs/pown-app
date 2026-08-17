// component
import { View, Text } from "@/components/themed";
import { useT } from "@/hooks/use-t";
import { StyleSheet, FlatList } from "react-native";
import { WorkoutPlan } from "@/components/workout-plan/workout-plan";
import { PlanDateHeader } from "@/components/workout-plan/plan-date-header";
// expo
import { useLocalSearchParams } from "expo-router";
// hook
import useCurrentThemeColor from "@/hooks/use-current-theme-color";
// lib
import { groupByDate } from "@/lib/date";
import {
  useWorkoutPlanStore,
  WorkoutPlanTypes,
} from "@/hooks/use-workout-plan-store";

export default function CalendarWorkout() {
  const t = useT();
  const themeColor = useCurrentThemeColor();
  const { date } = useLocalSearchParams<{ date: string }>();
  const { workoutPlanList } = useWorkoutPlanStore();

  const workoutPlanData: WorkoutPlanTypes[] = date
    ? workoutPlanList.filter((item) => item.createdAt.startsWith(date))
    : [];
  const sortWorkList = groupByDate(workoutPlanData);

  return (
    <View style={styles.container}>
      <Text style={{ fontSize: 24, padding: 12 }}>{t("workout.history")}</Text>
      <FlatList
        data={Object.entries(sortWorkList)}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        ListFooterComponent={<View style={{ height: 120 }} />}
        keyExtractor={(item) => item[0]}
        renderItem={({ item }) => {
          return (
            <View style={styles.list}>
              <PlanDateHeader date={item[0]} themeColor={themeColor} />
              <View
                style={[
                  styles.workoutList,
                  { backgroundColor: themeColor.itemColor },
                ]}
              >
                {item[1].map((data, index) => (
                  <WorkoutPlan
                    key={data.id}
                    item={data}
                    index={index}
                    totalLength={item[1].length}
                    hideMenu
                  />
                ))}
              </View>
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 8,
    paddingTop: 12,
  },
  workoutList: {
    borderBottomRightRadius: 12,
    borderBottomLeftRadius: 12,
    paddingTop: 2,
    overflow: "hidden",
  },
  list: {
    paddingHorizontal: 12,
    paddingTop: 18,
  },
});
