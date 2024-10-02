import { View, Text, StyleSheet, TouchableOpacity } from "react-native"
import React from "react"

interface IconTitleButtonProps {
  Icon: any
  title: string
  onClick: () => void
}

export const IconTitleButton = ({
  Icon,
  title,
  onClick,
}: IconTitleButtonProps) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onClick}>
      <Icon width={60} height={60} />
      <Text style={styles.title}>{title}</Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  title: {
    fontFamily: "sb-l",
    fontSize: 12,
    color: "#ffffff",
  },
})
