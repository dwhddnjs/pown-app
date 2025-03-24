import React, { useRef, useState } from "react"
// component
import { Pressable, StyleSheet, TextInput } from "react-native"
import { Text, View } from "../Themed"
import { IconTitle } from "../IconTitle"
// icon
import WeightIcon from "@expo/vector-icons/MaterialCommunityIcons"
// hook
import { usePlanStore } from "@/hooks/use-plan-store"
import useCurrneThemeColor from "@/hooks/use-current-theme-color"

export const TopWeight = () => {
  const { weight, setPlanValue } = usePlanStore()
  const inputRef = useRef<TextInput>(null)
  const themeColor = useCurrneThemeColor()

  return (
    <View style={{ paddingVertical: 12, gap: 10, paddingHorizontal: 20 }}>
      <IconTitle style={{ gap: 8 }}>
        <WeightIcon name="weight-kilogram" size={20} color={themeColor.tint} />
        <Text style={{ fontSize: 16 }}>목표 중량</Text>
      </IconTitle>

      <Pressable
        onPress={() => inputRef.current?.focus()}
        style={[styles.container, { borderColor: themeColor.subText }]}
      >
        <TextInput
          ref={inputRef}
          style={[styles.input, { color: themeColor.tint }]}
          keyboardType="numeric"
          maxLength={3}
          value={weight}
          onChangeText={(value) => setPlanValue("weight", value)}
          placeholder="0"
          returnKeyType="done"
          placeholderTextColor={themeColor.subText}
        />
        <Text>kg</Text>
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    borderWidth: 2,
    alignSelf: "flex-start",
    paddingVertical: 8,
    gap: 3,
    paddingLeft: 4,
    paddingRight: 8,
    borderRadius: 10,
    // marginHorizontal: 24,
  },
  input: {
    textAlign: "right",
    minWidth: 45,
    fontSize: 16,
    fontFamily: "sb-l",
  },
})
