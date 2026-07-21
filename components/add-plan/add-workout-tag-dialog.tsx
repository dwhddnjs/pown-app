import React, { useState } from "react"
import { Dialog } from "../dialog"
import { Text, View } from "../themed"
import useCurrentThemeColor from "@/hooks/use-current-theme-color"
import { useT } from "@/hooks/use-t"
import { TextInput } from "react-native-gesture-handler"
import { Button } from "../button"
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
  const themeColor = useCurrentThemeColor()
  const t = useT()
  const [inputValue, setInputValue] = useState("")
  const { workoutList, setAddWorkoutTag, setRemoveWorkoutTag } = useUserStore()
  const { isOpen, setOpen } = useWorkoutTagDialogStore()

  const onAddWorkoutTag = () => {
    if (workoutList[workoutType].includes(inputValue)) {
      toast.error(t("tag.exists"))
      return
    }
    setAddWorkoutTag(workoutType, inputValue)
    setOpen(false)
    setInputValue("")
    toast.success(t("tag.added"))
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
            {t("tag.addTitle")}
          </Text>
        </View>
        <TextInput
          placeholder={t("tag.namePlaceholder")}
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
        {t("common.addAction")}
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
