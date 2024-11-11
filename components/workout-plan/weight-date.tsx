import {
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native"
import React from "react"
import Colors from "@/constants/Colors"
import {
  userWorkoutPlanStore,
  WorkoutPlanTypes,
} from "@/hooks/use-workout-plan-store"
import { format, formatDate } from "date-fns"
import { formatTime } from "@/lib/function"
// import { DropDownMenu } from "../DropDownMenu"
import { Ionicons } from "@expo/vector-icons"
import { useActionSheet } from "@expo/react-native-action-sheet"
import { useRouter } from "expo-router"
import { toast } from "sonner-native"

interface WeightDateProps {
  id: number
  workout: string
  weight: string
  date: string
  equipment: string
  type: string
}

export const WeightDate = ({
  id,
  workout,
  weight,
  date,
  type,
  equipment,
}: WeightDateProps) => {
  const colorScheme = useColorScheme()

  const { showActionSheetWithOptions } = useActionSheet()
  const { push } = useRouter()
  const { setRemovePlan } = userWorkoutPlanStore()

  const onPress = () => {
    const options = ["삭제", "수정", "취소"]
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
            push(`/edit-plan/${type}/${id}`)
            break

          case destructiveButtonIndex:
            // Delete
            setRemovePlan(id)
            toast.success("운동계획이 삭제 되었습니다!")
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
      <Text
        style={[styles.title, { color: Colors[colorScheme ?? "light"].tint }]}
      >{`${equipment} ${workout}`}</Text>
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
