import React from "react";
// component
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
// expo
import { BlurView } from "expo-blur";
// hook
import useCurrentThemeColor from "@/hooks/use-current-theme-color";
import { useChartStore } from "@/hooks/use-chart-store";
import { convertChartDate } from "@/lib/function";
// icon
import AntDesign from "@expo/vector-icons/AntDesign";

export const ChartHeader = () => {
  const themeColor = useCurrentThemeColor();
  const { date, setDate } = useChartStore();

  const onClickDate = (type: "prev" | "next") => {
    setDate(type);
  };

  return (
    <BlurView intensity={80} tint="default" style={styles.blur}>
      <SafeAreaView edges={["top"]}>
        <View style={styles.container}>
          <TouchableOpacity
            style={[styles.button, { paddingLeft: 12 }]}
            onPress={() => onClickDate("prev")}
          >
            <AntDesign name="leftcircleo" size={28} color={themeColor.tint} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: themeColor.text }]}>
            {convertChartDate(date)}
          </Text>
          <TouchableOpacity
            style={[styles.button, { paddingRight: 12 }]}
            onPress={() => {
              onClickDate("next");
            }}
          >
            <AntDesign name="rightcircleo" size={28} color={themeColor.tint} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </BlurView>
  );
};


const styles = StyleSheet.create({
  blur: {
    width: "100%",
    paddingBottom: 6,
    alignItems: "center",
  },
  container: {
    backgroundColor: "transparent",
    gap: 32,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  button: {
    paddingVertical: 8,
  },
  title: {
    fontSize: 18,
    textAlign: "center",
    fontFamily: "sb-m",
  },
});
