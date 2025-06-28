import { View, Text } from "@/components/Themed"
import { StatusBar } from "expo-status-bar"
import { Platform, StyleSheet, TouchableOpacity } from "react-native"
import Arm from "@/assets/images/svg/arm_icon.svg"
import Back from "@/assets/images/svg/back_icon.svg"
import Chest from "@/assets/images/svg/chest_icon.svg"
import Leg from "@/assets/images/svg/leg_icon.svg"
import Shoulder from "@/assets/images/svg/shoulder_icon.svg"
import { IconTitleButton } from "@/components/IconTitleButton"
import { useNavigation, useRouter } from "expo-router"
import { format } from "date-fns"
import Entypo from "@expo/vector-icons/Entypo"
import useCurrneThemeColor from "@/hooks/use-current-theme-color"
import { useLayoutEffect, useState } from "react"
import { SelectTypeDateSheet } from "@/components/add-plan/select-type-date-sheet"
import { useIsDialogOpenStore } from "@/hooks/use-is-dialog-open-store"
import { useIsFocused } from "@react-navigation/native"
import { usePlanStore } from "@/hooks/use-plan-store"

export default function ModalScreen() {
  const themeColor = useCurrneThemeColor()
  const { open, setOpen } = useIsDialogOpenStore()
  const { date } = usePlanStore()

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
        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => setOpen(true)}
        >
          <Text style={(styles.date, { color: themeColor.tint })}>
            {`📆 ${format(date, "yyyy년 M월 d일 h시 m분")}`}
          </Text>
          <Entypo name="select-arrows" size={18} color={themeColor.tint} />
        </TouchableOpacity>
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
      <SelectTypeDateSheet />
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
    gap: 10,
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
  dateButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "flex-end",
    gap: 4,
  },
})
