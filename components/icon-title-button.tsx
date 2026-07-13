import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
} from "react-native"
import React from "react"
import Colors from "@/constants/Colors"

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
  const colorScheme = useColorScheme()
  return (
    <TouchableOpacity style={styles.container} onPress={onClick}>
      <Icon width={60} height={60} />
      <Text
        style={[styles.title, { color: Colors[colorScheme ?? "light"].text }]}
      >
        {title}
      </Text>
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
  },
})
