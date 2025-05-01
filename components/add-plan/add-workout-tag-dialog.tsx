import React, { useState } from "react"
import { Dialog } from "../Dialog"
import { Text, View } from "../Themed"
import useCurrneThemeColor from "@/hooks/use-current-theme-color"
import { TextInput } from "react-native-gesture-handler"
import { Button } from "../Button"
import { StyleSheet } from "react-native"
import { useWorkoutTagDialogStore } from "@/hooks/use-workout-tag-dialog-store"
import { useUserStore } from "@/hooks/use-user-store"
import { WorkoutTypes } from "@/hooks/use-plan-store"
import { toast } from "sonner-native"

interface AddWorkoutTagDialogProp {
  workoutType: WorkoutTypes
}

export const AddWorkoutTagDialog = ({
  workoutType,
}: AddWorkoutTagDialogProp) => {
  const themeColor = useCurrneThemeColor()
  const [inputValue, setInputValue] = useState("")
  const { workoutList, setAddWorkoutTag, setRemoveWorkoutTag } = useUserStore()
  const { isOpen, setOpen } = useWorkoutTagDialogStore()

  const onAddWorkoutTag = () => {
    if (workoutList[workoutType].includes(inputValue)) {
      toast.error("이미 존재하는 운동인데요?")
      return
    }
    setAddWorkoutTag(workoutType, inputValue)
    setOpen(false)
    setInputValue("")
    toast.success("운동이 추가되었습니다.")
  }

  return (
    <Dialog isOpen={isOpen} onClose={() => setOpen(false)}>
      <View
        style={[
          styles.container,
          {
            backgroundColor: themeColor.itemColor,
          },
        ]}
      >
        <View
          style={{
            backgroundColor: themeColor.itemColor,
          }}
        >
          <Text style={{ fontSize: 16 }}>
            새로운 운동 종목을 추가를 원하나요?
          </Text>
        </View>
        <TextInput
          placeholder="운동 이름을 기입해주세요.."
          style={[
            styles.input,
            {
              borderColor: themeColor.subText,
              color: themeColor.text,
            },
          ]}
          value={inputValue}
          onChangeText={(text) => setInputValue(text)}
        />
      </View>
      <Button type="solid" onPress={onAddWorkoutTag}>
        추가하기
      </Button>
    </Dialog>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 12,
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 12,
  },

  input: {
    height: 48,
    borderWidth: 2,
    borderRadius: 12,
    paddingHorizontal: 12,
    fontFamily: "sb-l",
  },
})
