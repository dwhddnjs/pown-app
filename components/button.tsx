// component
import {
  StyleSheet,
  TouchableOpacity,
  TouchableOpacityProps,
} from "react-native";
import { Text } from "./themed";
// hook
import useCurrentThemeColor from "@/hooks/use-current-theme-color";

interface ButtonProps extends TouchableOpacityProps {
  children: React.ReactNode;
  type: "solid" | "bordered" | "icon";
  style?: {
    [key: string]: number | string;
  };
}

export const Button = ({ type, children, style, ...props }: ButtonProps) => {
  const themeColor = useCurrentThemeColor();

  return (
    <TouchableOpacity
      style={[
        styles[type],
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
            styles.title,
            type === "bordered" && {
              color: themeColor.tintText,
            },
          ]}
        >
          {children}
        </Text>
      )}
    </TouchableOpacity>
  );
};

// 색은 테마 훅에서 인라인으로 얹으므로 스타일 자체는 렌더마다 새로 만들 이유가 없다
const styles = StyleSheet.create({
  title: {
    fontSize: 16,
    fontFamily: "sb-m",
    textAlign: "center",
  },
  solid: {
    paddingVertical: 14,
    marginHorizontal: 20,
    borderRadius: 12,
  },
  bordered: {
    backgroundColor: "transparent",
    borderWidth: 2,
    paddingVertical: 14,
    marginHorizontal: 20,
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
    marginHorizontal: 20,
    borderRadius: 12,
  },
});
