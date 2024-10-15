import { StyleSheet } from "react-native"
import React from "react"
import Colors from "@/constants/Colors"
import { Text, View } from "../Themed"

export const NoteText = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>오늘 느낌이 좋은데?</Text>
      <Text style={styles.content}>
        근데 사실 오늘 컨디션 좋지는 않았는데 뭔가 욕심 내면 들 수 있을거 같음
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.dark.itemColor,
    gap: 2,
  },
  title: {
    fontSize: 18,
  },
  content: {
    fontFamily: "sb-l",
  },
})
