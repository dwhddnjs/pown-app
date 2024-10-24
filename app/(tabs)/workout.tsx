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

export default function TabOneScreen() {
  const { data } = useGetUsers()
  const { workoutPlanList, onResetPlanList } = userWorkoutPlanStore()
  console.log("workoutPlanList: ", workoutPlanList)
  const sortWorkList = groupByDate(workoutPlanList)
  console.log("sortWorkList: ", sortWorkList)

  return (
    <ScrollView style={styles.container}>
      <View>
        {Object.entries(sortWorkList).map((item) => {
          console.log("item: ", item)
          return (
            <View style={styles.list}>
              <Text>{item[0]}</Text>
              {item[1].map((item) => (
                <WorkoutPlan item={item} />
              ))}
            </View>
          )
        })}
      </View>
      <Button type="solid" onPress={onResetPlanList}>
        RESET
      </Button>
    </ScrollView>
  )
}

// borderWidth: 1,
// borderColor: Colors.dark.text,

const styles = StyleSheet.create({
  container: {
    paddingTop: 24,
    flex: 1,
    // alignItems: "center",
    // justifyContent: "center",
    backgroundColor: Colors.dark.background,
    paddingHorizontal: 24,
  },
  list: {
    backgroundColor: Colors.dark.itemColor,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 14,
    gap: 12,
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
