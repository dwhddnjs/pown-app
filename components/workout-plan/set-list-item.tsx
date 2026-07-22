import { StyleSheet, TouchableOpacity } from "react-native";
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

export const SetListItem = ({
  item,
  planId,
  setIndex,
  hideProgress,
}: SetListItemProps) => {
  const { setCompleteProgress } = useWorkoutPlanStore();
  const themeColor = useCurrentThemeColor();
  const t = useT();
  const lang = useLanguage();

  return (
    <View
      style={[
        styles.container,
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
      {!hideProgress && (
        <View
          style={[
            styles.buttonContainer,
            { backgroundColor: themeColor.itemColor },
          ]}
        >
          {item.progress === "완료" ? (
            <TouchableOpacity
              style={[
                styles.completedIcon,
                { backgroundColor: themeColor.itemColor },
              ]}
              onPress={() => setCompleteProgress(planId, item.id)}
            >
              <CheckCircle
                name="checkcircleo"
                size={24}
                color={themeColor.tintText}
              />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[
                styles.button,
                {
                  backgroundColor: themeColor.subText,
                  borderRadius: 8,
                },
              ]}
              onPress={() => setCompleteProgress(planId, item.id)}
            >
              {/* subText 배경 위 기본 텍스트색은 2.2:1 — itemColor로 반전해야 AA를 넘는다 */}
              <Text
                style={[styles.buttonText, { color: themeColor.itemColor }]}
              >
                {tProgress("완료", lang)}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    // 구분선을 행 전체에 걸어야 완료 여부(버튼 폭 변화)와 무관하게 길이가 일정하다
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
    paddingHorizontal: 10,
  },

  buttonText: {
    fontSize: 12,
  },
  completedIcon: {
    justifyContent: "center",

    paddingHorizontal: 10,
  },
});
