import {
  StyleSheet,
  TextInput,
  useColorScheme,
  useWindowDimensions,
} from "react-native"
import React, { useRef } from "react"
import { Text, View } from "../Themed"
import { IconTitle } from "../IconTitle"
import NoteIcon from "@expo/vector-icons/MaterialCommunityIcons"
import Colors from "@/constants/Colors"
import { Link } from "expo-router"
import { usePlanStore } from "@/hooks/use-plan-store"
import { InputRefObject } from "@/app/add-plan/[slug]"
import { KeyBoardAvoid } from "../KeyBoardAvoid"

export const PlanNote = () => {
  const { title, content, setPlanValue } = usePlanStore()
  const colorScheme = useColorScheme()

  return (
    <View style={styles.main}>
      <View style={styles.container}>
        <IconTitle style={{ gap: 7, paddingLeft: 24 }}>
          <NoteIcon
            name="note-text"
            size={20}
            color={Colors[colorScheme ?? "light"].tint}
          />
          <Text style={{ fontSize: 16 }}>퀵 노트</Text>
        </IconTitle>
        <Link
          href="/(modals)/note"
          style={[styles.link, { color: Colors[colorScheme ?? "light"].tint }]}
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
          style={[
            styles.input,
            {
              borderColor: Colors[colorScheme ?? "light"].subText,
              color: Colors[colorScheme ?? "light"].text,
            },
          ]}
          placeholder="특이사항을 적어주세요 (선택)"
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
  },

  input: {
    borderWidth: 2,
    borderRadius: 12,
    paddingVertical: 14,
    paddingLeft: 12,
    fontSize: 14,
    fontFamily: "sb-l",
    marginHorizontal: 24,
  },
})
