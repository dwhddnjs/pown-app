import React, { useCallback, useEffect, useRef, useState } from "react";
// component
import {
  Keyboard,
  Pressable,
  ScrollView,
  StyleProp,
  StyleSheet,
  ViewStyle,
} from "react-native";
import { View } from "@/components/themed";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { KeyBoardAvoid } from "@/components/keyboard-avoid";
import { WorkoutTags } from "@/components/add-plan/workout-tags";
import { SetCounter } from "@/components/add-plan/set-counter";
import { TopWeight } from "@/components/add-plan/top-weight";
import { ConditionList } from "@/components/add-plan/condition-list";
import { PlanNote } from "@/components/add-plan/plan-note";
import { EquipmentBox } from "@/components/add-plan/equipment-box";
import { CameraImage } from "@/components/add-plan/camera-image";
import { TitleSearchHeader } from "@/components/add-plan/title-search-header";
import { SearchWorkoutTagSheet } from "@/components/add-plan/search-workout-tag-sheet";
import { AddWorkoutTagDialog } from "@/components/add-plan/add-workout-tag-dialog";
import { RemoveWorkoutTagDialog } from "@/components/add-plan/remove-workout-tag-dialog";
import { SetCounterSheet } from "@/components/set-counter-sheet";
import { HeaderIconButton } from "@/components/header-icon-button";
// zustand
import { usePlanStore } from "@/hooks/use-plan-store";
import { useUserStore } from "@/hooks/use-user-store";
import { useWorkoutTagDialogStore } from "@/hooks/use-workout-tag-dialog-store";
// hook
import useCurrentThemeColor from "@/hooks/use-current-theme-color";
// type
import { WorkoutTypes } from "@/types/workout";
// expo
import { Stack, useFocusEffect, useNavigation } from "expo-router";

interface PlanFormProps {
  workoutType: WorkoutTypes;
  onSubmit: () => void;
  // 폼 본문 위에 얹는 영역 (루틴 추가 화면의 날짜·부위 선택). 없으면 기본 여백만.
  header?: React.ReactNode;
  // 폼과 함께 마운트할 시트·다이얼로그 (루틴 추가 화면의 날짜 선택 시트)
  extraSheets?: React.ReactNode;
  // 화면을 떠날 때 폼 리셋과 함께 정리할 것 (루틴 편집 중인 항목 등)
  onLeave?: () => void;
  saveButtonStyle?: StyleProp<ViewStyle>;
}

