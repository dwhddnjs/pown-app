import { StyleSheet } from "react-native";
import React from "react";
import useCurrentThemeColor from "@/hooks/use-current-theme-color";
import { Text, View } from "../themed";

interface NoteTextProps {
  title?: string;
  content: string;
}

export const NoteText = ({ title, content }: NoteTextProps) => {
  const themeColor = useCurrentThemeColor();
  return (
    <View style={[styles.container, { backgroundColor: themeColor.itemColor }]}>
      {title && <Text style={styles.title}>{title}</Text>}
      <Text style={styles.content}>{content}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 2,
  },
  title: {
    fontSize: 16,
  },
  content: {
    fontFamily: "sb-l",
    fontSize: 12,
  },
});
