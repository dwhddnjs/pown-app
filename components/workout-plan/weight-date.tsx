import {
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native"
import React from "react"
import Colors from "@/constants/Colors"
import { WorkoutPlanTypes } from "@/hooks/use-workout-plan-store"
import { format, formatDate } from "date-fns"
import { formatTime } from "@/lib/function"
// import { DropDownMenu } from "../DropDownMenu"
import { Ionicons } from "@expo/vector-icons"
import { useActionSheet } from "@expo/react-native-action-sheet"
import { useRouter } from "expo-router"

interface WeightDateProps {
  workout: string
  weight: string
  date: string
  equipment: string
}

export const WeightDate = ({
  workout,
  weight,
  date,
  equipment,
}: WeightDateProps) => {
  const colorScheme = useColorScheme()

  const { showActionSheetWithOptions } = useActionSheet()
  const { push } = useRouter()

  const onPress = () => {
    const options = ["삭제", "저장", "취소"]
    const destructiveButtonIndex = 0
    const cancelButtonIndex = 2

    showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex,
        destructiveButtonIndex,
      },
      (selectedIndex: number | undefined) => {
        switch (selectedIndex) {
          case 1:
            // Save
            console.log("뭐")
            break

          case destructiveButtonIndex:
            // Delete
            console.log("삭제")
            break

          case cancelButtonIndex:
            console.log("취소")
          // Canceled
        }
      }
    )
  }

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: Colors[colorScheme ?? "light"].itemColor },
      ]}
    >
      <View style={styles.dateDropDown}>
        <Text
          style={[
            styles.date,
            { color: Colors[colorScheme ?? "light"].subText },
          ]}
        >
          {formatTime(date)}
        </Text>
        <TouchableOpacity onPress={onPress}>
          <Ionicons
            name="ellipsis-horizontal"
            size={20}
            color={Colors[colorScheme ?? "light"].text}
          />
        </TouchableOpacity>
      </View>
      <View style={styles.titleWeight}>
        <Text
          style={[styles.title, { color: Colors[colorScheme ?? "light"].tint }]}
        >{`${equipment} ${workout}`}</Text>
      </View>
      <Text
        style={[styles.weight, { color: Colors[colorScheme ?? "light"].text }]}
      >
        {`목표 • ${weight}kg`}{" "}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "column",
  },

  dateDropDown: {
    flexDirection: "row",
    // alignItems: "flex-end",
    justifyContent: "space-between",
  },

  titleWeight: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 6,
  },

  title: {
    fontSize: 16,
    fontFamily: "sb-m",
  },

  weight: {
    // fontSize: 16
    fontFamily: "sb-m",
  },

  date: {
    fontFamily: "sb-l",
  },
})
