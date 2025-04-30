import React, { useState } from "react"
import { Dialog } from "../Dialog"
import { Text, View } from "../Themed"
import useCurrneThemeColor from "@/hooks/use-current-theme-color"
import { TextInput } from "react-native-gesture-handler"
import { Button } from "../Button"
import { StyleSheet } from "react-native"
import { useWorkoutTagDialogStore } from "@/hooks/use-workout-tag-dialog-store"

export const AddWorkoutTagDialog = () => {
  const themeColor = useCurrneThemeColor()
  const [inputValue, setInputValue] = useState("")
  const { isOpen, setOpen } = useWorkoutTagDialogStore()

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
      <Button type="solid">추가하기</Button>
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
