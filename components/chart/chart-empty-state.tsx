import React from "react";
import { StyleSheet } from "react-native";
import { Text, View } from "../Themed";
import InfoIcon from "@expo/vector-icons/FontAwesome6";
import { ThemeColorType } from "@/constants/Colors";

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
      <InfoIcon name="circle-info" size={16} color={themeColor.subText} />
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
