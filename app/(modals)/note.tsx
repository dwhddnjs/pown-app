import React from "react"
// component
import { StyleSheet, TextInput, useColorScheme } from "react-native"
import { View } from "@/components/Themed"
// zustand
import { useNoteStore } from "@/hooks/use-note-store"
// hook
import useCurrneThemeColor from "@/hooks/use-current-theme-color"

export default function note() {
  const { title, content, setValue } = useNoteStore()
  const themeColor = useCurrneThemeColor()
  return (
    <View style={styles.container}>
      <TextInput
        value={title}
        placeholder="제목 입력..."
        style={[
          styles.titleInput,
          {
            color: themeColor.text,
            borderBottomColor: themeColor.subText,
          },
        ]}
        onChangeText={(value) => setValue("title", value)}
      />
      <TextInput
        value={content}
        multiline={true}
        numberOfLines={10}
        style={[
          styles.descInput,
          {
            color: themeColor.text,
          },
        ]}
        placeholder="설명을 넣어주세요..."
        onChangeText={(value) => setValue("content", value)}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 16,
  },

  titleInput: {
    fontSize: 24,
    borderBottomWidth: 1,
    fontFamily: "sb-m",
    paddingVertical: 8,
    paddingLeft: 2,
  },
  descInput: {
    paddingLeft: 2,
    fontSize: 16,

    paddingVertical: 14,
    height: 300,
    fontFamily: "sb-l",
    textAlignVertical: "top",
  },
})
