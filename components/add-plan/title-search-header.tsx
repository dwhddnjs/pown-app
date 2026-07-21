import React from "react"
//components
import { StyleSheet, TouchableOpacity } from "react-native"
// color
import useCurrentThemeColor from "@/hooks/use-current-theme-color"
import { useT } from "@/hooks/use-t"
// icon
import { FontAwesome } from "@expo/vector-icons"
import { Text, View } from "../themed"

interface TitleSearchHeaderProps {
  onPress: () => void
}

export const TitleSearchHeader = ({ onPress }: TitleSearchHeaderProps) => {
  const themeColor = useCurrentThemeColor()
  const t = useT()

  return (
    <View style={styles.header}>
      <Text style={styles.title}>{t("plan.whichWorkout")}</Text>
      <TouchableOpacity onPress={onPress} style={{ padding: 8 }}>
        <FontAwesome name="search" size={20} color={themeColor.text} />
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    paddingHorizontal: 20,
    justifyContent: "space-between",
    alignItems: "center",
  },

  title: {
    // 제목이 길어도 검색 아이콘을 화면 밖으로 밀지 않게 제목 쪽이 먼저 줄어든다
    flexShrink: 1,
    fontSize: 24,
  },
})
