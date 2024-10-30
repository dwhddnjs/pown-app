import { StyleSheet, useColorScheme } from "react-native"
import React from "react"
import { Text, View } from "./Themed"
import Colors from "@/constants/Colors"

export const NumberBallIcon = ({ children }: { children: React.ReactNode }) => {
  const colorScheme = useColorScheme()
  return (
    <View
      style={[
        styles.container,
        { backgroundColor: Colors[colorScheme ?? "light"].subText },
      ]}
    >
      <Text
        style={[styles.text, { color: Colors[colorScheme ?? "light"].text }]}
      >
        {children}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 50,
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },

  text: {
    marginTop: 2,
    fontFamily: "sb-b",
    textAlign: "center",
    fontSize: 12,
  },
})
