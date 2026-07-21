import React from "react";
// component
import { PlanForm } from "@/components/plan-form";
// zustand
import { usePlanStore, WorkoutTypes } from "@/hooks/use-plan-store";
import { useWorkoutPlanStore } from "@/hooks/use-workout-plan-store";
import { useNoteStore } from "@/hooks/use-note-store";
// expo
import { useLocalSearchParams, useNavigation } from "expo-router";
import { useT } from "@/hooks/use-t";
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
  const t = useT();

  const onSubmitWorkoutPlan = async () => {
    try {
      if (!result.weight || !result.workout) {
        return toast.error(t("plan.requireFields"));
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
      return toast.success(t("plan.added"));
    } catch {
      toast.error(t("plan.addFailed"));
    }
  };

  return (
    <PlanForm workoutType={slug as WorkoutTypes} onSubmit={onSubmitWorkoutPlan} />
  );
}
