import { create } from "zustand"
import { WorkoutPlanTypes } from "./use-workout-plan-store"

type MultiPlanStoreTypes = {
  isMultiPlanMode: boolean
  tempPlans: WorkoutPlanTypes[]
  editingPlan: WorkoutPlanTypes | null
  setMultiPlanMode: (value: boolean) => void
  addTempPlan: (plan: WorkoutPlanTypes) => void
  removeTempPlan: (id: number) => void
  updateTempPlan: (plan: WorkoutPlanTypes) => void
  setEditingPlan: (plan: WorkoutPlanTypes) => void
  clearEditingPlan: () => void
  resetMultiPlan: () => void
}

export const useMultiPlanStore = create<MultiPlanStoreTypes>((set) => ({
  isMultiPlanMode: false,
  tempPlans: [],
  editingPlan: null,

  setMultiPlanMode: (value) => set({ isMultiPlanMode: value }),

  addTempPlan: (plan) =>
    set((prev) => ({
      tempPlans: [...prev.tempPlans, plan],
    })),

  removeTempPlan: (id) =>
    set((prev) => ({
      tempPlans: prev.tempPlans.filter((item) => item.id !== id),
    })),

  updateTempPlan: (plan) =>
    set((prev) => ({
      tempPlans: prev.tempPlans.map((item) =>
        item.id === plan.id ? plan : item
      ),
    })),

  setEditingPlan: (plan) => set({ editingPlan: plan }),

  clearEditingPlan: () => set({ editingPlan: null }),

  resetMultiPlan: () =>
    set({
      isMultiPlanMode: false,
      tempPlans: [],
      editingPlan: null,
    }),
}))
