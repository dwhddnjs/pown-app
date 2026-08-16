import React from "react"
// component
import { ConfirmDialog } from "../confirm-dialog"
import { toast } from "sonner-native"
// zustand
import { useWorkoutTagDialogStore } from "@/hooks/use-workout-tag-dialog-store"
import { usePlanStore } from "@/hooks/use-plan-store"
import { useUserStore } from "@/hooks/use-user-store"
// hook
import useCurrentThemeColor from "@/hooks/use-current-theme-color"
import { useT } from "@/hooks/use-t"
// type
import { WorkoutTypes } from "@/types/workout"

interface RemoveWorkoutTagDialogProps {
  workoutType: WorkoutTypes
}

export const RemoveWorkoutTagDialog = ({
  workoutType,
}: RemoveWorkoutTagDialogProps) => {
  const { isRemoveOpen, setIsRemoveOpen } = useWorkoutTagDialogStore()
  const { workout, setPlanValue } = usePlanStore()
  const { setRemoveWorkoutTag } = useUserStore()
  const themeColor = useCurrentThemeColor()
  const t = useT()

  const onRemoveWorkoutTag = () => {
    setRemoveWorkoutTag(workoutType, workout)
    setIsRemoveOpen(false)
    setPlanValue("workout", "")
    toast.success(t("tag.removed"))
  }

  return (
    <ConfirmDialog
      isOpen={isRemoveOpen}
      onClose={() => setIsRemoveOpen(false)}
      title={t("tag.removeTitle")}
      desc={t("tag.removeDesc")}
      actionLabel={t("common.deleteAction")}
      actionColor={themeColor.fail}
      onConfirm={onRemoveWorkoutTag}
    />
  )
}
