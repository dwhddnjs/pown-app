import { StyleSheet, TextInput } from "react-native"
import React from "react"
import useCurrneThemeColor from "@/hooks/use-current-theme-color"
import { Text, View } from "../Themed"

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
  const themeColor = useCurrneThemeColor()

  return (
    <View style={styles.itemContainer}>
      <Text>{title}</Text>
      <View
        style={[
          styles.container,
          {
            borderColor: themeColor.subText,
          },
        ]}
      >
        <TextInput
          style={[
            styles.input,
            {
              color: themeColor.tint,
            },
          ]}
          keyboardType="numeric"
          //   onFocus={(e) => onFocus(e.target)}
          maxLength={3}
          value={value}
          onChangeText={(value) => onChangeValue(type, value)}
          placeholder="0"
        />
        <Text>{label}</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  itemContainer: {
    gap: 8,
  },
  input: {
    textAlign: "right",
    minWidth: 60,
    fontSize: 16,
    fontFamily: "sb-l",
  },
  container: {
    flexDirection: "row",
    borderWidth: 2,
    alignSelf: "flex-start",
    paddingVertical: 8,
    gap: 4,
    paddingLeft: 0,
    paddingRight: 8,
    borderRadius: 10,
    // marginHorizontal: 24,
  },
})
