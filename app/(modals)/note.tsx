import { StyleSheet, TextInput } from "react-native"
import React from "react"
import { Text, View } from "@/components/Themed"
import Colors from "@/constants/Colors"

export default function note() {
  return (
    <View style={styles.container}>
      <TextInput placeholder="제목 입력..." style={styles.titleInput} />
      <TextInput
        multiline={true}
        numberOfLines={10}
        style={styles.descInput}
        placeholder="설명을 넣어주세요."
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
    color: Colors.dark.text,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.subText,
    fontFamily: "sb-m",
    paddingVertical: 8,
    paddingLeft: 2,
  },
  descInput: {
    paddingLeft: 2,
    fontSize: 16,
    color: Colors.dark.text,
    paddingVertical: 14,
    height: 300,
    fontFamily: "sb-l",
    textAlignVertical: "top",
  },
})
