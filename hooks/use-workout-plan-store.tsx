import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { PlanStoreType } from "./use-plan-store";
import { storage } from "@/lib/storage";
import { parse } from "date-fns";

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
  | "imageUri"
> & { id: number; createdAt: string; updatedAt: string };

type WorkoutPlanStoreTypes = {
  workoutPlanList: WorkoutPlanTypes[];
  setWorkoutPlan: (value: WorkoutPlanTypes) => void;
  onResetPlanList: () => void;
  setCompleteProgress: (id: number, itemId: number) => void;
  setRemovePlan: (id: number) => void;
  setEditPlan: (value: WorkoutPlanTypes) => void;
  onSetMockout: (value: WorkoutPlanTypes[]) => void;
};

export const useWorkoutPlanStore = create<WorkoutPlanStoreTypes>()(
  persist(
    (set) => ({
      workoutPlanList: [],
      setWorkoutPlan: (value) =>
        set((prev) => ({
          workoutPlanList: [value, ...prev.workoutPlanList].sort(
            (a, b) =>
              parse(b.createdAt, "yyyy.MM.dd HH:mm:ss", new Date()).getTime() -
              parse(a.createdAt, "yyyy.MM.dd HH:mm:ss", new Date()).getTime(),
          ),
        })),
      onResetPlanList: () =>
        set({
          workoutPlanList: [],
        }),
      setCompleteProgress: (id: number, itemId: number) =>
        set((prev) => {
          const newWorkoutList = [...prev.workoutPlanList];
          const findIndex = newWorkoutList.findIndex((item) => item.id === id);
          if (findIndex === -1) return prev;
          const selectItem = newWorkoutList[findIndex].setWithCount.map(
            (item) => {
              if (item.id === itemId) {
                return {
                  ...item,
                  progress: "완료",
                };
              }
              return item;
            },
          );

          const newObj = {
            ...newWorkoutList[findIndex],
            setWithCount: selectItem,
          };

          const newArr = newWorkoutList.filter((item) => item.id !== id);
          const result = [...newArr, newObj].sort((a, b) => b.id - a.id);

          return {
            workoutPlanList: result as WorkoutPlanTypes[],
          };
        }),
      setRemovePlan: (id: number) =>
        set((prev) => ({
          workoutPlanList: prev.workoutPlanList.filter(
            (item) => item.id !== id,
          ),
        })),
      setEditPlan: (value) =>
        set((prev) => {
          const newWorkoutList = [...prev.workoutPlanList];
          const filteredList = newWorkoutList.filter(
            (item) => item.id !== value.id,
          );
          const result = [...filteredList, { ...value }].sort(
            (a, b) => b.id - a.id,
          );

          return {
            workoutPlanList: result,
          };
        }),
      onSetMockout: (value) =>
        set({
          workoutPlanList: value,
        }),
    }),
    {
      name: "workout-plan",
      storage: createJSONStorage(() => storage),
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        const seen = new Set<number>();
        const deduped: WorkoutPlanTypes[] = [];
        for (const plan of state.workoutPlanList) {
          if (!seen.has(plan.id)) {
            seen.add(plan.id);
            deduped.push(plan);
          }
        }
        if (deduped.length !== state.workoutPlanList.length) {
          useWorkoutPlanStore.setState({ workoutPlanList: deduped });
        }
      },
    },
  ),
);
