// component
import { View, Text } from "@/components/Themed";
import { StyleSheet, FlatList } from "react-native";
import { WorkoutPlan } from "@/components/workout-plan/workout-plan";
// expo
import { useLocalSearchParams } from "expo-router";
// hook
import useCurrentThemeColor from "@/hooks/use-current-theme-color";
// lib
import { formatDate, groupByDate } from "@/lib/function";
import { WorkoutPlanTypes } from "@/hooks/use-workout-plan-store";
import { ThemeColorType } from "@/constants/Colors";

export default function calendarWorkout() {
  const themeColor = useCurrentThemeColor();
  const { data } = useLocalSearchParams();

  let workoutPlanData: WorkoutPlanTypes[] = [];
  try {
    workoutPlanData = data ? JSON.parse(data as string) : [];
  } catch {
    workoutPlanData = [];
  }
  const sortWorkList = groupByDate(workoutPlanData);

  return (
    <View style={styles(themeColor).container}>
      <Text style={{ fontSize: 24, padding: 12 }}>운동 히스토리</Text>
      <FlatList
        data={Object.entries(sortWorkList)}
        // estimatedItemSize={50}
        ListFooterComponent={<View style={{ height: 120 }} />}
        keyExtractor={(item) => item[0]}
        renderItem={({ item, index }) => {
          return (
            <View style={styles(themeColor).list} key={index}>
              <View
                style={[
                  styles(themeColor).planContainer,
                  {
                    backgroundColor: themeColor.tint,
                  },
                ]}
              >
                <Text
                  style={[
                    styles(themeColor).dateText,
                    { color: themeColor.background },
                  ]}
                >{`🗓️  ${formatDate(item[0])}`}</Text>
                <View
                  style={[
                    styles(themeColor).dot,
                    {
                      backgroundColor: themeColor.background,
                    },
                  ]}
                />
              </View>
              <View style={styles(themeColor).workoutList}>
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

const styles = (color: ThemeColorType) =>
  StyleSheet.create({
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
      backgroundColor: color.itemColor,
    },
    list: {
      paddingHorizontal: 12,
      paddingTop: 18,
    },
    date: {
      fontSize: 14,
      fontFamily: "sb-l",
      borderTopRightRadius: 12,
      borderTopLeftRadius: 12,
      paddingVertical: 6,
      backgroundColor: color.tint,
      color: color.background,
      paddingHorizontal: 12,
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
