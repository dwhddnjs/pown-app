import React, { useEffect, useLayoutEffect, useState } from "react";
// component
import { StyleSheet, Text } from "react-native";
import Animated, {
  cancelAnimation,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import {
  Gesture,
  GestureDetector,
  TouchableOpacity,
} from "react-native-gesture-handler";
// hook
import useCurrentThemeColor from "@/hooks/use-current-theme-color";
import { useLanguage } from "@/hooks/use-user-store";
// lib
import { tWorkout } from "@/lib/i18n";
import { TagPosition } from "@/lib/tag-layout";
// icon
import FontAwesome from "@expo/vector-icons/FontAwesome";

// 아이폰 홈 화면 편집처럼 "빠르지만 작게". 태그가 작아서 1도를 넘으면 글자가 출렁여 보인다.
const JIGGLE_ANGLE = 1;
const MOVE_DURATION = 180;

interface WorkoutTagProps {
  item: string;
  index: number;
  isSelected: boolean;
  isEditMode: boolean;
  isDragging: boolean;
  // 절대 배치 좌표. 좌표가 아직 안 잡혔으면 null.
  position: TagPosition | null;
  onPress: (item: string) => void;
  // 수정모드로 들어갈 수 없는 화면에서는 넘기지 않는다 — 넘기면 길게 누른 탭이
  // 롱프레스로 잡혀 onPress가 통째로 사라진다(GenericTouchable이 억제한다).
  onLongPress?: () => void;
  onRemove: (item: string) => void;
  onMeasure: (item: string, width: number, height: number) => void;
  onDragStart: (item: string) => void;
  onDragMove: (item: string, x: number, y: number) => void;
  onDragEnd: () => void;
}

/**
 * 운동 태그 하나. 수정모드에서는 흔들리고, 끌어서 순서를 바꾸고, ⊗로 지운다.
 *
 * 태그마다 애니메이션 값이 필요한데 map 안에서는 훅을 쓸 수 없어 컴포넌트로 떼어냈다.
 * 좌표가 잡히면 절대 배치로 넘어간다 — 순서가 실시간으로 바뀌는 동안 flexWrap에
 * 맡기면 태그가 순간이동하기 때문이다.
 *
 * 안쪽 터치는 RN이 아니라 gesture-handler의 TouchableOpacity를 쓴다. GestureDetector와
 * 같은 네이티브 제스처 시스템이라야 드래그(Pan)와 탭이 서로를 잡아먹지 않는다.
 */
const WorkoutTagComponent = ({
  item,
  index,
  isSelected,
  isEditMode,
  isDragging,
  position,
  onPress,
  onLongPress,
  onRemove,
  onMeasure,
  onDragStart,
  onDragMove,
  onDragEnd,
}: WorkoutTagProps) => {
  const themeColor = useCurrentThemeColor();
  const lang = useLanguage();

  const jiggle = useSharedValue(0);
  const scale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  // 드래그를 시작한 지점 — 손가락 이동량은 여기에 더한다
  const startX = useSharedValue(0);
  const startY = useSharedValue(0);
  // 절대 배치(position:absolute)로 넘어갔는지. 자리를 잡기 전에는 드래그도 막는다 —
  // translate가 0인 채로 잡히면 태그가 좌상단으로 튄다.
  const [isPlaced, setIsPlaced] = useState(false);

  useEffect(() => {
    if (!isEditMode) {
      cancelAnimation(jiggle);
      jiggle.value = withTiming(0, { duration: 120 });
      return;
    }
    // 태그마다 시작 시점과 속도를 어긋내야 한 덩어리로 흔들리지 않는다
    jiggle.value = -1;
    jiggle.value = withDelay(
      (index * 37) % 130,
      withRepeat(withTiming(1, { duration: 100 + (index % 3) * 12 }), -1, true),
    );
  }, [isEditMode, index, jiggle]);

  // 자리 잡기.
  //
  // absolute 전환은 React 커밋으로, translate는 UI 스레드로 반영된다. 두 경로를 한
  // 프레임에 맞추려면 같은 tick 안에서 둘 다 밀어 넣어야 해서 useLayoutEffect를 쓴다
  // (useEffect는 페인트 뒤라 모든 태그가 한 프레임 좌상단에 겹쳐 쌓인다).
  //
  // 그리고 한 번 놓은 뒤에는 절대 배치를 절대 되돌리지 않는다. 되돌리면 flexWrap이
  // 계산한 자리에 남아 있는 translate가 그대로 더해져 좌표가 두 배로 어긋난다.
  // 되돌리지 않아도 눈에 보이는 자리는 flexWrap과 같다 — layoutTags가 그걸 계산한다.
  useLayoutEffect(() => {
    // 잡고 있는 동안은 손가락이 위치의 주인이다
    if (isDragging || !position) return;
    if (!isPlaced) {
      setIsPlaced(true);
      translateX.value = position.x;
      translateY.value = position.y;
      return;
    }
    translateX.value = withTiming(position.x, { duration: MOVE_DURATION });
    translateY.value = withTiming(position.y, { duration: MOVE_DURATION });
  }, [isDragging, isPlaced, position, translateX, translateY]);

  useEffect(() => {
    scale.value = withTiming(isDragging ? 1.08 : 1, { duration: 120 });
  }, [isDragging, scale]);

  const pan = Gesture.Pan()
    // 수정모드로 들어간 롱프레스가 그대로 드래그가 되면, 손을 떼는 순간 태그가 제멋대로
    // 재배치된다. 자리를 잡은 뒤(isPlaced) 손가락이 실제로 움직여야(minDistance) 끌린다.
    .enabled(isEditMode && isPlaced)
    .minDistance(10)
    .onStart(() => {
      startX.value = translateX.value;
      startY.value = translateY.value;
      cancelAnimation(jiggle);
      jiggle.value = withTiming(0, { duration: 100 });
      runOnJS(onDragStart)(item);
    })
    .onUpdate((event) => {
      translateX.value = startX.value + event.translationX;
      translateY.value = startY.value + event.translationY;
      runOnJS(onDragMove)(item, translateX.value, translateY.value);
    })
    // 취소로 끝나도 부모가 드래그 상태를 놓을 수 있게 onEnd가 아니라 onFinalize
    .onFinalize(() => {
      runOnJS(onDragEnd)();
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { rotate: `${jiggle.value * JIGGLE_ANGLE}deg` },
      { scale: scale.value },
    ],
  }));

  return (
    <GestureDetector gesture={pan}>
      <Animated.View
        onLayout={(e) =>
          onMeasure(
            item,
            e.nativeEvent.layout.width,
            e.nativeEvent.layout.height,
          )
        }
        style={[
          isPlaced && styles.placed,
          isDragging && styles.lifted,
          animatedStyle,
        ]}
      >
        <TouchableOpacity
          style={[
            tagChipStyles.tag,
            { borderColor: themeColor.tint },
            isSelected && { backgroundColor: themeColor.tint },
          ]}
          // 수정모드에서는 탭으로 선택되지 않는다 (아이폰도 편집 중엔 앱이 열리지 않는다)
          onPress={() => !isEditMode && onPress(item)}
          onLongPress={onLongPress}
          delayLongPress={400}
        >
          <Text
            style={[
              tagChipStyles.title,
              { color: themeColor.tintText },
              isSelected && { color: themeColor.onTint },
            ]}
          >
            {tWorkout(item, lang)}
          </Text>
        </TouchableOpacity>
        {isEditMode && (
          <TouchableOpacity
            hitSlop={8}
            onPress={() => onRemove(item)}
            containerStyle={styles.badgeAnchor}
            style={[
              styles.badge,
              {
                backgroundColor: themeColor.background,
                borderColor: themeColor.tint,
              },
            ]}
          >
            <FontAwesome name="times" size={9} color={themeColor.tint} />
          </TouchableOpacity>
        )}
      </Animated.View>
    </GestureDetector>
  );
};

// 드래그 중에는 자리가 바뀐 태그만 다시 그리면 된다 — 부모가 매 이동마다 리렌더된다.
export const WorkoutTag = React.memo(WorkoutTagComponent);
WorkoutTag.displayName = "WorkoutTag";

// 검색 시트(search-workout-tag-sheet)도 같은 칩을 쓴다. 모양이 갈라지지 않게 여기서만 정의한다.
export const tagChipStyles = StyleSheet.create({
  tag: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderWidth: 2,
    borderRadius: 50,
  },
  title: {
    fontFamily: "sb-l",
    fontSize: 14,
  },
});

const styles = StyleSheet.create({
  placed: {
    position: "absolute",
    left: 0,
    top: 0,
  },
  lifted: {
    zIndex: 10,
  },
  badgeAnchor: {
    position: "absolute",
    left: -5,
    top: -5,
  },
  badge: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
