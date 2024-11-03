import { StyleSheet, TextInput, useColorScheme } from "react-native"
import React from "react"
import { View } from "@/components/Themed"
import Colors from "@/constants/Colors"
import { useNoteStore } from "@/hooks/use-note-store"

export default function note() {
  const { title, content, setValue } = useNoteStore()
  const colorScheme = useColorScheme()

  return (
    <View style={styles.container}>
      <TextInput
        value={title}
        placeholder="제목 입력..."
        style={[
          styles.titleInput,
          {
            color: Colors[colorScheme ?? "light"].text,
            borderBottomColor: Colors[colorScheme ?? "light"].subText,
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
            color: Colors[colorScheme ?? "light"].text,
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
