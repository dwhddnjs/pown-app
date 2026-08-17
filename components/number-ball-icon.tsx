import { StyleSheet } from "react-native";
import React from "react";
import { Text, View } from "./themed";
import useCurrentThemeColor from "@/hooks/use-current-theme-color";

export const NumberBallIcon = ({ children }: { children: React.ReactNode }) => {
  const themeColor = useCurrentThemeColor();
  return (
    <View style={[styles.container, { borderColor: themeColor.tint }]}>
      <Text style={[styles.text, { color: themeColor.text }]}>{children}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 50,
    width: 20,
    height: 20,
    borderWidth: 1.5,
    backgroundColor: "transparent",
    justifyContent: "center",
    alignItems: "center",
  },

  text: {
    marginTop: 2,
    fontFamily: "sb-m",
    textAlign: "center",
    fontSize: 10,
  },
});
