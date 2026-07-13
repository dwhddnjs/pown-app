import React, { useCallback, useRef, useState } from "react";
// component
import { SetCounterSheet } from "@/components/set-counter-sheet";
import { Text, View } from "@/components/themed";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import {
  Keyboard,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { WorkoutTags } from "@/components/add-plan/workout-tags";
import { SetCounter } from "@/components/add-plan/set-counter";
import { TopWeight } from "@/components/add-plan/top-weight";
import { ConditionList } from "@/components/add-plan/condition-list";
import { PlanNote } from "@/components/add-plan/plan-note";
import { EquipmentBox } from "@/components/add-plan/equipment-box";
// zustand
import { usePlanStore, WorkoutTypes } from "@/hooks/use-plan-store";
import { useWorkoutPlanStore } from "@/hooks/use-workout-plan-store";
import { useNoteStore } from "@/hooks/use-note-store";
// expo
import {
  Stack,
  useFocusEffect,
  useLocalSearchParams,
  useNavigation,
} from "expo-router";
// lib
import { format } from "date-fns";
import { toast } from "sonner-native";
import { convertWeightToKg, saveImagesToLibrary } from "@/lib/media";
// hook
import useCurrentThemeColor from "@/hooks/use-current-theme-color";
import { KeyBoardAvoid } from "@/components/keyboard-avoid";
import { Button } from "@/components/button";
import { CameraImage } from "@/components/add-plan/camera-image";
import { SearchWorkoutTagSheet } from "@/components/add-plan/search-workout-tag-sheet";
import { FontAwesome } from "@expo/vector-icons";
import Checkcircle from "@expo/vector-icons/AntDesign";
import { Dialog } from "@/components/dialog";
import { AddWorkoutTagDialog } from "@/components/add-plan/add-workout-tag-dialog";
import { useUserStore } from "@/hooks/use-user-store";
import { RemoveWorkoutTagDialog } from "@/components/add-plan/remove-workout-tag-dialog";
import { TitleSearchHeader } from "@/components/add-plan/title-search-header";

export interface InputRefObject {
  measure: (
    callback: (
      x: number,
      y: number,
      width: number,
      height: number,
      pageX: number,
      pageY: number,
    ) => void,
  ) => void;
}

export default function AddPlan() {
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const workoutTagRef = useRef<BottomSheetModal>(null);
  const { onReset, ...result } = usePlanStore();
  const { setWorkoutPlan } = useWorkoutPlanStore();
  const { onReset: onResetNote } = useNoteStore();
  const { slug } = useLocalSearchParams();
  const { workoutList } = useUserStore();
  const navigation = useNavigation();
  const [isWorkoutTagModalOpen, setIsWorkoutTagModalOpen] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const themeColor = useCurrentThemeColor();
  const [currentScrollY, setCurrentScrollY] = useState(0);

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

  const onInputFocus = (node: InputRefObject) => {
    if (node) {
      node.measure(
        (
          fx: number,
          fy: number,
          width: number,
          h: number,
          px: number,
          py: number,
        ) => {
          scrollRef.current?.scrollTo({ y: py, animated: true });
        },
      );
    }
  };

  const onFocusScroll = (positionY: number) => {
    scrollRef.current?.scrollTo({ y: positionY, animated: true });
  };

  useFocusEffect(
    useCallback(() => {
      const unsubscribe = navigation.addListener("beforeRemove", (e) => {
        onReset();
      });
      return unsubscribe;
    }, [navigation]),
  );

  const onSubmitWorkoutPlan = async () => {
    try {
      if (!result.weight || !result.workout) {
        return toast.error("운동과 목표 중량은 필수에요..");
      }
      const imageUri = await saveImagesToLibrary(result.imageUri);
      setWorkoutPlan({
        id: Date.now(),
        workout: result.workout,
        type: slug as string,
        equipment: result.equipment,
        weight: convertWeightToKg(result.weight, result.weightType),
        condition: result.condition,
        content: result.content,
        title: result.title,
        setWithCount: result.setWithCount,
        createdAt: format(result.date, "yyyy.MM.dd HH:mm:ss"),
        updatedAt: format(result.date, "yyyy.MM.dd HH:mm:ss"),
        imageUri,
      });
      onReset();
      navigation.goBack();
      onResetNote();
      return toast.success("운동 계획이 추가되었습니다!");
    } catch {
      toast.error("운동 계획 저장 중 오류가 발생했습니다.");
    }
  };

  return (
    <KeyBoardAvoid
      style={[styles.container, { backgroundColor: themeColor.background }]}
      keyboardShouldPersistTaps="handled"
    >
      <Stack.Screen
        options={{
          headerRight: () => (
            <TouchableOpacity onPress={onSubmitWorkoutPlan}>
              <Checkcircle
                name="checkcircle"
                size={30}
                color={themeColor.tint}
              />
            </TouchableOpacity>
          ),
        }}
      />
      <ScrollView
        ref={scrollRef}
        onScroll={(e) => setCurrentScrollY(e.nativeEvent.contentOffset.y)}
        style={{
          flex: 1,
        }}
      >
        <TitleSearchHeader onPress={onWorkoutTagSheetOpen} />
        {/* 운동 태그 */}
        <WorkoutTags workoutList={workoutList[slug as WorkoutTypes]} />
        {/* 도구 선택 */}
        <EquipmentBox />
        {/* 목표중량 */}
        <TopWeight
          onFocusScroll={onFocusScroll}
          currentScrollY={currentScrollY}
        />
        {/* 세트와 횟수 */}
        <SetCounter onOpen={onSheetOpen} />
        {/* 컨디션 */}
        <ConditionList />
        {/* 퀵노트 전체 노트 */}
        <PlanNote
          onFocusScroll={onFocusScroll}
          currentScrollY={currentScrollY}
        />
        {/* 사진   */}
        <CameraImage />
        <View style={{ height: 250 }} />
      </ScrollView>
      <SetCounterSheet ref={bottomSheetModalRef} onClose={onSheetClose} />
      <SearchWorkoutTagSheet
        workoutList={workoutList[slug as WorkoutTypes]}
        ref={workoutTagRef}
        onClose={onWorkoutTagSheetClose}
        isOpen={isWorkoutTagModalOpen}
      />
      <AddWorkoutTagDialog workoutType={slug as WorkoutTypes} />
      <RemoveWorkoutTagDialog workoutType={slug as WorkoutTypes} />
    </KeyBoardAvoid>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
    paddingTop: 12,
  },
});
