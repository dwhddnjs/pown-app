import React from "react"
import { StyleSheet } from "react-native"
import { Text, View } from "../themed"
import { Dialog } from "../dialog"
import { useWorkoutTagDialogStore } from "@/hooks/use-workout-tag-dialog-store"
import useCurrentThemeColor from "@/hooks/use-current-theme-color"
import { useT } from "@/hooks/use-t"
import { Button } from "../button"
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
  const themeColor = useCurrentThemeColor()
  const t = useT()

  const onRemoveWorkoutTag = () => {
    setRemoveWorkoutTag(workoutType, workout)
    setIsRemoveOpen(false)
    setPlanValue("workout", "")
    toast.success(t("tag.removed"))
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
            {t("tag.removeTitle")}
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
            {t("common.cancel")}
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
            {t("common.deleteAction")}
          </Button>
        </View>
      </View>
    </Dialog>
  )
}

const styles = StyleSheet.create({})
