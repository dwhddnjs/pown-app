import { Text, StyleSheet, TouchableOpacity } from "react-native";
import React from "react";
import useCurrentThemeColor from "@/hooks/use-current-theme-color";

interface IconTitleButtonProps {
  Icon: any;
  title: string;
  onClick: () => void;
}

export const IconTitleButton = ({
  Icon,
  title,
  onClick,
}: IconTitleButtonProps) => {
  const themeColor = useCurrentThemeColor();
  return (
    <TouchableOpacity style={styles.container} onPress={onClick}>
      <Icon width={60} height={60} />
      <Text style={[styles.title, { color: themeColor.text }]}>{title}</Text>
    </TouchableOpacity>
  );
};

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
});
