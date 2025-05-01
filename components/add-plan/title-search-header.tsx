import React from "react"
//components
import { StyleSheet, TouchableOpacity } from "react-native"
// color
import useCurrneThemeColor from "@/hooks/use-current-theme-color"
// icon
import { FontAwesome } from "@expo/vector-icons"
import { Text, View } from "../Themed"

interface TitleSearchHeaderProps {
  onPress: () => void
}

export const TitleSearchHeader = ({ onPress }: TitleSearchHeaderProps) => {
  const themeColor = useCurrneThemeColor()

  return (
    <View style={styles.header}>
      <Text style={styles.title}>🔥 어떤 운동 하실건가요?</Text>
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
    fontSize: 24,
    textAlign: "center",
  },
})