// 운동 계획 생성(add-plan)·수정(edit-plan)·루틴 추가(add-multi-plan)가 공유하는 폼 본문.
// 화면별 차이(slug 파싱, 데이터 프리필, 커밋 로직)는 각 라우트가 담당하고
// 여기서는 폼 UI·시트·태그 다이얼로그·임시 폼 리셋만 책임진다.
export const PlanForm = ({
  workoutType,
  onSubmit,
  header,
  extraSheets,
  onLeave,
  saveButtonStyle,
}: PlanFormProps) => {
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const workoutTagRef = useRef<BottomSheetModal>(null);
  const scrollRef = useRef<ScrollView>(null);
  const { onReset } = usePlanStore();
  const { workoutList } = useUserStore();
  const { isEditMode, setEditMode } = useWorkoutTagDialogStore();
  const navigation = useNavigation();
  const themeColor = useCurrentThemeColor();
  const [isWorkoutTagModalOpen, setIsWorkoutTagModalOpen] = useState(false);
  const [isSetCounterSheetOpen, setIsSetCounterSheetOpen] = useState(false);
  const [currentScrollY, setCurrentScrollY] = useState(0);
  // 태그 블록의 위치·높이와 보이는 영역의 높이 — 수정모드에 들어갈 때 얼마나 올릴지 계산한다
  const tagsRect = useRef({ y: 0, height: 0 });
  const viewportHeight = useRef(0);

  const workoutListData = workoutList[workoutType];

  const onWorkoutTagSheetClose = () => {
    if (isWorkoutTagModalOpen) {
      Keyboard.dismiss();
      setIsWorkoutTagModalOpen(false);
      workoutTagRef.current?.close();
    }
  };

  const onWorkoutTagSheetOpen = () => {
    setIsWorkoutTagModalOpen(true);
    workoutTagRef.current?.expand();
  };
  const onSheetClose = () => bottomSheetModalRef.current?.close();
  const onSheetOpen = () => bottomSheetModalRef.current?.expand();

  const onFocusScroll = (positionY: number) => {
    scrollRef.current?.scrollTo({ y: positionY, animated: true });
  };

  // 태그를 끌어 옮기는 동안 스크롤이 같이 움직이면 안 된다. 잠그기 전에 태그 줄이 전부
  // 보이도록 "모자란 만큼만" 올린다 — 무조건 태그 위치로 올리면 바로 위 제목이 밀려 나간다.
  useEffect(() => {
    if (!isEditMode) return;
    const { y, height } = tagsRect.current;
    // 아래쪽 줄이 잘리는 만큼만. 그래도 태그 블록 위쪽을 넘어가지는 않는다.
    const needed = y + height - viewportHeight.current;
    scrollRef.current?.scrollTo({
      y: Math.max(0, Math.min(y, needed)),
      animated: true,
    });
  }, [isEditMode]);

  // 리스너는 navigation이 바뀔 때만 다시 걸고, 부를 함수는 항상 최신 것을 쓴다.
  // onLeave는 prop이라 참조가 고정이라는 보장이 없다 — 의존성에서 빼고 직접 잡으면
  // 첫 렌더의 클로저에 갇혀 화면을 떠날 때 엉뚱한 것을 정리하게 된다.
  const cleanupRef = useRef({ onReset, onLeave, setEditMode });
  cleanupRef.current = { onReset, onLeave, setEditMode };

  useFocusEffect(
    useCallback(() => {
      const unsubscribe = navigation.addListener("beforeRemove", () => {
        cleanupRef.current.onReset();
        cleanupRef.current.setEditMode(false);
        cleanupRef.current.onLeave?.();
      });
      return unsubscribe;
    }, [navigation]),
  );

  // 수정모드에서는 태그 바깥 어디를 눌러도 모드가 풀린다 (아이폰 홈 화면 편집과 같은 규칙).
  // box-only가 있어야 안쪽 버튼이 터치를 먼저 가져가지 않는다.
  const outsideTapProps = {
    onPress: () => setEditMode(false),
    disabled: !isEditMode,
    pointerEvents: (isEditMode ? "box-only" : "auto") as "box-only" | "auto",
  };

  return (
    <KeyBoardAvoid
      style={[styles.container, { backgroundColor: themeColor.background }]}
      keyboardShouldPersistTaps="handled"
    >
      <Stack.Screen
        options={{
          headerRight: () => (
            <HeaderIconButton
              type="save"
              onPress={onSubmit}
              style={saveButtonStyle}
            />
          ),
        }}
      />
      <ScrollView
        ref={scrollRef}
        onLayout={(e) => {
          viewportHeight.current = e.nativeEvent.layout.height;
        }}
        onScroll={(e) => setCurrentScrollY(e.nativeEvent.contentOffset.y)}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        scrollEnabled={!isEditMode}
        style={{ flex: 1 }}
      >
        <Pressable {...outsideTapProps}>
          {header ?? <View style={{ height: 24 }} />}
          <TitleSearchHeader onPress={onWorkoutTagSheetOpen} />
        </Pressable>
        {/* 운동 태그 */}
        <View
          onLayout={(e) => {
            const { y, height } = e.nativeEvent.layout;
            tagsRect.current = { y, height };
          }}
        >
          <WorkoutTags
            workoutList={workoutListData}
            workoutType={workoutType}
          />
        </View>
        <Pressable {...outsideTapProps}>
          {/* 도구 선택 */}
          <EquipmentBox />
          {/* 목표중량 */}
          <TopWeight
            onFocusScroll={onFocusScroll}
            currentScrollY={currentScrollY}
          />
          {/* 세트와 횟수 */}
          <SetCounter
            onOpen={onSheetOpen}
            isSheetOpen={isSetCounterSheetOpen}
          />
          {/* 컨디션 */}
          <ConditionList />
          {/* 퀵노트 전체 노트 */}
          <PlanNote
            onFocusScroll={onFocusScroll}
            currentScrollY={currentScrollY}
          />
          {/* 사진 */}
          <CameraImage />
          <View style={{ height: 160 }} />
        </Pressable>
      </ScrollView>
      <SetCounterSheet
        ref={bottomSheetModalRef}
        onClose={onSheetClose}
        onOpenChange={setIsSetCounterSheetOpen}
      />
      <SearchWorkoutTagSheet
        workoutList={workoutListData}
        ref={workoutTagRef}
        onClose={onWorkoutTagSheetClose}
        isOpen={isWorkoutTagModalOpen}
      />
      <AddWorkoutTagDialog workoutType={workoutType} />
      <RemoveWorkoutTagDialog workoutType={workoutType} />
      {extraSheets}
    </KeyBoardAvoid>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
    paddingTop: 4,
  },
});
