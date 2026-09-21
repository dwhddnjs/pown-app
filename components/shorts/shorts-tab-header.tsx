import React, { createRef } from "react";
import { useT } from "@/hooks/use-t";
// component
import { SafeAreaView, StyleSheet, TouchableOpacity, View } from "react-native";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
// hook
import useCurrentThemeColor from "@/hooks/use-current-theme-color";
// expo
import { BlurView } from "expo-blur";
import { Text } from "../themed";
// icon
import Feather from "@expo/vector-icons/Feather";

// 헤더는 탭 네비게이터가 그려서 화면 안의 ref에 닿지 못한다. 시트 자체는 헤더 높이에
// 잘리므로 화면(app/(drawer)/(tabs)/shorts.tsx)에 마운트하고, 여는 손잡이만 공유한다.
export const shortsGuideRef = createRef<BottomSheetModal>();

const ShortsTabHeader = () => {
  const t = useT();
  const themeColor = useCurrentThemeColor();

  return (
    <BlurView intensity={80} tint="default" style={styles.blur}>
      <SafeAreaView>
        <View style={styles.container}>
          <Text style={{ fontSize: 16 }}>{t("shorts.title")}</Text>
          {/* 타이틀이 가운데 정렬이라 흐름에 넣으면 밀린다 — 오른쪽에 띄운다 */}
          <TouchableOpacity
            style={styles.guide}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel={t("ai.guideOpen")}
            onPress={() => shortsGuideRef.current?.present()}
          >
            <Feather name="info" size={24} color={themeColor.text} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </BlurView>
  );
};

export default ShortsTabHeader;

const styles = StyleSheet.create({
  // alignItems:"center"를 주면 SafeAreaView가 콘텐츠 폭으로 쪼그라들어
  // 안쪽 width:"100%"가 화면 폭이 아니게 된다 — 타이틀이 중앙에서 밀리던 원인
  blur: {
    width: "100%",
    paddingBottom: 6,
  },
  container: {
    backgroundColor: "transparent",
    width: "100%",
    paddingVertical: 8,
    paddingHorizontal: 8,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  guide: {
    position: "absolute",
    right: 16,
  },
});
