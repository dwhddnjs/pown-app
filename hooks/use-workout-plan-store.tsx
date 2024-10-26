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
          workoutPlanList: [...prev.workoutPlanList, value],
        })),
      onResetPlanList: () =>
        set({
          workoutPlanList: [],
        }),
      setCompleteProgress: (id: number, itemId: number) =>
        set((prev) => {
          const newWorkoutList = [...prev.workoutPlanList]
          console.log("newWorkoutList: ", newWorkoutList)
          const findIndex = newWorkoutList.findIndex((item) => item.id === id)
          console.log("findIndex: ", findIndex)
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
          console.log("selectItem: ", selectItem)

          const newObj = {
            ...newWorkoutList[findIndex],
            setWithCount: selectItem,
          }
          console.log("newObj: ", newObj)

          const newArr = newWorkoutList.filter((item) => item.id !== id)
          console.log("newArr: ", newArr)
          const result = [...newArr, newObj].sort((a, b) => a.id - b.id)
          console.log("result: ", result)
          //   const newWorkoutList = prev.workoutPlanList.map((item) => {
          //     if (item.id === id) {
          //       return {
          //         ...item,
          //         setWithCount: item.setWithCount.map((setItem) =>
          //           setItem.id === itemId
          //             ? { ...setItem, progress: "완료" }
          //             : setItem
          //         ),
          //       }
          //     }
          //   })
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
