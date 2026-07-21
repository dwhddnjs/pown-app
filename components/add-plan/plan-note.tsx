import React, { useRef } from "react"
// component
import { StyleSheet, TextInput } from "react-native"
import { Text, View } from "../themed"
import { IconTitle } from "../icon-title"
// icon
import NoteIcon from "@expo/vector-icons/MaterialCommunityIcons"
import { Link } from "expo-router"
// zustand
import { usePlanStore } from "@/hooks/use-plan-store"
// hook
import useCurrentThemeColor from "@/hooks/use-current-theme-color"
import { useT } from "@/hooks/use-t"

interface PlanNoteProps {
  onFocusScroll: (positionY: number) => void
  currentScrollY: number
}

export const PlanNote = ({ onFocusScroll, currentScrollY }: PlanNoteProps) => {
  const { title, content, setPlanValue } = usePlanStore()
  const themeColor = useCurrentThemeColor()
  const t = useT()
  const inputRef = useRef<TextInput>(null)

  return (
    <View style={styles.main}>
      <View style={styles.container}>
        <IconTitle style={{ gap: 7, paddingLeft: 20, paddingBottom: 10 }}>
          <NoteIcon name="note-text" size={20} color={themeColor.tint} />
          <Text style={{ fontSize: 16 }}>{t("plan.quickNote")}</Text>
        </IconTitle>
        <Link
          href="/(modals)/note"
          style={[styles.link, { color: themeColor.tint }]}
        >
          {t("plan.openFullNote")}
        </Link>
      </View>

      {title && content ? (
        <View style={{ paddingHorizontal: 20, gap: 4 }}>
          <Text style={{ fontSize: 18 }}>{title}</Text>
          <Text style={{ fontSize: 14, fontFamily: "sb-l" }}>{content}</Text>
        </View>
      ) : (
        <TextInput
          ref={inputRef}
          onFocus={() => {
            inputRef.current?.measure((x, y, w, h, px, py) => {
              const targetPosition = (currentScrollY + py) / 2
              onFocusScroll(targetPosition)
            })
          }}
          style={[
            styles.input,
            {
              borderColor: themeColor.subText,
              color: themeColor.text,
            },
          ]}
          placeholder={t("plan.notePlaceholder")}
          placeholderTextColor={themeColor.subText}
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
