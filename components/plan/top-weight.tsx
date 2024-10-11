import { StyleSheet, TextInput } from "react-native"
import React, { useState } from "react"
import WeightIcon from "@expo/vector-icons/MaterialCommunityIcons"
import { Text, View } from "../Themed"
import { IconTitle } from "../IconTitle"
import Colors from "@/constants/Colors"
import { usePlanStore } from "@/hooks/use-plan-store"

export const TopWeight = () => {
  const { weight, setPlanValue } = usePlanStore()
  console.log("weight: ", weight)

  return (
    <View style={{ paddingVertical: 12, gap: 10 }}>
      <IconTitle style={{ gap: 8 }}>
        <WeightIcon name="weight-kilogram" size={20} color={Colors.dark.tint} />
        <Text style={{ fontSize: 16 }}>최고 중량</Text>
      </IconTitle>
      <View style={styles.container}>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          maxLength={3}
          value={weight}
          onChangeText={(value) => setPlanValue("weight", value)}
          placeholder="0"
        />
        <Text>kg</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    borderWidth: 2,
    borderColor: Colors.dark.subText,
    alignSelf: "flex-start",
    paddingVertical: 8,
    gap: 3,
    paddingLeft: 4,
    paddingRight: 8,
    borderRadius: 10,
    marginHorizontal: 24,
  },
  input: {
    textAlign: "right",
    color: Colors.dark.tint,
    minWidth: 40,
    fontSize: 16,
    fontFamily: "sb-l",
  },
})
