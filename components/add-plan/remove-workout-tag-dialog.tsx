import React from "react";
// component
import { ConfirmDialog } from "../confirm-dialog";
import { toast } from "sonner-native";
// zustand
import { useWorkoutTagDialogStore } from "@/hooks/use-workout-tag-dialog-store";
import { usePlanStore } from "@/hooks/use-plan-store";
import { useLanguage, useUserStore } from "@/hooks/use-user-store";
// hook
import useCurrentThemeColor from "@/hooks/use-current-theme-color";
import { useT } from "@/hooks/use-t";
// lib
import { tWorkout } from "@/lib/i18n";
// type
import { WorkoutTypes } from "@/types/workout";

interface RemoveWorkoutTagDialogProps {
  workoutType: WorkoutTypes;
}

export const RemoveWorkoutTagDialog = ({
  workoutType,
}: RemoveWorkoutTagDialogProps) => {
  const { removeTarget, setRemoveTarget } = useWorkoutTagDialogStore();
  const { workout, setPlanValue } = usePlanStore();
  const { setRemoveWorkoutTag } = useUserStore();
  const themeColor = useCurrentThemeColor();
  const lang = useLanguage();
  const t = useT();

  const onRemoveWorkoutTag = () => {
    // 빈 문자열("")도 지워야 할 태그다 — falsy로 거르면 예전에 잘못 들어간 태그가 영영 안 지워진다
    if (removeTarget === null) return;
    setRemoveWorkoutTag(workoutType, removeTarget);
    // 계획에 고른 운동을 지웠을 때만 폼을 비운다
    if (workout === removeTarget) {
      setPlanValue("workout", "");
    }
    setRemoveTarget(null);
    toast.success(t("tag.removed"));
  };

  return (
    <ConfirmDialog
      isOpen={removeTarget !== null}
      onClose={() => setRemoveTarget(null)}
      title={t("tag.removeTitle", {
        name: tWorkout(removeTarget ?? "", lang),
      })}
      desc={t("tag.removeDesc")}
      actionLabel={t("common.deleteAction")}
      actionColor={themeColor.fail}
      onConfirm={onRemoveWorkoutTag}
    />
  );
};
