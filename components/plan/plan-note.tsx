import { StyleSheet, TextInput } from "react-native"
import React from "react"
import { Text, View } from "../Themed"
import { IconTitle } from "../IconTitle"
import NoteIcon from "@expo/vector-icons/MaterialCommunityIcons"
import Colors from "@/constants/Colors"
import { Link } from "expo-router"

export const PlanNote = () => {
  return (
    <View>
      <View style={styles.container}>
        <IconTitle style={{ gap: 7 }}>
          <NoteIcon name="note-text" size={20} color={Colors.dark.tint} />
          <Text style={{ fontSize: 16 }}>퀵 노트</Text>
        </IconTitle>
        <Link href="/(modals)/note" style={styles.link}>
          전체노트 열기
        </Link>
      </View>
      <TextInput
        style={styles.input}
        placeholder="특이사항을 적어주세요 (선택)"
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    paddingRight: 24,
  },

  link: {
    fontSize: 14,
    fontFamily: "sb-l",
    color: Colors.dark.tint,
  },

  input: {
    borderWidth: 2,
    borderColor: Colors.dark.subText,
    borderRadius: 12,
    paddingVertical: 12,
    color: Colors.dark.text,
    paddingLeft: 12,
    fontSize: 14,
    fontFamily: "sb-l",
    marginHorizontal: 24,
  },
})
