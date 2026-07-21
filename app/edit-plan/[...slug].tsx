import React, { useEffect } from "react";
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

export default function EditPlan() {
  const { workoutPlanList, setEditPlan } = useWorkoutPlanStore();
  const { onReset, setPrevPlanValue, ...result } = usePlanStore();
  const { onReset: onResetNote } = useNoteStore();
  const { slug } = useLocalSearchParams();
  const navigation = useNavigation();
  const t = useT();

  const getWorkoutPlan = workoutPlanList.find(
    (item) => item.id === Number(slug?.[1]),
  );

  useEffect(() => {
    if (slug?.[0] && getWorkoutPlan) {
      setPrevPlanValue(getWorkoutPlan);
    }
  }, [slug?.[0]]);

  const onSubmitWorkoutPlan = async () => {
    try {
      if (!result.weight || !result.workout || !getWorkoutPlan) {
        return toast.error(t("plan.requireFields"));
      }
      const imageUri = await saveImagesToLibrary(result.imageUri);
      setEditPlan({
        id: getWorkoutPlan.id,
        workout: result.workout,
        type: slug?.[0] as string,
        equipment: result.equipment,
        weight: convertWeightToKg(result.weight, result.weightType),
        condition: result.condition,
        content: result.content,
        title: result.title,
        setWithCount: result.setWithCount,
        createdAt: getWorkoutPlan.createdAt,
        updatedAt: format(new Date(), "yyyy.MM.dd HH:mm:ss"),
        imageUri,
      });
      onReset();
      navigation.goBack();
      onResetNote();
      return toast.success(t("plan.updated"));
    } catch {
      toast.error(t("plan.updateFailed"));
    }
  };

  return (
    <PlanForm
      workoutType={slug?.[0] as WorkoutTypes}
      onSubmit={onSubmitWorkoutPlan}
    />
  );
}
