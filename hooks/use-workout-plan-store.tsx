import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { PlanStoreType } from "./use-plan-store";
import { storage } from "@/lib/storage";
import { sortByCreatedAtDesc } from "@/lib/date";
import { removePlanImages } from "@/lib/media";

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
    (set, get) => ({
      workoutPlanList: [],
      setWorkoutPlan: (value) =>
        set((prev) => ({
          workoutPlanList: sortByCreatedAtDesc([
            value,
            ...prev.workoutPlanList,
          ]),
        })),
      onResetPlanList: () => {
        get().workoutPlanList.forEach((plan) =>
          removePlanImages(plan.imageUri),
        );
        set({
          workoutPlanList: [],
        });
      },
      setCompleteProgress: (id: number, itemId: number) =>
        set((prev) => {
          const findIndex = prev.workoutPlanList.findIndex(
            (item) => item.id === id,
          );
          if (findIndex === -1) return prev;

          // createdAt이 안 바뀌므로 순서는 그대로 — 재정렬 없이 제자리 갱신해
          // 토글된 플랜 하나만 새 참조로 만든다(나머지는 참조 유지 → 리렌더 최소화)
          const target = prev.workoutPlanList[findIndex];
          const setWithCount = target.setWithCount.map((item) =>
            item.id === itemId
              ? {
                  ...item,
                  // 완료를 실수로 눌러도 다시 탭해 진행중으로 되돌릴 수 있게 토글
                  progress:
                    item.progress === "완료"
                      ? ("진행중" as const)
                      : ("완료" as const),
                }
              : item,
          );

          const workoutPlanList = [...prev.workoutPlanList];
          workoutPlanList[findIndex] = { ...target, setWithCount };
          return { workoutPlanList };
        }),
      setRemovePlan: (id: number) => {
        const target = get().workoutPlanList.find((item) => item.id === id);
        if (target) removePlanImages(target.imageUri);
        set((prev) => ({
          workoutPlanList: prev.workoutPlanList.filter(
            (item) => item.id !== id,
          ),
        }));
      },
      setEditPlan: (value) => {
        // 수정하며 뺀 사진은 여기서만 지울 기회가 있다 — 지나가면 영영 고아 파일
        const target = get().workoutPlanList.find(
          (item) => item.id === value.id,
        );
        // 경로가 아니라 id로 비교한다 — 사진첩 저장이 실패하면 saveImagesToLibrary가
        // 캐시 경로를 그대로 돌려줘서, 경로로 비교하면 멀쩡한 media/ 원본을 지운다
        const kept = new Set((value.imageUri || []).map((i) => i.id));
        removePlanImages(
          (target?.imageUri || []).filter((i) => !kept.has(i.id)),
        );

        set((prev) => {
          const newWorkoutList = [...prev.workoutPlanList];
          const filteredList = newWorkoutList.filter(
            (item) => item.id !== value.id,
          );
          const result = sortByCreatedAtDesc([...filteredList, { ...value }]);

          return {
            workoutPlanList: result,
          };
        });
      },
      // 여기서는 사진을 지우지 않는다 — 복원(restoreBackup)이 아카이브 미디어를
      // media/에 먼저 복사한 뒤 이걸 부른다. 같은 파일명이면 방금 복원한 걸 지운다.
      onSetMockout: (value) =>
        set({
          workoutPlanList: value,
        }),
    }),
    {
      name: "workout-plan",
      storage: createJSONStorage(() => storage),
      // 스토리지(MMKV)가 동기라 하이드레이션이 create() 안에서 끝난다 →
      // onRehydrateStorage에서 useWorkoutPlanStore를 참조하면 TDZ로 죽는다.
      // 중복 제거는 set 이전 단계인 merge에서 처리한다.
      merge: (persisted, current) => {
        const state = {
          ...current,
          ...(persisted as Partial<WorkoutPlanStoreTypes>),
        };
        const seen = new Set<number>();
        // 저장값이 깨져 배열이 아니면 여기서 throw → persist가 조용히 삼켜
        // 빈 목록으로 뜨고, 다음 저장이 그 빈 목록을 덮어써 기록이 날아간다
        const list = Array.isArray(state.workoutPlanList)
          ? state.workoutPlanList
          : [];

        return {
          ...state,
          workoutPlanList: list.filter((plan) => {
            if (seen.has(plan.id)) return false;
            seen.add(plan.id);
            return true;
          }),
        };
      },
    },
  ),
);
