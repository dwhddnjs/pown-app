import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
// component
import { StyleSheet, TouchableOpacity } from "react-native";
import { Text, View } from "../themed";
import { WorkoutTag } from "./workout-tag";
// zustand
import { usePlanStore } from "@/hooks/use-plan-store";
import { useWorkoutTagDialogStore } from "@/hooks/use-workout-tag-dialog-store";
import { useUserStore } from "@/hooks/use-user-store";
// hook
import useCurrentThemeColor from "@/hooks/use-current-theme-color";
import { useT } from "@/hooks/use-t";
// lib
import {
  findDropIndex,
  layoutTags,
  moveItem,
  TagLayout,
} from "@/lib/tag-layout";
// type
import { WorkoutTypes } from "@/types/workout";
// expo
import { usePathname } from "expo-router";
import * as Haptics from "expo-haptics";
// icon
import FontAwesome from "@expo/vector-icons/FontAwesome";

const GAP = 8;
const CONTAINER_PADDING = 20;
// styles.plusButton과 같은 값. 수정모드에서 그리드의 마지막 한 칸을 차지한다.
const PLUS_WIDTH = 44;
const PLUS_HEIGHT = 28;

interface WorkoutTagsProps {
  workoutList: string[];
  workoutType: WorkoutTypes;
}

