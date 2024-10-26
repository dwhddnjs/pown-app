import { StyleSheet } from "react-native"

import { Text, View } from "@/components/Themed"
import { Link } from "expo-router"
import { Button } from "@/components/Button"
import { userWorkoutPlanStore } from "@/hooks/use-workout-plan-store"

export default function TabTwoScreen() {
  const { onResetPlanList } = userWorkoutPlanStore()
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tab Two</Text>
      <View style={styles.separator} />
      <Link href="/auth/sign-in" style={{ color: "red" }}>
        로그인으로 이동하쇼
      </Link>
      <Button type="solid" onPress={onResetPlanList}>
        RESET
      </Button>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: "80%",
  },
})
