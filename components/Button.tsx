// component
import {
  StyleSheet,
  TouchableOpacity,
  TouchableOpacityProps,
} from "react-native"
import { Text } from "./Themed"
// hook
import useCurrneThemeColor from "@/hooks/use-current-theme-color"

interface ButtonProps extends TouchableOpacityProps {
  children: React.ReactNode
  type: "solid" | "bordered" | "icon"
  style?: {
    [key: string]: number | string
  }
}

export const Button = ({ type, children, style, ...props }: ButtonProps) => {
  const themeColor = useCurrneThemeColor()

  return (
    <TouchableOpacity
      style={[
        styles()[type],
        type === "solid" && {
          backgroundColor: themeColor.tint,
        },
        type === "bordered" && {
          borderColor: themeColor.tint,
        },

        type === "icon" && {
          borderColor: themeColor.tabBar,
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
              color: themeColor.tint,
            },
          ]}
        >
          {children}
        </Text>
      )}
    </TouchableOpacity>
  )
}

const styles = () =>
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
