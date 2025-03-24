import React, { useRef } from "react"
// component
import { StyleSheet, TextInput } from "react-native"
import { Text, View } from "../Themed"
import { IconTitle } from "../IconTitle"
// icon
import NoteIcon from "@expo/vector-icons/MaterialCommunityIcons"
import { Link } from "expo-router"
// zustand
import { usePlanStore } from "@/hooks/use-plan-store"
// hook
import useCurrneThemeColor from "@/hooks/use-current-theme-color"

export const PlanNote = () => {
  const { title, content, setPlanValue } = usePlanStore()
  const themeColor = useCurrneThemeColor()

  return (
    <View style={styles.main}>
      <View style={styles.container}>
        <IconTitle style={{ gap: 7, paddingLeft: 20, paddingBottom: 10 }}>
          <NoteIcon name="note-text" size={20} color={themeColor.tint} />
          <Text style={{ fontSize: 16 }}>퀵 노트</Text>
        </IconTitle>
        <Link
          href="/(modals)/note"
          style={[styles.link, { color: themeColor.tint }]}
          onPress={() => setPlanValue("content", "")}
        >
          전체노트 열기
        </Link>
      </View>

      {title && content ? (
        <View style={{ paddingHorizontal: 20, gap: 4 }}>
          <Text style={{ fontSize: 18 }}>{title}</Text>
          <Text style={{ fontSize: 14, fontFamily: "sb-l" }}>{content}</Text>
        </View>
      ) : (
        <TextInput
          style={[
            styles.input,
            {
              borderColor: themeColor.subText,
              color: themeColor.text,
            },
          ]}
          placeholder="특이사항을 적어주세요 (선택)"
          placeholderTextColor={themeColor.subText}
          value={content}
          onChangeText={(value) => setPlanValue("content", value)}
        />
      )}
      <View style={{ height: 250 }} />
    </View>
  )
}

const styles = StyleSheet.create({
  main: {
    paddingVertical: 12,
  },
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    paddingRight: 20,
  },

  link: {
    fontSize: 14,
    fontFamily: "sb-l",
    paddingBottom: 10,
    paddingLeft: 12,
  },

  input: {
    borderWidth: 2,
    borderRadius: 12,
    paddingVertical: 14,
    paddingLeft: 12,
    fontSize: 14,
    fontFamily: "sb-l",
    marginHorizontal: 20,
  },
})
