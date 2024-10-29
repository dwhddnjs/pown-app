import { StyleSheet, Switch, TouchableOpacity } from "react-native"

import { Text, View } from "@/components/Themed"
import { Link, useRouter } from "expo-router"
import { Button } from "@/components/Button"
import { userWorkoutPlanStore } from "@/hooks/use-workout-plan-store"
import Colors from "@/constants/Colors"
import UserPlus from "@expo/vector-icons/FontAwesome5"
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons"
import AntDesign from "@expo/vector-icons/AntDesign"
import FontAwesome6 from "@expo/vector-icons/FontAwesome6"
import { IconTitle } from "@/components/IconTitle"

import { useState } from "react"
import { UserDataCard } from "@/components/mypage/user-data-card"
import { useUserStore } from "@/hooks/use-user-store"

export default function TabTwoScreen() {
  const { onResetPlanList } = userWorkoutPlanStore()
  const [value, setValue] = useState(true)
  const { onReset, ...result } = useUserStore()
  console.log("result: ", result)
  const { push } = useRouter()

  const weightMax = [
    { id: 1, title: "스쿼트", weight: 170 },
    { id: 2, title: "벤치프레스", weight: 120 },
    { id: 3, title: "데드리프트", weight: 210 },
  ]
  const useData = [
    { id: 1, title: "키", weight: 168 },
    { id: 2, title: "몸무게", weight: 72 },
    { id: 3, title: "나이", weight: 28 },
    { id: 4, title: "성별", weight: "남자" },
  ]

  return (
    <View style={styles.container}>
      <UserDataCard />
      <View style={styles.settingsContainer}>
        {/* 내정보 */}
        <TouchableOpacity
          style={styles.settings}
          onPress={() => push("/mypage/user-info")}
        >
          <IconTitle style={{ backgroundColor: Colors.dark.itemColor }}>
            <MaterialCommunityIcons
              name="account-edit"
              size={20}
              color={Colors.dark.tint}
            />
            <Text>내정보 작성</Text>
          </IconTitle>
          <AntDesign name="up" size={20} color={Colors.dark.subText} />
        </TouchableOpacity>

        {/* 3대중량 */}
        <TouchableOpacity
          style={styles.settings}
          onPress={() => push("/mypage/max-weights")}
        >
          <IconTitle style={{ backgroundColor: Colors.dark.itemColor }}>
            <MaterialCommunityIcons
              name="weight-kilogram"
              size={20}
              color={Colors.dark.tint}
            />
            <Text>3대중량 기입</Text>
          </IconTitle>
          <AntDesign name="up" size={20} color={Colors.dark.subText} />
        </TouchableOpacity>

        {/* 컬러모드 */}
        <TouchableOpacity
          style={[styles.settings]}
          onPress={() => push("/mypage/theme-mode")}
        >
          <IconTitle style={{ backgroundColor: Colors.dark.itemColor }}>
            <MaterialCommunityIcons
              name="circle-half-full"
              size={20}
              color={Colors.dark.tint}
            />
            <Text>컬러모드 선택</Text>
          </IconTitle>
          <AntDesign name="up" size={20} color={Colors.dark.subText} />
        </TouchableOpacity>
      </View>
      <Button type="solid" onPress={onReset}>
        리셋
      </Button>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    gap: 14,
    paddingTop: 14,
  },

  settingsContainer: {
    gap: 12,
  },
  settings: {
    backgroundColor: Colors.dark.itemColor,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
})
