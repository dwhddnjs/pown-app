import { WorkoutPlan } from "@/components/workout-plan/workout-plan"
import { Text, View } from "@/components/Themed"
import { ScrollView, StyleSheet } from "react-native"
import Colors from "@/constants/Colors"
import { supabase } from "@/lib/supabase"
import { useEffect } from "react"
import { useGetUsers } from "@/hooks/use-get-users"
import { userWorkoutPlanStore } from "@/hooks/use-workout-plan-store"
import { Button } from "@/components/Button"
import { groupByDate } from "@/lib/function"
import { format } from "date-fns"

export default function TabOneScreen() {
  const { data } = useGetUsers()
  const { workoutPlanList, onResetPlanList } = userWorkoutPlanStore()
  console.log("workoutPlanList: ", workoutPlanList)
  const sortWorkList = groupByDate(workoutPlanList)
  console.log("sortWorkList: ", sortWorkList)

  const formatDate = (value: string) => {
    const splitValue = value.split("-")
    return `${splitValue[0]}년 ${splitValue[1]}월 ${splitValue[2]}일`
  }

  return (
    <ScrollView style={styles.container}>
      <View>
        {Object.entries(sortWorkList).map((item) => {
          console.log("asdasdsad", item[1])

          return (
            <View style={styles.list}>
              <Text style={styles.date}>{formatDate(item[0])}</Text>
              <View style={styles.workoutList}>
                {item[1].map((data, index) => (
                  <WorkoutPlan
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
      {/* <Button type="solid" onPress={onResetPlanList}>
        RESET
      </Button> */}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    // paddingTop: 24,
    flex: 1,
    // alignItems: "center",
    // justifyContent: "center",
    backgroundColor: Colors.dark.background,
    // paddingHorizontal: 24,
  },

  date: {
    fontSize: 16,
    textAlign: "center",
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
