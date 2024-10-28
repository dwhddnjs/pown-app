import { StyleSheet, StyleSheetProperties } from "react-native"
import React from "react"
import { View } from "./Themed"

interface IconTitleProps {
  children: React.ReactNode
  style?: any
}

export const IconTitle = ({ children, style }: IconTitleProps) => {
  return <View style={[styles.container, style && style]}>{children}</View>
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
})
