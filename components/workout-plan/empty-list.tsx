import { StyleSheet, TouchableOpacity } from "react-native";
import { useT } from "@/hooks/use-t";
import React from "react";
import { Text, View } from "../themed";
import { DashedBorder } from "@/components/dashed-border";
import useCurrentThemeColor from "@/hooks/use-current-theme-color";
// navigation
import { useHeaderHeight } from "@react-navigation/elements";
// expo
import { useRouter } from "expo-router";
// icon
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";

export const EmptyList = () => {
  const t = useT();
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
        style={styles.card}
      >
        <DashedBorder color={themeColor.subText} />
        <View style={[styles.iconCircle, { borderColor: themeColor.subText }]}>
          <FontAwesome6 name="plus" size={14} color={themeColor.subText} />
        </View>
        <Text style={[styles.title, { color: themeColor.subText }]}>
          {t("workout.addPlan")}
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
  // 점선은 DashedBorder가 그린다 — 예전 테두리 굵기(1.5)만큼 패딩에 더해 높이를 지킨다
  card: {
    borderRadius: 12,
    borderCurve: "continuous",
    paddingVertical: 23.5,
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
