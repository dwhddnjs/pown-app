import React from "react";
// component
import {
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
} from "react-native";
import { Text, View } from "../themed";
// hooks
import { useT } from "@/hooks/use-t";
import useCurrentThemeColor from "@/hooks/use-current-theme-color";
import { useHeaderHeight } from "@react-navigation/elements";
// expo
import { useRouter } from "expo-router";
// icon
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";

export const EmptyVideos = () => {
  const t = useT();
  const themeColor = useCurrentThemeColor();
  const headerHeight = useHeaderHeight();
  const { width } = useWindowDimensions();
  const router = useRouter();

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: headerHeight + 12,
          backgroundColor: themeColor.background,
        },
      ]}
    >
      {/* 그리드 첫 칸을 흉내 낸 타일 — 비율(9:16)만 같고, 점선이 화면 가장자리에
          붙지 않게 좌우 여백만큼 좁다. 정확히 같은 자리는 아니다. */}
      <TouchableOpacity
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={t("shorts.addShorts")}
        onPress={() => router.push("/shorts/video")}
        style={[
          styles.card,
          { width: width / 3 - 12, borderColor: themeColor.subText },
        ]}
      >
        <View style={[styles.iconCircle, { borderColor: themeColor.subText }]}>
          <FontAwesome6 name="plus" size={14} color={themeColor.subText} />
        </View>
        <Text style={[styles.title, { color: themeColor.subText }]}>
          {t("shorts.addShorts")}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 12,
  },
  card: {
    aspectRatio: 9 / 16,
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderRadius: 12,
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
    fontSize: 13,
    fontFamily: "sb-l",
    textAlign: "center",
  },
});
