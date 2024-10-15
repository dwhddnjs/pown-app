import { WorkoutPlan } from "@/components/workout-plan/workout-plan"
import { Text, View } from "@/components/Themed"
import { StyleSheet } from "react-native"

export default function TabOneScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.list}>
        <WorkoutPlan />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 24,
    flex: 1,
    // alignItems: "center",
    // justifyContent: "center",
  },
  list: {
    paddingHorizontal: 24,
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
