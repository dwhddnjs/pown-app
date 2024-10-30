import {
  Animated,
  Keyboard,
  StyleSheet,
  TouchableOpacity,
  TouchableOpacityProps,
  useColorScheme,
} from "react-native"
import { Text } from "./Themed"
import Colors from "@/constants/Colors"
import { useEffect, useRef, useState } from "react"
import { useKeyboardVisible } from "@/hooks/use-keyboard-visible"

interface ButtonProps extends TouchableOpacityProps {
  children: React.ReactNode
  type: "solid" | "bordered" | "submit" | "icon"
  style?: {
    [key: string]: number | string
  }
}

export const Button = ({ type, children, style, ...props }: ButtonProps) => {
  const isVisible = useKeyboardVisible() // 여기서 키보드가 켜졌는지 안켜졌는지 확인함
  const colorScheme = useColorScheme()

  const marginAnim = useRef(new Animated.Value(24)).current

  useEffect(() => {
    Animated.timing(marginAnim, {
      toValue: isVisible ? 0 : 24, // 키보드 보이면 0, 아니면 24
      duration: 100, // 애니메이션 지속 시간
      useNativeDriver: false, // marginHorizontal 애니메이션
    }).start()
  }, [isVisible])

  return (
    <Animated.View
      style={[
        type === "submit" && {
          marginHorizontal: marginAnim,
        },
      ]}
    >
      <TouchableOpacity
        style={[
          styles(isVisible)[type],
          type === "solid" && {
            backgroundColor: Colors[colorScheme ?? "light"].tint,
          },
          type === "bordered" && {
            borderColor: Colors[colorScheme ?? "light"].tint,
          },
          type === "submit" && {
            backgroundColor: Colors[colorScheme ?? "light"].tint,
          },
          type === "icon" && {
            borderColor: Colors[colorScheme ?? "light"].tabBar,
          },
          style,
        ]}
        {...props}
      >
        {type === "icon" ? (
          children
        ) : (
          <Text
            style={[
              styles().title,
              type === "bordered" && {
                color: Colors[colorScheme ?? "light"].tint,
              },
            ]}
          >
            {children}
          </Text>
        )}
      </TouchableOpacity>
    </Animated.View>
  )
}

const styles = (props?: boolean) =>
  StyleSheet.create({
    title: {
      fontSize: 16,
      fontFamily: "sb-m",
      textAlign: "center",
    },

    solid: {
      paddingVertical: 14,
      marginHorizontal: 24,
      borderRadius: 12,
    },
    bordered: {
      backgroundColor: "transparent",
      borderWidth: 2,

      paddingVertical: 14,
      marginHorizontal: 24,

      borderRadius: 12,
    },
    submit: {
      paddingVertical: 14,
      marginBottom: 44,
      borderRadius: props ? 0 : 12,
    },
    icon: {
      backgroundColor: "transparent",
      borderWidth: 2,

      gap: 8,
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      paddingVertical: 14,
      marginHorizontal: 24,
      borderRadius: 12,
    },
  })
