import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { PlanStoreType } from "./use-plan-store"

const storage = {
  getItem: async (name: string): Promise<string | null> => {
    const data = (await AsyncStorage.getItem(name)) || null

    return data
  },
  setItem: async (name: string, value: string): Promise<void> => {
    await AsyncStorage.setItem(name, value)
  },
  removeItem: async (name: string): Promise<void> => {
    await AsyncStorage.removeItem(name)
  },
}

export type WorkoutPlanTypes = Pick<
  PlanStoreType,
  | "workout"
  | "type"
  | "equipment"
  | "weight"
  | "condition"
  | "content"
  | "title"
  | "setWithCount"
> & { id: number; createdAt: Date | string; updatedAt: Date | string }

type WorkoutPlanStoreTypes = {
  workoutPlanList: WorkoutPlanTypes[]
  setWorkoutPlan: (value: WorkoutPlanTypes) => void
  onResetPlanList: () => void
}

export const userWorkoutPlanStore = create<WorkoutPlanStoreTypes>()(
  persist(
    (set) => ({
      workoutPlanList: [],
      setWorkoutPlan: (value) =>
        set((prev) => ({
          workoutPlanList: [...prev.workoutPlanList, value],
        })),
      onResetPlanList: () =>
        set({
          workoutPlanList: [],
        }),
    }),
    {
      name: "workout-plan",
      storage: createJSONStorage(() => storage),
    }
  )
)
