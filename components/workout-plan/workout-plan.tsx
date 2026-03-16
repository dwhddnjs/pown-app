import React, { useCallback, useEffect, useState } from "react";
// component
import { Pressable, StyleSheet, TouchableOpacity, Image } from "react-native";
import { Text, View } from "../Themed";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { NoteText } from "./note-text";
import { SetListItem } from "./set-list-item";
// icon
import { ConditionIcon } from "../add-plan/condition-icon";
import { WeightDate } from "./weight-date";
import Back from "@/assets/images/svg/back_icon.svg";
import Arm from "@/assets/images/svg/arm_icon.svg";
import Chest from "@/assets/images/svg/chest_icon.svg";
import Leg from "@/assets/images/svg/leg_icon.svg";
import Shoulder from "@/assets/images/svg/shoulder_icon.svg";
// zustand
import { WorkoutPlanTypes } from "@/hooks/use-workout-plan-store";
import useCurrentThemeColor from "@/hooks/use-current-theme-color";
// expo
import { useUserStore } from "@/hooks/use-user-store";
import { useImageUriStore } from "@/hooks/use-image-uri-store";
// import { Image } from "expo-image"

interface ProgressBarProps {
  completed: number;
  total: number;
  tintColor: string;
  bgColor: string;
  textColor: string;
}

const ProgressBar = ({
  completed,
  total,
  tintColor,
  bgColor,
  textColor,
}: ProgressBarProps) => {
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
  const progress = useSharedValue(pct);

  useEffect(() => {
    progress.value = withTiming(pct, {
      duration: 800,
      easing: Easing.out(Easing.cubic),
    });
  }, [pct]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${progress.value}%`,
    height: "100%",
    borderRadius: 3,
    backgroundColor: tintColor,
  }));

  return (
    <View style={{ gap: 4, backgroundColor: "transparent" }}>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          backgroundColor: "transparent",
        }}
      >
        <Text style={{ fontSize: 11, fontFamily: "sb-l", color: textColor }}>
          {completed}/{total} 세트 완료
        </Text>
        <Text
          style={{
            fontSize: 11,
            fontFamily: "sb-m",
            color: pct === 100 ? tintColor : textColor,
          }}
        >
          {pct}%
        </Text>
      </View>
      <View
        style={{
          height: 6,
          borderRadius: 3,
          backgroundColor: bgColor,
          overflow: "hidden",
        }}
      >
        <Animated.View style={animatedStyle} />
      </View>
    </View>
  );
};

interface WorkoutPlanProps {
  item: WorkoutPlanTypes;
  index: number;
  totalLength: number;
  hideProgress?: boolean;
}

export const WorkoutPlan = ({
  item,
  index,
  totalLength,
  hideProgress,
}: WorkoutPlanProps) => {
  const themeColor = useCurrentThemeColor();
  const { mediaLibrary } = useUserStore();
  const { setImageUri } = useImageUriStore();

  const getWorkoutIcon = (type: string) => {
    let result;
    switch (type) {
      case "chest":
        result = <Chest />;
        break;
      case "back":
        result = <Back />;
        break;
      case "leg":
        result = <Leg />;
        break;
      case "arm":
        result = <Arm />;
        break;
      default:
        result = <Shoulder />;
        break;
    }

    return result;
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: themeColor.itemColor },
        index === 0 && { paddingTop: 18 },
        index === totalLength - 1 && { paddingBottom: 18 },
      ]}
    >
      <View
        style={[
          styles.iconLine,
          {
            backgroundColor: themeColor.itemColor,
          },
        ]}
      >
        {getWorkoutIcon(item.type)}
        {index !== totalLength - 1 && (
          <View
            style={{
              width: 2,
              height: 16,
              flex: 1,
              backgroundColor: themeColor.subText,
            }}
          />
        )}
      </View>
      <View
        style={[
          styles.workoutContainer,
          {
            paddingBottom: 12,
            backgroundColor: themeColor.itemColor,
          },
        ]}
      >
        <WeightDate
          id={item.id}
          equipment={item.equipment}
          workout={item.workout}
          weight={item.weight}
          date={item.createdAt as string}
          type={item.type}
        />
        {/* 컨디션 */}
        {item.condition.length > 0 && (
          <View
            style={[
              styles.conditionTagList,
              { backgroundColor: themeColor.itemColor },
            ]}
          >
            {item.condition.map((item, index) => (
              <ConditionIcon
                key={index}
                item={{ id: index + 1, condition: item }}
                type="row"
              />
            ))}
          </View>
        )}
        {/* 노트 */}
        {item.content && <NoteText title={item.title} content={item.content} />}

        {/* 세트와 횟수 + 완료율 */}
        {item.setWithCount.length > 0 && (
          <View
            style={{
              backgroundColor: themeColor.itemColor,
              gap: 14,
            }}
          >
            {!hideProgress && (
              <ProgressBar
                completed={
                  item.setWithCount.filter((s) => s.progress === "완료").length
                }
                total={item.setWithCount.length}
                tintColor={themeColor.tint}
                bgColor={themeColor.empty}
                textColor={themeColor.subText}
              />
            )}
            {item.setWithCount.map((setCount, index) => (
              <SetListItem
                key={setCount.id}
                planId={item.id}
                item={setCount}
                setIndex={index + 1}
                hideProgress={hideProgress}
              />
            ))}
          </View>
        )}
        {item.imageUri?.length > 0 && !mediaLibrary && (
          <Text style={{ color: themeColor.subText, fontFamily: "sb-l" }}>
            갤러리 접근권한이 필요합니다.
          </Text>
        )}
        {mediaLibrary && item.imageUri?.length > 0 && (
          <View
            style={[
              styles.imageList,
              {
                backgroundColor: themeColor.itemColor,
                marginTop: 12,
              },
            ]}
          >
            {item.imageUri.map((imageItem) => {
              return (
                <Pressable
                  key={imageItem.id}
                  style={{ flex: 4, backgroundColor: themeColor.itemColor }}
                  onPress={() => setImageUri(imageItem.imageUri as string)}
                >
                  <Image
                    key={imageItem.id}
                    source={{ uri: imageItem.imageUri }}
                    style={[
                      styles.image,
                      {
                        borderColor: themeColor.itemColor,
                      },
                    ]}
                  />
                </Pressable>
              );
            })}
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // paddingHorizontal: 24,
    paddingTop: 8,
    paddingHorizontal: 16,
    overflow: "hidden",
    gap: 14,
    flexDirection: "row",
    alignItems: "flex-start",
    // borderWidth: 1,
    flex: 1,
  },
  iconLine: {
    // justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  workoutContainer: {
    flex: 1,
    gap: 14,
  },

  conditionTagList: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  imageList: {
    flexDirection: "row",
    gap: 6,
    flexWrap: "nowrap",
  },
  image: {
    aspectRatio: 1,
    borderRadius: 14,
    borderWidth: 1,
  },
});
