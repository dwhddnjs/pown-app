import { StyleSheet } from "react-native";
import React from "react";
import useCurrentThemeColor from "@/hooks/use-current-theme-color";
import { Text, View } from "../themed";
import { RichNoteText } from "../rich-note";

interface NoteTextProps {
  title?: string;
  content: string;
}

export const NoteText = ({ title, content }: NoteTextProps) => {
  const themeColor = useCurrentThemeColor();
  return (
    <View style={[styles.container, { backgroundColor: themeColor.itemColor }]}>
      {title && <Text style={styles.title}>{title}</Text>}
      {!!content && <RichNoteText html={content} size={12} />}
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
});
