import React, { useState } from "react";
// component
import {
  Pressable,
  StyleSheet,
  Image,
  View as RNView,
  type ImageSourcePropType,
} from "react-native";
import { Text, View } from "../themed";
import { NoteText } from "./note-text";
import { SetListItem } from "./set-list-item";
// icon
import { ConditionTag } from "./condition-tag";
import { WeightDate } from "./weight-date";

// zustand
import { WorkoutPlanTypes } from "@/hooks/use-workout-plan-store";
import useCurrentThemeColor from "@/hooks/use-current-theme-color";
import { useT } from "@/hooks/use-t";
// expo
import * as MediaLibrary from "expo-media-library";
import { useImageUriStore } from "@/hooks/use-image-uri-store";
import { isAppOwnedMedia, resolveMediaUri } from "@/lib/media";

// 이 화면만 SVG 대신 PNG를 쓴다. 원래 svg는 벡터가 아니라 <pattern> 안에
// base64 래스터(96x96)를 품고 있었고, react-native-svg는 그걸 **셀 인스턴스마다**
// 파싱·디코드한다 — 빠른 플릭에서 30칸을 한꺼번에 갈아끼울 때 가장 비쌌던 항목.
// PNG는 같은 96x96 원본을 그대로 꺼낸 것이라 화질 변화가 없고, RN 이미지 캐시가
// 디코드한 비트맵을 소스별로 한 번만 유지한다(30셀 → 디코드 5회).
// 스크롤하지 않는 화면(select-type·calendar-grid 등)은 계속 svg를 쓴다.
const WORKOUT_ICON_SIZE = 54;
const WORKOUT_ICON: Record<
  string,
  { src: ImageSourcePropType; circle: string }
> = {
  chest: {
    src: require("@/assets/images/icons/chest_icon.png"),
    circle: "#ffc134",
  },
  back: {
    src: require("@/assets/images/icons/back_icon.png"),
    circle: "#F13C33",
  },
  leg: {
    src: require("@/assets/images/icons/leg_icon.png"),
    circle: "#3A76E2",
  },
  arm: {
    src: require("@/assets/images/icons/arm_icon.png"),
    circle: "#9A48C1",
  },
  shoulder: {
    src: require("@/assets/images/icons/shoulder_icon.png"),
    circle: "#3CC42E",
  },
};
interface ProgressBarProps {
  completed: number;
  total: number;
  tintColor: string;
  bgColor: string;
  textColor: string;
}

// 예전엔 막대를 Reanimated로 채웠다. 셀 하나마다 shared value와 UI 스레드
// mapper가 새로 생기는데, 빠른 스크롤에서는 이게 초당 수십 번 만들어졌다 버려진다 —
// 화면이 비어 보이던 주 원인. 채움 애니메이션을 포기하고 폭만 바로 준다.
const ProgressBar = ({
  completed,
  total,
  tintColor,
  bgColor,
  textColor,
}: ProgressBarProps) => {
  const t = useT();
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

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
        <View
          style={{
            width: `${pct}%`,
            height: "100%",
            borderRadius: 3,
            backgroundColor: tintColor,
          }}
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

// 원은 borderRadius View, 글리프만 이미지 — svg가 하던 것과 결과가 같다
// (svg도 단색 원 path 위에 같은 래스터를 덮는 구조였다)
const WorkoutIcon = ({ type }: { type: string }) => {
  const icon = WORKOUT_ICON[type] ?? WORKOUT_ICON.shoulder;
  return (
    <RNView style={[styles.workoutIcon, { backgroundColor: icon.circle }]}>
      <Image source={icon.src} style={styles.workoutIconImage} />
    </RNView>
  );
};

// 완료 토글 시 전체 리스트가 리렌더되지 않도록 메모 — 참조가 유지된 플랜은 스킵한다
export const WorkoutPlan = React.memo(function WorkoutPlan({
  item,
  index,
  totalLength,
  hideProgress,
  hideMenu,
}: WorkoutPlanProps) {
  const themeColor = useCurrentThemeColor();

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
        <WorkoutIcon type={item.type} />
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
  workoutIcon: {
    width: WORKOUT_ICON_SIZE,
    height: WORKOUT_ICON_SIZE,
    borderRadius: WORKOUT_ICON_SIZE / 2,
    overflow: "hidden",
  },
  workoutIconImage: {
    width: WORKOUT_ICON_SIZE,
    height: WORKOUT_ICON_SIZE,
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
