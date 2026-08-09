import React, { useEffect, useRef, useState } from "react";
// component
import { Pressable, StyleSheet, Image } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { Text, View } from "../themed";
import { NoteText } from "./note-text";
import { SetListItem } from "./set-list-item";
// icon
import { ConditionTag } from "../add-plan/condition-icon";
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
  planId: number;
  completed: number;
  total: number;
  tintColor: string;
  bgColor: string;
  textColor: string;
}

// shared value·mapper가 셀마다 하나씩 생긴다. 예전엔 빠른 스크롤에서 셀이
// 마운트/언마운트되며 이게 초당 수십 번 만들어졌다 버려져 화면이 비어 보였지만,
// 지금은 FlashList가 종류별로 셀을 재활용해(getItemType) 프롭만 갈아끼우므로
// 보이는 셀 수만큼만 한 번 만들어진다 — 채움 애니메이션을 되살릴 수 있다.
const ProgressBar = ({
  planId,
  completed,
  total,
  tintColor,
  bgColor,
  textColor,
}: ProgressBarProps) => {
  const t = useT();
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  const progress = useSharedValue(pct);
  const prevPlanId = useRef(planId);

  useEffect(() => {
    // 재활용된 셀은 이전 계획의 값을 그대로 들고 있다 — 애니메이션하면 스크롤 도중
    // 남의 퍼센트에서 쓸고 지나간다. 계획이 바뀐 경우엔 즉시 맞춘다.
    if (prevPlanId.current !== planId) {
      prevPlanId.current = planId;
      progress.value = pct;
      return;
    }
    progress.value = withTiming(pct, {
      duration: 800,
      easing: Easing.out(Easing.cubic),
    });
  }, [pct, planId, progress]);

  const fillStyle = useAnimatedStyle(() => ({ width: `${progress.value}%` }));

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
        <Animated.View
          style={[
            {
              height: "100%",
              borderRadius: 3,
              backgroundColor: tintColor,
            },
            fillStyle,
          ]}
        />
      </View>
    </View>
  );
};

// 가로/세로 간격을 같게 하려면 칸 폭을 퍼센트가 아니라 실제 폭에서 gap을 뺀 px로 잡아야 한다
const IMAGE_GAP = 8;

interface PlanImagesProps {
  imageUri: WorkoutPlanTypes["imageUri"];
  bgColor: string;
  subTextColor: string;
}

// 권한 조회와 이미지 스토어 구독을 "사진이 있는 계획"에만 둔다 — 리스트 셀마다
// 네이티브 권한을 조회하면 빠른 스크롤에서 셀 마운트가 프레임 예산을 넘겨 빈 칸이 보인다
const PlanImages = ({ imageUri, bgColor, subTextColor }: PlanImagesProps) => {
  const t = useT();
  // 영속 플래그 대신 실시간 권한 상태를 본다 — 설정에서 권한을 바꿔도 바로 반영된다
  const [mediaPermission, requestMediaPermission] =
    MediaLibrary.usePermissions();
  const { setImageUri } = useImageUriStore();
  const [gridWidth, setGridWidth] = useState(0);

  // 앱 소유 사진(media/)은 권한 없이도 보이고, 구 데이터(사진첩 참조)만 권한이 필요하다
  const hasMediaPermission =
    (mediaPermission?.granted ?? false) ||
    !imageUri.some((image) => !isAppOwnedMedia(image.imageUri));

  if (!hasMediaPermission) {
    return (
      <Pressable onPress={() => requestMediaPermission()}>
        <Text style={{ color: subTextColor, fontFamily: "sb-l" }}>
          {t("workout.galleryPermission")}
        </Text>
      </Pressable>
    );
  }

  return (
    <View
      style={[styles.imageList, { backgroundColor: bgColor, marginTop: 4 }]}
      onLayout={(e) => setGridWidth(e.nativeEvent.layout.width)}
    >
      {imageUri.map((imageItem) => (
        <Pressable
          key={imageItem.id}
          style={[
            {
              width:
                imageUri.length === 1 || !gridWidth
                  ? "100%"
                  : (gridWidth - IMAGE_GAP) / 2,
            },
            { backgroundColor: bgColor },
          ]}
          onPress={() =>
            setImageUri(resolveMediaUri(imageItem.imageUri) as string)
          }
        >
          <Image
            source={{ uri: resolveMediaUri(imageItem.imageUri) }}
            style={[styles.image, { borderColor: bgColor }]}
          />
        </Pressable>
      ))}
    </View>
  );
};

interface WorkoutPlanProps {
  item: WorkoutPlanTypes;
  index: number;
  totalLength: number;
  hideProgress?: boolean;
  hideMenu?: boolean;
}

// 완료 토글 시 전체 리스트가 리렌더되지 않도록 메모 — 참조가 유지된 플랜은 스킵한다
export const WorkoutPlan = React.memo(function WorkoutPlan({
  item,
  index,
  totalLength,
  hideProgress,
  hideMenu,
}: WorkoutPlanProps) {
  const themeColor = useCurrentThemeColor();

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
          hideMenu={hideMenu}
        />
        {/* 컨디션 */}
        {item.condition.length > 0 && (
          <View
            style={[
              styles.conditionTagList,
              { backgroundColor: themeColor.itemColor },
            ]}
          >
            {item.condition.map((condition, index) => (
              <ConditionTag key={index} condition={condition} />
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
                planId={item.id}
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
        {item.imageUri?.length > 0 && (
          <PlanImages
            imageUri={item.imageUri}
            bgColor={themeColor.itemColor}
            subTextColor={themeColor.subText}
          />
        )}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    // paddingHorizontal: 24,
    paddingTop: 8,
    paddingHorizontal: 16,
    overflow: "hidden",
    gap: 14,
    flexDirection: "row",
    alignItems: "flex-start",
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
