import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { PlanStoreType } from "./use-plan-store";
import { storage } from "@/lib/storage";
import { sortByCreatedAtDesc } from "@/lib/date";

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
          workoutPlanList: sortByCreatedAtDesc([value, ...prev.workoutPlanList]),
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
                  // 완료를 실수로 눌러도 다시 탭해 진행중으로 되돌릴 수 있게 토글
                  progress:
                    item.progress === "완료"
                      ? ("진행중" as const)
                      : ("완료" as const),
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
          const result = sortByCreatedAtDesc([...newArr, newObj]);

          return {
            workoutPlanList: result,
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
          const result = sortByCreatedAtDesc([...filteredList, { ...value }]);

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
