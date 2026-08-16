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
import { WorkoutTypes } from "@/types/workout"
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
  // 이 다이얼로그는 네이티브 Modal이라 sonner 토스트가 뒤에 가려 안 보인다 —
  // 창을 연 채로 알려야 하는 오류는 안에서 직접 그린다
  const [error, setError] = useState("")
  const { workoutList, setAddWorkoutTag } = useUserStore()
  const { isOpen, setOpen } = useWorkoutTagDialogStore()

  const onAddWorkoutTag = () => {
    if (workoutList[workoutType].includes(inputValue)) {
      setError(t("tag.exists"))
      return
    }
    setAddWorkoutTag(workoutType, inputValue)
    setOpen(false)
    setInputValue("")
    setError("")
    toast.success(t("tag.added"))
  }

  return (
    <Dialog
      isOpen={isOpen}
      onClose={() => {
        setOpen(false)
        setError("")
      }}
    >
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
          // 운동 이름은 사전에 없는 말이라 추천이 도움이 안 되고,
          // 추천 바가 키보드 위를 차지해 다이얼로그를 더 밀어올린다
          autoCorrect={false}
          spellCheck={false}
          autoComplete="off"
          style={[
            styles.input,
            {
              borderColor: themeColor.tint,
              color: themeColor.text,
            },
          ]}
          value={inputValue}
          onChangeText={(text) => {
            setInputValue(text)
            setError("")
          }}
        />
        {error ? (
          <Text style={[styles.error, { color: themeColor.fail }]}>
            {error}
          </Text>
        ) : null}
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

  error: {
    fontSize: 13,
    fontFamily: "sb-l",
    paddingHorizontal: 4,
  },
})
