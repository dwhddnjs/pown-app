import { create } from "zustand"

type WorkoutTagDialogStoreTypes = {
  isOpen: boolean
  setOpen: (value: boolean) => void
}

export const useWorkoutTagDialogStore = create<WorkoutTagDialogStoreTypes>(
  (set) => ({
    isOpen: false,
    setOpen: (value) =>
      set({
        isOpen: value,
      }),
  })
)
