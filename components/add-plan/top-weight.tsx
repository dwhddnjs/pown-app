import {
  Pressable,
  StyleSheet,
  TextInput,
  useColorScheme,
  useWindowDimensions,
} from "react-native"
import React, { useRef, useState } from "react"
import WeightIcon from "@expo/vector-icons/MaterialCommunityIcons"
import { Text, View } from "../Themed"
import { IconTitle } from "../IconTitle"
import Colors from "@/constants/Colors"
import { usePlanStore } from "@/hooks/use-plan-store"

export const TopWeight = () => {
  const { weight, setPlanValue } = usePlanStore()
  const colorScheme = useColorScheme()
  const inputRef = useRef<TextInput>(null)

  return (
    <Pressable
      onPress={() => inputRef.current?.focus()}
      style={{ paddingVertical: 12, gap: 10, paddingHorizontal: 20 }}
    >
      <IconTitle style={{ gap: 8 }}>
        <WeightIcon
          name="weight-kilogram"
          size={20}
          color={Colors[colorScheme ?? "light"].tint}
        />
        <Text style={{ fontSize: 16 }}>목표 중량</Text>
      </IconTitle>
      <View
        style={[
          styles.container,
          { borderColor: Colors[colorScheme ?? "light"].subText },
        ]}
      >
        <TextInput
          ref={inputRef}
          style={[styles.input, { color: Colors[colorScheme ?? "light"].tint }]}
          keyboardType="numeric"
          maxLength={3}
          value={weight}
          onChangeText={(value) => setPlanValue("weight", value)}
          placeholder="0"
        />
        <Text>kg</Text>
      </View>
    </Pressable>
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
    minWidth: 40,
    fontSize: 16,
    fontFamily: "sb-l",
  },
})
