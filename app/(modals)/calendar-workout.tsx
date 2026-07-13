// component
import { View, Text } from "@/components/themed";
import { StyleSheet, FlatList } from "react-native";
import { WorkoutPlan } from "@/components/workout-plan/workout-plan";
// expo
import { useLocalSearchParams } from "expo-router";
// hook
import useCurrentThemeColor from "@/hooks/use-current-theme-color";
// lib
import { formatDate, groupByDate } from "@/lib/function";
import {
  useWorkoutPlanStore,
  WorkoutPlanTypes,
} from "@/hooks/use-workout-plan-store";

export default function CalendarWorkout() {
  const themeColor = useCurrentThemeColor();
  const { date } = useLocalSearchParams<{ date: string }>();
  const { workoutPlanList } = useWorkoutPlanStore();

  const workoutPlanData: WorkoutPlanTypes[] = date
    ? workoutPlanList.filter((item) => item.createdAt.startsWith(date))
    : [];
  const sortWorkList = groupByDate(workoutPlanData);

  return (
    <View style={styles.container}>
      <Text style={{ fontSize: 24, padding: 12 }}>운동 히스토리</Text>
      <FlatList
        data={Object.entries(sortWorkList)}
        ListFooterComponent={<View style={{ height: 120 }} />}
        keyExtractor={(item) => item[0]}
        renderItem={({ item }) => {
          return (
            <View style={styles.list}>
              <View
                style={[
                  styles.planContainer,
                  {
                    backgroundColor: themeColor.tint,
                  },
                ]}
              >
                <Text
                  style={[styles.dateText, { color: themeColor.background }]}
                >{`🗓️  ${formatDate(item[0])}`}</Text>
                <View
                  style={[
                    styles.dot,
                    {
                      backgroundColor: themeColor.background,
                    },
                  ]}
                />
              </View>
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
  planContainer: {
    borderTopRightRadius: 12,
    borderTopLeftRadius: 12,
    paddingTop: 2,
    paddingBottom: 4,
    paddingHorizontal: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dateText: {
    fontSize: 14,
    fontFamily: "sb-l",
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 50,
    marginTop: 4,
  },
});
