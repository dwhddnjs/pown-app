import { WorkoutPlan } from "@/components/workout-plan/workout-plan"
import { Text, View } from "@/components/Themed"
import { PlatformColor, ScrollView, StyleSheet } from "react-native"
import Colors from "@/constants/Colors"
import { supabase } from "@/lib/supabase"
import { useEffect } from "react"
import { userWorkoutPlanStore } from "@/hooks/use-workout-plan-store"
import { Button } from "@/components/Button"
import { formatDate, groupByDate } from "@/lib/function"
import { format } from "date-fns"
import { Stack } from "expo-router"
import { useHeaderHeight } from "@react-navigation/elements"
import { BlurView } from "expo-blur"

export default function TabOneScreen() {
  const { workoutPlanList, onResetPlanList } = userWorkoutPlanStore()
  const sortWorkList = groupByDate(workoutPlanList)
  console.log("sortWorkList: ", sortWorkList)
  const headerHeight = useHeaderHeight()

  return (
    <ScrollView style={[styles.container, { paddingTop: headerHeight }]}>
      <View>
        {Object.entries(sortWorkList).map((item, index) => {
          return (
            <View style={styles.list} key={index}>
              <Text style={styles.date}>{`🗓️  ${formatDate(item[0])}`}</Text>
              <View style={styles.workoutList}>
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
          )
        })}
      </View>
      <View style={{ height: 300 }} />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // alignItems: "center",
    // justifyContent: "center",
    backgroundColor: Colors.dark.background,
    // paddingHorizontal: 24,
  },

  date: {
    fontSize: 14,
    textAlign: "center",
    fontFamily: "sb-l",
    borderWidth: 2,
    // color: Colors.dark.subText,
    alignSelf: "center",
    borderColor: Colors.dark.subText,
    paddingHorizontal: 10,
    // paddingTop: 1,
    paddingBottom: 4,
    borderRadius: 16,
  },
  workoutList: {
    borderRadius: 14,
    overflow: "hidden",
  },

  list: {
    paddingHorizontal: 24,
    gap: 18,
    paddingTop: 18,
    // paddingBottom: 12,
  },

  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: "80%",
  },
})
