import React from "react";
// component
import { StyleSheet, TouchableOpacity } from "react-native";
import { Text, View } from "@/components/themed";
// hooks
import useCurrentThemeColor from "@/hooks/use-current-theme-color";
import { useT } from "@/hooks/use-t";
// icon
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";

// 뒤따르는 빈 슬롯 — 운동 탭의 empty(넓은 점선 카드 한 장)와 구분하려고
// "여러 개를 순서대로 쌓는 화면"이라는 걸 이어지는 타임라인으로 보여준다
const GHOST_OPACITY = [0.5, 0.28];
// 슬롯 사이 간격 — 세로선을 이만큼 위로 늘려 끊긴 구간을 잇는다
const GHOST_GAP = 10;

export const EmptyRoutine = ({ onPress }: { onPress: () => void }) => {
  const t = useT();
  const themeColor = useCurrentThemeColor();

  return (
    <View style={styles.container}>
      <TouchableOpacity
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={t("routine.addWorkout")}
        onPress={onPress}
        style={[styles.card, { borderColor: themeColor.subText }]}
      >
        <View style={[styles.iconCircle, { borderColor: themeColor.subText }]}>
          <FontAwesome6 name="plus" size={14} color={themeColor.subText} />
        </View>
        <Text style={[styles.title, { color: themeColor.subText }]}>
          {t("routine.addWorkout")}
        </Text>
      </TouchableOpacity>
      {GHOST_OPACITY.map((opacity, index) => (
        <View key={index} style={[styles.ghostRow, { opacity }]}>
          <View style={styles.rail}>
            {/* 마지막 줄의 선은 점에서 끊는다 — 더 이어질 게 없다는 뜻 */}
            <View
              style={[
                styles.railLine,
                { backgroundColor: themeColor.subText },
                index === GHOST_OPACITY.length - 1 && styles.railLineLast,
              ]}
            />
            <View style={[styles.dot, { backgroundColor: themeColor.subText }]} />
          </View>
          <View style={[styles.slot, { borderColor: themeColor.subText }]} />
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    gap: GHOST_GAP,
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
  ghostRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  rail: {
    width: 18,
    alignSelf: "stretch",
    alignItems: "center",
    justifyContent: "center",
  },
  railLine: {
    position: "absolute",
    // 위로 간격만큼 넘겨 앞 줄(= 첫 줄은 추가 카드)과 선이 끊기지 않게 한다
    top: -GHOST_GAP,
    bottom: 0,
    width: 1.5,
  },
  railLineLast: {
    bottom: "50%",
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  slot: {
    flex: 1,
    marginLeft: 8,
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderRadius: 12,
    height: 52,
  },
});
