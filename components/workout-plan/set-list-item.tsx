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

export const SetListItem = ({ item, planId, setIndex, hideProgress }: SetListItemProps) => {
  const { setCompleteProgress } = useWorkoutPlanStore();
  const themeColor = useCurrentThemeColor();
  const t = useT();
  const lang = useLanguage();

  return (
    <View style={[styles.container, { backgroundColor: themeColor.itemColor }]}>
      <View
        style={[
          styles.ballContainer,
          { backgroundColor: themeColor.itemColor },
        ]}
      >
        <NumberBallIcon>{setIndex}</NumberBallIcon>
      </View>
      <View
        style={[
          styles.setCounter,
          {
            backgroundColor: themeColor.itemColor,
            borderBottomColor: themeColor.subText,
          },
        ]}
      >
        <View
          style={[
            styles.setCounterContainer,
            { backgroundColor: themeColor.itemColor },
          ]}
        >
          <Text style={[styles.setType, { color: themeColor.tint }]}>
            {tSetType(item.set, lang)}
          </Text>
          <Text
            style={[styles.count, { color: themeColor.text }]}
          >{t("common.reps", { n: item.count })}</Text>
        </View>
        {!hideProgress && (
          <Text
            style={[
              styles.progressText,
              { color: themeColor.subText },
              item.progress === "완료" && {
                color: themeColor.tint,
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
                color={themeColor.tint}
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
              <Text style={styles.buttonText}>{tProgress("완료", lang)}</Text>
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
    // gap: 8,
    // borderWidth: 1,
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
    borderBottomWidth: 1,
    // gap: 2,
    flex: 1,
    marginLeft: 6,
    marginRight: 6,
    justifyContent: "center",
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
