import { Pressable, StyleSheet } from "react-native";
import React from "react";
import { Text, View } from "../themed";
import { NumberBallIcon } from "../number-ball-icon";
import { SetWithCountType } from "@/hooks/use-plan-store";
import { useWorkoutPlanStore } from "@/hooks/use-workout-plan-store";
import CheckCircle from "@expo/vector-icons/AntDesign";
import useCurrentThemeColor from "@/hooks/use-current-theme-color";
import { useLanguage } from "@/hooks/use-user-store";
import { tProgress, tSetType } from "@/lib/i18n";
import { useT } from "@/hooks/use-t";

interface SetListItemProps {
  item: SetWithCountType;
  planId: number;
  setIndex: number;
  hideProgress?: boolean;
}

// 계획 하나에 세트가 5개씩 달리고 화면에는 계획이 수십 개 올라간다 — 빠른 스크롤에서
// 이 컴포넌트의 마운트 비용이 그대로 화면이 비는 시간이 된다. 스토어는 액션 하나만
// 골라 구독하고(전체 구독이면 기록이 바뀔 때마다 전부 리렌더), memo로 감싼다.
export const SetListItem = React.memo(function SetListItem({
  item,
  planId,
  setIndex,
  hideProgress,
}: SetListItemProps) {
  const setCompleteProgress = useWorkoutPlanStore(
    (state) => state.setCompleteProgress,
  );
  const themeColor = useCurrentThemeColor();
  const t = useT();
  const lang = useLanguage();

  return (
    <View style={[styles.container, { backgroundColor: themeColor.itemColor }]}>
      {/* 구분선은 완료 버튼 전까지만 — 버튼 아래는 선이 없다 */}
      <View
        style={[
          styles.leftGroup,
          {
            backgroundColor: themeColor.itemColor,
            borderBottomColor: themeColor.divider,
          },
        ]}
      >
        <View
          style={[
            styles.ballContainer,
            { backgroundColor: themeColor.itemColor },
          ]}
        >
          <NumberBallIcon>{setIndex}</NumberBallIcon>
        </View>
        <View
          style={[styles.setCounter, { backgroundColor: themeColor.itemColor }]}
        >
        <View
          style={[
            styles.setCounterContainer,
            { backgroundColor: themeColor.itemColor },
          ]}
        >
          <Text style={[styles.setType, { color: themeColor.tintText }]}>
            {tSetType(item.set, lang)}
          </Text>
          <Text style={[styles.count, { color: themeColor.text }]}>
            {t("common.reps", { n: item.count })}
          </Text>
        </View>
        {!hideProgress && (
          <Text
            style={[
              styles.progressText,
              { color: themeColor.subText },
              item.progress === "완료" && {
                color: themeColor.tintText,
              },
            ]}
          >
            {tProgress(item.progress, lang)}
          </Text>
        )}
        </View>
      </View>
      {!hideProgress && (
        <View
          style={[
            styles.buttonContainer,
            { backgroundColor: themeColor.itemColor },
          ]}
        >
          {/* 원래 TouchableOpacity였지만 activeOpacity={1}이라 페이드가 없었다 —
              Animated.Value를 세트마다 하나씩 만들 이유가 없어 Pressable로 바꿨다 */}
          {item.progress === "완료" ? (
            <Pressable
              style={[
                styles.completedIcon,
                { backgroundColor: themeColor.itemColor },
              ]}
              onPress={() => setCompleteProgress(planId, item.id)}
            >
              <CheckCircle
                name="checkcircle"
                size={28}
                color={themeColor.tint}
              />
            </Pressable>
          ) : (
            <Pressable
              style={[styles.button, { backgroundColor: themeColor.tint }]}
              onPress={() => setCompleteProgress(planId, item.id)}
            >
              {/* tint로 채운 면 위 글자는 onTint(양 테마 7:1↑) — 흰색은 대비 미달 */}
              <Text style={[styles.buttonText, { color: themeColor.onTint }]}>
                {tProgress("완료", lang)}
              </Text>
            </Pressable>
          )}
        </View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    // 구분선(leftGroup)과 완료 버튼 사이 간격
    gap: 8,
  },
  // 구분선은 이 그룹(넘버볼+세트정보)에만 — 완료 버튼 아래로는 이어지지 않는다
  leftGroup: {
    flex: 1,
    flexDirection: "row",
    borderBottomWidth: 1,
  },
  ballContainer: { paddingTop: 2 },
  progressText: {
    fontFamily: "sb-l",
    fontSize: 10,
  },

  setCounterContainer: {
    flexDirection: "row",

    alignItems: "center",
    gap: 4,
  },

  setCounter: {
    flexDirection: "column",
    flex: 1,
    marginLeft: 6,
    marginRight: 6,
    justifyContent: "center",
    paddingVertical: 4,
  },
  setType: {},
  count: {
    fontFamily: "sb-l",
    fontSize: 12,
  },
  buttonContainer: {
    flexDirection: "row",
  },
  button: {
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 14,
    // 앱 전반의 알약 모양(세트 아이템·넘버볼)과 통일
    borderRadius: 50,
  },
  buttonText: {
    fontFamily: "sb-m",
    fontSize: 12,
  },
  completedIcon: {
    justifyContent: "center",
    paddingHorizontal: 10,
  },
});
