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
> & { id: number; createdAt: string; updatedAt: string }

type WorkoutPlanStoreTypes = {
  workoutPlanList: WorkoutPlanTypes[]
  setWorkoutPlan: (value: WorkoutPlanTypes) => void
  onResetPlanList: () => void
  setCompleteProgress: (id: number, itemId: number) => void
}

export const userWorkoutPlanStore = create<WorkoutPlanStoreTypes>()(
  persist(
    (set) => ({
      workoutPlanList: [],
      setWorkoutPlan: (value) =>
        set((prev) => ({
          workoutPlanList: [value, ...prev.workoutPlanList],
        })),
      onResetPlanList: () =>
        set({
          workoutPlanList: [],
        }),
      setCompleteProgress: (id: number, itemId: number) =>
        set((prev) => {
          const newWorkoutList = [...prev.workoutPlanList]
          const findIndex = newWorkoutList.findIndex((item) => item.id === id)
          const selectItem = newWorkoutList[findIndex].setWithCount.map(
            (item) => {
              if (item.id === itemId) {
                return {
                  ...item,
                  progress: "완료",
                }
              }
              return item
            }
          )

          const newObj = {
            ...newWorkoutList[findIndex],
            setWithCount: selectItem,
          }

          const newArr = newWorkoutList.filter((item) => item.id !== id)

          const result = [...newArr, newObj].sort((a, b) => b.id - a.id)

          return {
            workoutPlanList: result as any,
          }
        }),
    }),
    {
      name: "workout-plan",
      storage: createJSONStorage(() => storage),
    }
  )
)
