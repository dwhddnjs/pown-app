import { View, Text } from "@/components/Themed"
import { StatusBar } from "expo-status-bar"
import { Platform, StyleSheet, useColorScheme } from "react-native"
import Arm from "@/assets/images/svg/arm_icon.svg"
import Back from "@/assets/images/svg/back_icon.svg"
import Chest from "@/assets/images/svg/chest_icon.svg"
import Leg from "@/assets/images/svg/leg_icon.svg"
import Shoulder from "@/assets/images/svg/shoulder_icon.svg"
import Colors from "@/constants/Colors"
import { IconTitleButton } from "@/components/IconTitleButton"
import { useRouter } from "expo-router"

export default function ModalScreen() {
  const colorScheme = useColorScheme()
  const iconButtonData = [
    {
      id: 1,
      title: "등",
      icon: Back,
      type: "back",
    },
    {
      id: 2,
      title: "가슴",
      icon: Chest,
      type: "chest",
    },
    {
      id: 3,
      title: "어깨",
      icon: Shoulder,
      type: "shoulder",
    },
    {
      id: 4,
      title: "하체",
      icon: Leg,
      type: "leg",
    },
    {
      id: 5,
      title: "팔",
      icon: Arm,
      type: "arm",
    },
  ]
  const router = useRouter()

  return (
    <View style={styles.container}>
      <View style={styles.titleDate}>
        <Text style={styles.title}>지금 어느 부위를 조질까?</Text>
        <View>
          <Text
            style={
              (styles.date, { color: Colors[colorScheme ?? "light"].tint })
            }
          >
            📆 2024년 10월 2일 19:30
          </Text>
        </View>
      </View>

      <View style={styles.iconContainer}>
        {iconButtonData.map((item) => (
          <IconTitleButton
            key={item.id}
            Icon={item.icon}
            title={item.title}
            onClick={() => {
              router.back()
              router.push(`/add-plan/${item.type}`)
            }}
          />
        ))}
      </View>
      <StatusBar style={Platform.OS === "ios" ? "light" : "auto"} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    paddingTop: 165,
    gap: 50,
  },

  titleDate: {
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  iconContainer: {
    flexDirection: "row",
    gap: 12,
  },
  title: {
    fontSize: 24,
  },
  date: {
    fontSize: 14,
    fontFamily: "sb-l",
  },
})
