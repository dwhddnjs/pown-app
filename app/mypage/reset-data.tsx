import { Button } from "@/components/Button"
import { Text, View } from "@/components/Themed"
import Colors from "@/constants/Colors"
import { mockupData } from "@/constants/constants"
import { useUserStore } from "@/hooks/use-user-store"
import {
  userWorkoutPlanStore,
  WorkoutPlanTypes,
} from "@/hooks/use-workout-plan-store"
import { useRouter } from "expo-router"
import { Pressable, StyleSheet, useColorScheme } from "react-native"
import { toast } from "sonner-native"

export default function ResetData() {
  const { onResetPlanList, onSetMockout } = userWorkoutPlanStore()
  const { onReset } = useUserStore()
  const colorScheme = useColorScheme()
  const { back } = useRouter()

  const onSubmit = () => {
    onResetPlanList()
    onReset()
    toast.success("모든 데이터가 초기화 되었습니다")
    back()
  }

  return (
    <View style={styles.container}>
      <View style={styles.textContainer}>
        <Text
          style={[styles.title, { color: Colors[colorScheme ?? "light"].tint }]}
        >
          정말 모든 데이터를 초기화하시겠습니까?
        </Text>
        <Text style={styles.desc}>
          기존에 있던 운동 및 유저 정보가 모두 삭제가 됩니다 {"\n"} 그럼에도
          불구하고 초기화를 진행 하시겠습니까?
        </Text>
      </View>
      <Button type="bordered" onPress={onSubmit}>
        초기화
      </Button>
      <Pressable
        style={{
          alignSelf: "flex-end",
          marginTop: 400,
          width: 50,
          height: 50,
          borderWidth: 1,
        }}
        onPress={() => {
          onSetMockout(mockupData as WorkoutPlanTypes[])
          toast.success("목업데이터 생성 되었습니다")
          back()
        }}
      ></Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 36,
    gap: 48,
  },

  textContainer: {
    gap: 12,
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 18,
  },
  desc: {
    fontFamily: "sb-l",
  },
})
