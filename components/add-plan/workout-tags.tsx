import React from "react"
// component
import {
  StyleSheet,
  TextInput,
  TouchableOpacity,
  useColorScheme,
} from "react-native"
import { Text, View } from "../Themed"
// zustand
import { usePlanStore } from "@/hooks/use-plan-store"
import useCurrneThemeColor from "@/hooks/use-current-theme-color"
// icon
import FontAwesome from "@expo/vector-icons/FontAwesome"
import { useWorkoutTagDialogStore } from "@/hooks/use-workout-tag-dialog-store"
import { toast } from "sonner-native"
import { usePathname } from "expo-router"

interface WorkoutTagsProps {
  workoutList: string[]
}

export const WorkoutTags = ({ workoutList }: WorkoutTagsProps) => {
  const { workout, setPlanValue } = usePlanStore()
  const themeColor = useCurrneThemeColor()
  const { setOpen, setIsRemoveOpen } = useWorkoutTagDialogStore()
  const pathname = usePathname().split("/")

  const onPressWorkout = (item: string) => {
    if (workout === item) {
      setPlanValue("workout", "")
      return
    }
    setPlanValue("workout", item)
  }
  const onOpenRemoveDialog = () => {
    if (!workout) {
      toast.error("삭제하실 운동을 선택해주세요.")
      return
    }
    setIsRemoveOpen(true)
  }

  return (
    <View>
      <View style={styles.container}>
        {workoutList?.map((item) => (
          <TouchableOpacity
            key={item}
            style={[
              styles.tag,
              { borderColor: themeColor.tint },
              item === workout && {
                backgroundColor: themeColor.tint,
              },
            ]}
            onPress={() => onPressWorkout(item)}
          >
            <Text
              style={[
                styles.title,
                { color: themeColor.tint },
                item === workout && {
                  color: themeColor.text,
                },
              ]}
            >
              {item}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      {pathname[1] === "add-plan" && (
        <View
          style={[
            styles.buttonContainer,
            {
              borderColor: themeColor.subText,
            },
          ]}
        >
          <TouchableOpacity
            style={[
              styles.plusButton,
              {
                backgroundColor: themeColor.tint,
                borderColor: themeColor.subText,
              },
            ]}
            onPress={() => setOpen(true)}
          >
            <FontAwesome name="plus" size={14} color={themeColor.text} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.plusButton,
              {
                backgroundColor: themeColor.itemColor,
                borderColor: themeColor.subText,
              },
            ]}
            onPress={() => onOpenRemoveDialog()}
          >
            <FontAwesome name="minus" size={14} color={themeColor.text} />
          </TouchableOpacity>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  tag: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderWidth: 2,
    borderRadius: 50,
  },
  title: {
    fontFamily: "sb-l",
    fontSize: 14,
  },
  plusButton: {
    width: 44,
    height: 28,
    borderWidth: 2,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 2,
  },
  buttonContainer: {
    alignItems: "center",
    gap: 8,
    flexDirection: "row",
    justifyContent: "center",
    borderWidth: 2,
    alignSelf: "flex-end",

    marginRight: 20,
    borderRadius: 50,
    padding: 4,
  },
})
