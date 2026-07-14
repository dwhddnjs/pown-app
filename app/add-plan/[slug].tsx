import React from "react";
// component
import { PlanForm } from "@/components/plan-form";
// zustand
import { usePlanStore, WorkoutTypes } from "@/hooks/use-plan-store";
import { useWorkoutPlanStore } from "@/hooks/use-workout-plan-store";
import { useNoteStore } from "@/hooks/use-note-store";
// expo
import { useLocalSearchParams, useNavigation } from "expo-router";
// lib
import { format } from "date-fns";
import { toast } from "sonner-native";
import { convertWeightToKg, saveImagesToLibrary } from "@/lib/media";

export default function AddPlan() {
  const { onReset, ...result } = usePlanStore();
  const { setWorkoutPlan } = useWorkoutPlanStore();
  const { onReset: onResetNote } = useNoteStore();
  const { slug } = useLocalSearchParams();
  const navigation = useNavigation();

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
    <PlanForm workoutType={slug as WorkoutTypes} onSubmit={onSubmitWorkoutPlan} />
  );
}
