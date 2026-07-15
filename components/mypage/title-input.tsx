import React from "react"
// component
import { StyleSheet, TextInput } from "react-native"
import { Text, View } from "../themed"
// hooks
import useCurrentThemeColor from "@/hooks/use-current-theme-color"

interface TitleInputProp {
  title: string
  label: string
  value: string
  onChangeValue: (type: string, value: string) => void
  type: string
}

export const TitleInput = ({
  title,
  label,
  value,
  type,
  onChangeValue,
}: TitleInputProp) => {
  const themeColor = useCurrentThemeColor()

  return (
    <View style={styles.itemContainer}>
      <Text style={[styles.title, { color: themeColor.subText }]}>
        {title}
      </Text>
      <View
        style={[styles.container, { backgroundColor: themeColor.itemColor }]}
      >
        <TextInput
          style={[styles.input, { color: themeColor.text }]}
          keyboardType="numeric"
          value={value}
          onChangeText={(value) => onChangeValue(type, value)}
          placeholder="0"
          placeholderTextColor={themeColor.subText}
          selectionColor={themeColor.tint}
        />
        <Text style={[styles.label, { color: themeColor.subText }]}>
          {label}
        </Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  itemContainer: {
    flex: 1,
    gap: 8,
  },
  title: {
    fontSize: 12,
    fontFamily: "sb-l",
    paddingLeft: 2,
  },
  container: {
    flexDirection: "row",
    alignItems: "center",
    height: 48,
    borderRadius: 12,
    borderCurve: "continuous",
    paddingHorizontal: 14,
    gap: 4,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontFamily: "sb-m",
    fontVariant: ["tabular-nums"],
  },
  label: {
    fontSize: 13,
    fontFamily: "sb-l",
  },
})
