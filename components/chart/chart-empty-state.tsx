import React from "react";
import { StyleSheet } from "react-native";
import { Text, View } from "../themed";
import InfoIcon from "@expo/vector-icons/FontAwesome6";
import { ThemeColorType } from "@/constants/colors";
import { iconLine } from "@/constants/text-metrics";

interface ChartEmptyStateProps {
  message: string;
  themeColor: ThemeColorType;
}

export const ChartEmptyState = ({
  message,
  themeColor,
}: ChartEmptyStateProps) => {
  return (
    <View style={[styles.container, { backgroundColor: themeColor.itemColor }]}>
      <InfoIcon
        name="circle-info"
        size={16}
        color={themeColor.subText}
        // FontAwesome6 줄 높이(ascent+descent)는 크기의 1.043배
        style={iconLine(16, 1.043)}
      />
      <Text style={{ color: themeColor.subText }}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    paddingVertical: 12,
    paddingHorizontal: 4,
    gap: 6,
  },
});
