import React, { useCallback, useRef, useState } from "react";
// component
import { Keyboard, ScrollView, StyleSheet } from "react-native";
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
import { usePlanStore, WorkoutTypes } from "@/hooks/use-plan-store";
import { useUserStore } from "@/hooks/use-user-store";
// hook
import useCurrentThemeColor from "@/hooks/use-current-theme-color";
// expo
import { Stack, useFocusEffect, useNavigation } from "expo-router";

interface PlanFormProps {
  workoutType: WorkoutTypes;
  onSubmit: () => void;
}

// 운동 계획 생성(add-plan)·수정(edit-plan)이 공유하는 폼 본문.
// 화면별 차이(slug 파싱, 데이터 프리필, 커밋 로직)는 각 라우트가 담당하고
// 여기서는 폼 UI·시트·태그 다이얼로그·임시 폼 리셋만 책임진다.
export const PlanForm = ({ workoutType, onSubmit }: PlanFormProps) => {
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const workoutTagRef = useRef<BottomSheetModal>(null);
  const scrollRef = useRef<ScrollView>(null);
  const { onReset } = usePlanStore();
  const { workoutList } = useUserStore();
  const navigation = useNavigation();
  const themeColor = useCurrentThemeColor();
  const [isWorkoutTagModalOpen, setIsWorkoutTagModalOpen] = useState(false);
  const [currentScrollY, setCurrentScrollY] = useState(0);

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

  useFocusEffect(
    useCallback(() => {
      const unsubscribe = navigation.addListener("beforeRemove", () => {
        onReset();
      });
      return unsubscribe;
    }, [navigation]),
  );

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
              style={{ marginTop: 16 }}
            />
          ),
        }}
      />
      <ScrollView
        ref={scrollRef}
        onScroll={(e) => setCurrentScrollY(e.nativeEvent.contentOffset.y)}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        style={{ flex: 1 }}
      >
        <View style={{ height: 24 }} />
        <TitleSearchHeader onPress={onWorkoutTagSheetOpen} />
        {/* 운동 태그 */}
        <WorkoutTags workoutList={workoutListData} />
        {/* 도구 선택 */}
        <EquipmentBox />
        {/* 목표중량 */}
        <TopWeight onFocusScroll={onFocusScroll} currentScrollY={currentScrollY} />
        {/* 세트와 횟수 */}
        <SetCounter onOpen={onSheetOpen} />
        {/* 컨디션 */}
        <ConditionList />
        {/* 퀵노트 전체 노트 */}
        <PlanNote onFocusScroll={onFocusScroll} currentScrollY={currentScrollY} />
        {/* 사진 */}
        <CameraImage />
        <View style={{ height: 250 }} />
      </ScrollView>
      <SetCounterSheet ref={bottomSheetModalRef} onClose={onSheetClose} />
      <SearchWorkoutTagSheet
        workoutList={workoutListData}
        ref={workoutTagRef}
        onClose={onWorkoutTagSheetClose}
        isOpen={isWorkoutTagModalOpen}
      />
      <AddWorkoutTagDialog workoutType={workoutType} />
      <RemoveWorkoutTagDialog workoutType={workoutType} />
    </KeyBoardAvoid>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
    paddingTop: 12,
  },
});
