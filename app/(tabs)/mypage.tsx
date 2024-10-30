import {
  StyleSheet,
  Switch,
  TouchableOpacity,
  useColorScheme,
} from "react-native"

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
  const colorScheme = useColorScheme()

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
          style={[
            styles.settings,
            { backgroundColor: Colors[colorScheme ?? "light"].itemColor },
          ]}
          onPress={() => push("/mypage/user-info")}
        >
          <IconTitle
            style={{
              backgroundColor: Colors[colorScheme ?? "light"].itemColor,
            }}
          >
            <MaterialCommunityIcons
              name="account-edit"
              size={20}
              color={Colors[colorScheme ?? "light"].tint}
            />
            <Text>내정보 작성</Text>
          </IconTitle>
          <AntDesign
            name="up"
            size={20}
            color={Colors[colorScheme ?? "light"].subText}
          />
        </TouchableOpacity>

        {/* 3대중량 */}
        <TouchableOpacity
          style={[
            styles.settings,
            { backgroundColor: Colors[colorScheme ?? "light"].itemColor },
          ]}
          onPress={() => push("/mypage/max-weights")}
        >
          <IconTitle
            style={{
              backgroundColor: Colors[colorScheme ?? "light"].itemColor,
            }}
          >
            <MaterialCommunityIcons
              name="weight-kilogram"
              size={20}
              color={Colors[colorScheme ?? "light"].tint}
            />
            <Text>3대중량 기입</Text>
          </IconTitle>
          <AntDesign
            name="up"
            size={20}
            color={Colors[colorScheme ?? "light"].subText}
          />
        </TouchableOpacity>

        {/* 컬러모드 */}
        <TouchableOpacity
          style={[
            styles.settings,
            { backgroundColor: Colors[colorScheme ?? "light"].itemColor },
          ]}
          onPress={() => push("/mypage/theme-mode")}
        >
          <IconTitle
            style={{
              backgroundColor: Colors[colorScheme ?? "light"].itemColor,
            }}
          >
            <MaterialCommunityIcons
              name="circle-half-full"
              size={20}
              color={Colors[colorScheme ?? "light"].tint}
            />
            <Text>컬러모드 선택</Text>
          </IconTitle>
          <AntDesign
            name="up"
            size={20}
            color={Colors[colorScheme ?? "light"].subText}
          />
        </TouchableOpacity>

        {/* 데이터 초기화 */}
        <TouchableOpacity
          style={[
            styles.settings,
            { backgroundColor: Colors[colorScheme ?? "light"].itemColor },
          ]}
          onPress={() => push("/mypage/reset-data")}
        >
          <IconTitle
            style={{
              backgroundColor: Colors[colorScheme ?? "light"].itemColor,
            }}
          >
            <MaterialCommunityIcons
              name="database-remove"
              size={20}
              color={Colors[colorScheme ?? "light"].tint}
            />
            <Text>데이터 초기화</Text>
          </IconTitle>
          <AntDesign
            name="up"
            size={20}
            color={Colors[colorScheme ?? "light"].subText}
          />
        </TouchableOpacity>
      </View>
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
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
})