export const WorkoutTags = ({ workoutList, workoutType }: WorkoutTagsProps) => {
  const { workout, setPlanValue } = usePlanStore();
  const themeColor = useCurrentThemeColor();
  const t = useT();
  const { setOpen, setRemoveTarget, isEditMode, setEditMode } =
    useWorkoutTagDialogStore();
  // 액션만 셀렉터로 집는다 — 통째로 구독하면 테마·언어 등 무관한 변경에도 그리드가 다시 그려진다
  const setReorderWorkoutTag = useUserStore((s) => s.setReorderWorkoutTag);
  const pathname = usePathname().split("/");
  // 태그를 늘리고 줄이는 화면에서만 수정모드를 연다 (edit-plan은 계획만 고친다)
  const canEdit =
    pathname[1] === "add-plan" || pathname.includes("add-multi-plan");

  // 드래그하는 동안의 순서. 손을 뗄 때 한 번만 스토어(=MMKV)에 커밋한다.
  const [order, setOrder] = useState(workoutList);
  const [widths, setWidths] = useState<Record<string, number>>({});
  const [containerWidth, setContainerWidth] = useState(0);
  const [rowHeight, setRowHeight] = useState(0);
  const [draggingItem, setDraggingItem] = useState<string | null>(null);
  // 한 번 수정모드에 들어가면 그 뒤로도 절대 배치를 유지한다. flexWrap으로 되돌리는
  // 순간을 프레임 단위로 맞출 수 없어서(자세한 이유는 workout-tag.tsx) 아예 안 되돌린다.
  const [isPlacedMode, setIsPlacedMode] = useState(false);
  if (isEditMode && !isPlacedMode) setIsPlacedMode(true);

  useEffect(() => {
    setOrder(workoutList);
  }, [workoutList]);

  // 부위를 바꾸면(add-multi-plan) 태그 목록이 통째로 갈린다. 낡은 좌표를 물려받지 않게
  // 배치를 처음부터 다시 시작한다 — 아래 key도 부위를 포함해 확실히 새로 마운트시킨다.
  useEffect(() => {
    setIsPlacedMode(false);
  }, [workoutType]);

  // 폭을 다 재기 전에는 놓을 자리를 모른다. 이때 수정모드로 들어가면 태그가 겹쳐 쌓인다.
  const isMeasured =
    containerWidth > 0 &&
    rowHeight > 0 &&
    order.every((item) => (widths[item] ?? 0) > 0);

  // 태그가 흘러갈 자리. 평소에는 flexWrap이 하던 일을 직접 계산한다.
  // 아직 폭을 모르는 태그(방금 추가된 것)는 0으로 두고 계산한다 — 여기서 null을 돌려주면
  // 이미 절대 배치된 태그들이 좌표를 잃고 화면 밖으로 흩어진다.
  const layout = useMemo<TagLayout | null>(() => {
    if (containerWidth <= 0 || rowHeight <= 0) return null;
    const tagWidths = order.map((item) => widths[item] ?? 0);
    return layoutTags(
      // + 버튼은 수정모드에서만 자리를 차지한다
      isEditMode ? [...tagWidths, PLUS_WIDTH] : tagWidths,
      containerWidth,
      GAP,
      rowHeight,
    );
  }, [order, widths, containerWidth, rowHeight, isEditMode]);

  // 제스처 콜백은 매 프레임 불리므로 최신 값을 ref로 잡는다 (클로저에 갇히면 엉뚱한 자리로 간다)
  const stateRef = useRef({
    order,
    widths,
    layout,
    rowHeight,
    containerWidth,
    workoutList,
  });
  stateRef.current.widths = widths;
  stateRef.current.rowHeight = rowHeight;
  stateRef.current.containerWidth = containerWidth;
  stateRef.current.workoutList = workoutList;
  // 드래그 중에는 ref가 order·layout의 주인이다. onDragMove가 setOrder보다 먼저 갱신하는데
  // 그 사이 아무 리렌더나 state 값으로 덮어쓰면 같은 이동을 되풀이해 태그가 엉뚱한 자리로 간다.
  if (!draggingItem) {
    stateRef.current.order = order;
    stateRef.current.layout = layout;
  }

  const onMeasure = useCallback(
    (item: string, width: number, height: number) => {
      setWidths((prev) =>
        prev[item] === width ? prev : { ...prev, [item]: width },
      );
      setRowHeight((prev) => (prev >= height ? prev : height));
    },
    [],
  );

  const onPressWorkout = useCallback(
    (item: string) => {
      setPlanValue("workout", workout === item ? "" : item);
    },
    [workout, setPlanValue],
  );

  const onLongPress = useCallback(() => {
    if (isEditMode) return;
    setEditMode(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, [isEditMode, setEditMode]);

  const onDragMove = useCallback((item: string, x: number, y: number) => {
    const state = stateRef.current;
    if (!state.layout) return;
    const from = state.order.indexOf(item);
    if (from === -1) return;

    const tagWidths = state.order.map((tag) => state.widths[tag] ?? 0);
    const to = findDropIndex(
      state.layout.positions,
      tagWidths,
      x + (state.widths[item] ?? 0) / 2,
      y + state.rowHeight / 2,
      state.rowHeight,
      state.order.length,
    );
    // 자리가 바뀔 때만 다시 그린다 — 매 프레임 setState하면 드래그가 끊긴다
    if (to === -1 || to === from) return;

    const next = moveItem(state.order, from, to);
    const nextWidths = next.map((tag) => state.widths[tag] ?? 0);
    // setOrder는 다음 렌더에야 반영된다. 그 사이에 들어오는 프레임이 낡은 순서를 보면
    // 같은 이동을 몇 번이고 되풀이해 태그가 엉뚱한 자리에 떨어진다 — ref를 먼저 갱신한다.
    state.order = next;
    state.layout = layoutTags(
      [...nextWidths, PLUS_WIDTH],
      state.containerWidth,
      GAP,
      state.rowHeight,
    );
    setOrder(next);
  }, []);

  const onDragEnd = useCallback(() => {
    setDraggingItem(null);
    const state = stateRef.current;
    if (state.order.join() === state.workoutList.join()) return;
    setReorderWorkoutTag(workoutType, state.order);
    Haptics.selectionAsync();
  }, [setReorderWorkoutTag, workoutType]);

  const isEmpty = order.length === 0;
  const plusPosition = isEditMode
    ? (layout?.positions[order.length] ?? null)
    : null;
  const plusColors = {
    backgroundColor: themeColor.tint,
    borderColor: themeColor.tint,
  };

  return (
    <View>
      {/* 태그가 없을 때는 "길게 누르세요"가 가리킬 대상이 없다 — 수정모드일 때만 안내한다 */}
      {canEdit && (!isEmpty || isEditMode) && (
        <Text style={[styles.hint, { color: themeColor.subText }]}>
          {t(isEditMode ? "tag.editDoneHint" : "tag.editHint")}
        </Text>
      )}
      {/* 여백은 바깥 래퍼가 갖는다. 컨테이너에 패딩이 있으면 absolute 자식의 기준점이
          패딩 안쪽이 아니라 테두리라서, 수정모드에 들어가는 순간 태그가 통째로
          왼쪽·위로 패딩만큼 밀린다. 패딩이 0이면 두 기준점이 같아져 어긋날 일이 없다. */}
      <View style={styles.padding}>
        <View
          onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
          style={[
            styles.container,
            isPlacedMode && layout && !isEmpty
              ? { height: layout.height }
              : null,
          ]}
        >
          {order.map((item, index) => (
            <WorkoutTag
              key={`${workoutType}/${item}`}
              item={item}
              index={index}
              isSelected={item === workout}
              isEditMode={isEditMode}
              isDragging={draggingItem === item}
              position={
                isPlacedMode ? (layout?.positions[index] ?? null) : null
              }
              onPress={onPressWorkout}
              // 수정모드가 없는 화면에서 넘기면 길게 누른 탭이 통째로 사라진다
              onLongPress={canEdit && isMeasured ? onLongPress : undefined}
              onRemove={setRemoveTarget}
              onMeasure={onMeasure}
              onDragStart={setDraggingItem}
              onDragMove={onDragMove}
              onDragEnd={onDragEnd}
            />
          ))}
          {!isEmpty && isEditMode && plusPosition && (
            <TouchableOpacity
              style={[
                styles.plusBase,
                styles.plusButton,
                plusColors,
                {
                  left: plusPosition.x,
                  // 태그보다 낮아서 줄 가운데에 맞춰준다
                  top: plusPosition.y + (rowHeight - PLUS_HEIGHT) / 2,
                },
              ]}
              onPress={() => setOpen(true)}
            >
              <FontAwesome name="plus" size={14} color={themeColor.onTint} />
            </TouchableOpacity>
          )}
          {/* 태그가 하나도 없으면 길게 누를 대상이 없어 수정모드로 못 들어간다.
              그러면 + 버튼도 못 보게 되어 그 부위는 영영 비어 있게 된다. */}
          {canEdit && isEmpty && (
            <TouchableOpacity
              style={[styles.plusBase, plusColors]}
              onPress={() => setOpen(true)}
            >
              <FontAwesome name="plus" size={14} color={themeColor.onTint} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  padding: {
    paddingTop: 12,
    paddingBottom: 16,
    paddingHorizontal: CONTAINER_PADDING,
  },
  container: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "center",
    gap: GAP,
  },
  plusBase: {
    width: PLUS_WIDTH,
    height: PLUS_HEIGHT,
    borderWidth: 2,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 2,
  },
  plusButton: {
    position: "absolute",
  },
  hint: {
    fontFamily: "sb-l",
    fontSize: 12,
    marginTop: 4,
    // 제목과 같은 좌측 기준선에 맞춘다
    paddingHorizontal: CONTAINER_PADDING,
  },
});
