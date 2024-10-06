import {
  StyleSheet,
  TouchableOpacity,
  TouchableOpacityProps,
} from "react-native"
import { Text } from "./Themed"
import Colors from "@/constants/Colors"

interface ButtonProps extends TouchableOpacityProps {
  children: React.ReactNode
  type: "solid" | "bordered"
}

export const Button = ({ type, children, ...props }: ButtonProps) => {
  return (
    <TouchableOpacity style={styles[type]} {...props}>
      <Text style={styles.title}>{children}</Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  title: {
    fontSize: 16,
    fontFamily: "sb-m",
    textAlign: "center",
    color: Colors.dark.tint,
  },
  solid: {
    backgroundColor: Colors.dark.tint,
    paddingVertical: 14,
    marginHorizontal: 24,
    marginBottom: 44,
    borderRadius: 12,
  },
  bordered: {
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: Colors.dark.tint,
    paddingVertical: 14,
    marginHorizontal: 24,
    marginBottom: 44,
    borderRadius: 12,
  },
})
