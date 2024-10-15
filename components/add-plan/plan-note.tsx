import { StyleSheet, TextInput, useWindowDimensions } from "react-native"
import React from "react"
import { Text, View } from "../Themed"
import { IconTitle } from "../IconTitle"
import NoteIcon from "@expo/vector-icons/MaterialCommunityIcons"
import Colors from "@/constants/Colors"
import { Link } from "expo-router"
import { usePlanStore } from "@/hooks/use-plan-store"

export const PlanNote = ({ onFocus }: { onFocus: (value: any) => void }) => {
  const { title, content, setPlanValue } = usePlanStore()

  return (
    <View style={styles.main}>
      <View style={styles.container}>
        <IconTitle style={{ gap: 7 }}>
          <NoteIcon name="note-text" size={20} color={Colors.dark.tint} />
          <Text style={{ fontSize: 16 }}>퀵 노트</Text>
        </IconTitle>
        <Link
          href="/(modals)/note"
          style={styles.link}
          onPress={() => setPlanValue("content", "")}
        >
          전체노트 열기
        </Link>
      </View>

      {title && content ? (
        <View style={{ paddingHorizontal: 24, gap: 4 }}>
          <Text style={{ fontSize: 18 }}>{title}</Text>
          <Text style={{ fontSize: 14, fontFamily: "sb-l" }}>{content}</Text>
        </View>
      ) : (
        <TextInput
          style={styles.input}
          onFocus={(e) => onFocus(e.target)}
          placeholder="특이사항을 적어주세요 (선택)"
          value={content}
          onChangeText={(value) => setPlanValue("content", value)}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  main: {
    paddingVertical: 12,
    gap: 10,
  },
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
    paddingVertical: 14,
    color: Colors.dark.text,
    paddingLeft: 12,
    fontSize: 14,
    fontFamily: "sb-l",
    marginHorizontal: 24,
  },
})
