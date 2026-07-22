import React, { useEffect, useState } from "react";
// component
import { Pressable, StyleSheet, Image } from "react-native";
import { Text, View } from "../themed";
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
import { useT } from "@/hooks/use-t";
// expo
import * as MediaLibrary from "expo-media-library";
import { useImageUriStore } from "@/hooks/use-image-uri-store";
import { isAppOwnedMedia, resolveMediaUri } from "@/lib/media";

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
  const t = useT();
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
          {t("workout.setsDone", { completed, total })}
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

// 가로/세로 간격을 같게 하려면 칸 폭을 퍼센트가 아니라 실제 폭에서 gap을 뺀 px로 잡아야 한다
const IMAGE_GAP = 8;

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
  const t = useT();
  // 영속 플래그 대신 실시간 권한 상태를 본다 — 설정에서 권한을 바꿔도 바로 반영된다
  const [mediaPermission, requestMediaPermission] =
    MediaLibrary.usePermissions();
  // 앱 소유 사진(media/)은 권한 없이도 보이고, 구 데이터(사진첩 참조)만 권한이 필요하다
  const hasMediaPermission =
    (mediaPermission?.granted ?? false) ||
    !item.imageUri?.some((image) => !isAppOwnedMedia(image.imageUri));
  const { setImageUri } = useImageUriStore();
  const [gridWidth, setGridWidth] = useState(0);

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
              width: 1,
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
        {item.imageUri?.length > 0 && !hasMediaPermission && (
          <Pressable onPress={() => requestMediaPermission()}>
            <Text style={{ color: themeColor.subText, fontFamily: "sb-l" }}>
              {t("workout.galleryPermission")}
            </Text>
          </Pressable>
        )}
        {hasMediaPermission && item.imageUri?.length > 0 && (
          <View
            style={[
              styles.imageList,
              {
                backgroundColor: themeColor.itemColor,
                marginTop: 4,
              },
            ]}
            onLayout={(e) => setGridWidth(e.nativeEvent.layout.width)}
          >
            {item.imageUri.map((imageItem) => {
              return (
                <Pressable
                  key={imageItem.id}
                  style={[
                    {
                      width:
                        item.imageUri.length === 1 || !gridWidth
                          ? "100%"
                          : (gridWidth - IMAGE_GAP) / 2,
                    },
                    { backgroundColor: themeColor.itemColor },
                  ]}
                  onPress={() =>
                    setImageUri(resolveMediaUri(imageItem.imageUri) as string)
                  }
                >
                  <Image
                    key={imageItem.id}
                    source={{ uri: resolveMediaUri(imageItem.imageUri) }}
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
    flexWrap: "wrap",
    gap: IMAGE_GAP,
  },
  image: {
    aspectRatio: 1,
    borderRadius: 18,
    borderCurve: "continuous",
    borderWidth: 1,
  },
});
