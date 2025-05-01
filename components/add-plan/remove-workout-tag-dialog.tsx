import React from "react"
import { StyleSheet } from "react-native"
import { Text, View } from "../Themed"
import { Dialog } from "../Dialog"
import { useWorkoutTagDialogStore } from "@/hooks/use-workout-tag-dialog-store"
import useCurrneThemeColor from "@/hooks/use-current-theme-color"
import { Button } from "../Button"
import { usePlanStore, WorkoutTypes } from "@/hooks/use-plan-store"
import { useUserStore } from "@/hooks/use-user-store"
import { toast } from "sonner-native"

interface RemoveWorkoutTagDialogProps {
  workoutType: WorkoutTypes
}

export const RemoveWorkoutTagDialog = ({
  workoutType,
}: RemoveWorkoutTagDialogProps) => {
  const { isRemoveOpen, setIsRemoveOpen } = useWorkoutTagDialogStore()
  const { workout, setPlanValue } = usePlanStore()
  const { setRemoveWorkoutTag } = useUserStore()
  const themeColor = useCurrneThemeColor()

  const onRemoveWorkoutTag = () => {
    setRemoveWorkoutTag(workoutType, workout)
    setIsRemoveOpen(false)
    setPlanValue("workout", "")
    toast.success("운동이 삭제 되었습니다.")
  }

  return (
    <Dialog isOpen={isRemoveOpen} onClose={() => setIsRemoveOpen(false)}>
      <View
        style={{
          backgroundColor: themeColor.itemColor,
          paddingHorizontal: 20,
          gap: 24,
        }}
      >
        <View
          style={{
            backgroundColor: themeColor.itemColor,
            gap: 4,
          }}
        >
          <Text
            style={{
              fontSize: 18,
            }}
          >
            정말 선택된 운동을 삭제 할까요?
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: themeColor.subText,
              fontFamily: "sb-l",
            }}
          >
            * 뭐 삭제하셔도 나중에 다시 추가 할 수 있어요.
          </Text>
        </View>
        <View
          style={{
            flexDirection: "row",
            backgroundColor: themeColor.itemColor,
            gap: 12,
          }}
        >
          <Button
            type="solid"
            style={{
              flex: 1,
              marginHorizontal: 0,
              backgroundColor: themeColor.subText,
            }}
            onPress={() => setIsRemoveOpen(false)}
          >
            취소
          </Button>
          <Button
            type="solid"
            style={{
              flex: 1,
              marginHorizontal: 0,
              backgroundColor: themeColor.fail,
            }}
            onPress={onRemoveWorkoutTag}
          >
            삭제하기
          </Button>
        </View>
      </View>
    </Dialog>
  )
}

const styles = StyleSheet.create({})
