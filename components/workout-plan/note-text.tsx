import { StyleSheet, useColorScheme } from "react-native"
import React from "react"
import Colors from "@/constants/Colors"
import { Text, View } from "../Themed"

interface NoteTextProps {
  title?: string
  content: string
}

export const NoteText = ({ title, content }: NoteTextProps) => {
  const colorScheme = useColorScheme()
  return (
    <View
      style={[
        styles.container,
        { backgroundColor: Colors[colorScheme ?? "light"].itemColor },
      ]}
    >
      {title && <Text style={styles.title}>{title}</Text>}
      <Text style={styles.content}>{content}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    gap: 2,
  },
  title: {
    fontSize: 16,
  },
  content: {
    fontFamily: "sb-l",
    fontSize: 12,
  },
})
