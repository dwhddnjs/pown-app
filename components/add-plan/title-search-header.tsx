import React from "react";
//components
import { StyleSheet, TouchableOpacity } from "react-native";
// color
import useCurrentThemeColor from "@/hooks/use-current-theme-color";
import { useT } from "@/hooks/use-t";
import { EMOJI_LINE_TOP } from "@/constants/text-metrics";
// icon
import { FontAwesome } from "@expo/vector-icons";
import { Text, View } from "../themed";

interface TitleSearchHeaderProps {
  onPress: () => void;
}

export const TitleSearchHeader = ({ onPress }: TitleSearchHeaderProps) => {
  const themeColor = useCurrentThemeColor();
  const t = useT();

  return (
    <View style={styles.header}>
      <Text style={[styles.title, { paddingTop: EMOJI_LINE_TOP.formTitle }]}>
        {t("plan.whichWorkout")}
      </Text>
      <TouchableOpacity onPress={onPress} style={{ padding: 8 }}>
        <FontAwesome
          name="search"
          size={20}
          color={themeColor.text}
          // 이 줄 높이가 제목 행 높이를 정한다 — 안드로이드 기본 글꼴 여백이면 iOS(36)보다 0.6 길다
          style={styles.searchIcon}
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    paddingHorizontal: 20,
    justifyContent: "space-between",
    alignItems: "center",
  },

  searchIcon: {
    includeFontPadding: false,
  },

  title: {
    // 제목이 길어도 검색 아이콘을 화면 밖으로 밀지 않게 제목 쪽이 먼저 줄어든다
    flexShrink: 1,
    fontSize: 24,
  },
});
