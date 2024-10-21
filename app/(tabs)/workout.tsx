import { WorkoutPlan } from "@/components/workout-plan/workout-plan"
import { Text, View } from "@/components/Themed"
import { ScrollView, StyleSheet } from "react-native"
import Colors from "@/constants/Colors"
import { supabase } from "@/lib/supabase"
import { useEffect } from "react"
import { useGetUsers } from "@/hooks/use-get-users"

export default function TabOneScreen() {
  const { data } = useGetUsers()

  return (
    <ScrollView style={styles.container}>
      <View style={styles.list}>
        <WorkoutPlan />
        <WorkoutPlan />
        <WorkoutPlan />
        <WorkoutPlan />
      </View>
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
