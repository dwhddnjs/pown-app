import { StyleSheet, TouchableOpacity } from "react-native";
import React from "react";
import { Text, View } from "../themed";
import useCurrentThemeColor from "@/hooks/use-current-theme-color";
// navigation
import { useHeaderHeight } from "@react-navigation/elements";
// expo
import { useRouter } from "expo-router";
// icon
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";

export const EmptyList = () => {
  const themeColor = useCurrentThemeColor();
  const headerHeight = useHeaderHeight();
  const router = useRouter();

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: headerHeight + 24,
          backgroundColor: themeColor.background,
        },
      ]}
    >
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => router.push("/(modals)/select-type")}
        style={[styles.card, { borderColor: themeColor.subText }]}
      >
        <View style={[styles.iconCircle, { borderColor: themeColor.subText }]}>
          <FontAwesome6 name="plus" size={14} color={themeColor.subText} />
        </View>
        <Text style={[styles.title, { color: themeColor.subText }]}>
          운동계획 추가
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  card: {
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderRadius: 12,
    paddingVertical: 22,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
  },
  iconCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1.5,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 15,
    fontFamily: "sb-l",
  },
});
