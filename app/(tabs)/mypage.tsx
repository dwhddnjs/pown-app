import { StyleSheet } from "react-native"

import { Text, View } from "@/components/Themed"
import { Link } from "expo-router"
import { Button } from "@/components/Button"
import { userWorkoutPlanStore } from "@/hooks/use-workout-plan-store"
import Colors from "@/constants/Colors"

export default function TabTwoScreen() {
  const { onResetPlanList } = userWorkoutPlanStore()
  return (
    <View style={styles.container}>
      <View style={styles.userData}>
        <View style={styles.weight}>
          <Text>스쿼트</Text>
          <Text>170kg</Text>
        </View>
        <View style={styles.weight}>
          <Text>벤치프레스</Text>
          <Text>120kg</Text>
        </View>
        <View style={styles.weight}>
          <Text>데드리프트</Text>
          <Text>210kg</Text>
        </View>
        <View style={styles.weight}>
          <Text>오버헤드프레스</Text>
          <Text>70kg</Text>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
  },
  userData: {
    backgroundColor: Colors.dark.itemColor,
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 12,
    borderRadius: 14,
  },
  weight: {
    backgroundColor: Colors.dark.itemColor,
    justifyContent: "center",
    alignItems: "center",
  },
})
