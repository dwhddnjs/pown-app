import { create } from "zustand";
import { WorkoutPlanTypes } from "./use-workout-plan-store";
import { removePlanImages } from "@/lib/media";

type MultiPlanStoreTypes = {
  isMultiPlanMode: boolean;
  tempPlans: WorkoutPlanTypes[];
  editingPlan: WorkoutPlanTypes | null;
  setMultiPlanMode: (value: boolean) => void;
  addTempPlan: (plan: WorkoutPlanTypes) => void;
  removeTempPlan: (id: number) => void;
  updateTempPlan: (plan: WorkoutPlanTypes) => void;
  setEditingPlan: (plan: WorkoutPlanTypes) => void;
  clearEditingPlan: () => void;
  commitTempPlans: () => void;
  resetMultiPlan: () => void;
};

export const useMultiPlanStore = create<MultiPlanStoreTypes>((set, get) => ({
  isMultiPlanMode: false,
  tempPlans: [],
  editingPlan: null,

  setMultiPlanMode: (value) => set({ isMultiPlanMode: value }),

  addTempPlan: (plan) =>
    set((prev) => ({
      tempPlans: [...prev.tempPlans, plan],
    })),

  // 커밋 전 임시 항목이라 사진 파일 주인이 여기뿐 — 버릴 때 같이 지운다
  removeTempPlan: (id) => {
    const target = get().tempPlans.find((item) => item.id === id);
    if (target) removePlanImages(target.imageUri);
    set((prev) => ({
      tempPlans: prev.tempPlans.filter((item) => item.id !== id),
    }));
  },

  updateTempPlan: (plan) => {
    const target = get().tempPlans.find((item) => item.id === plan.id);
    // 경로가 아니라 id로 비교한다 — 사진첩 저장이 실패하면 saveImagesToLibrary가
    // 캐시 경로를 그대로 돌려줘서, 경로로 비교하면 멀쩡한 media/ 원본을 지운다
    const kept = new Set((plan.imageUri || []).map((i) => i.id));
    removePlanImages((target?.imageUri || []).filter((i) => !kept.has(i.id)));
    set((prev) => ({
      tempPlans: prev.tempPlans.map((item) =>
        item.id === plan.id ? plan : item,
      ),
    }));
  },

  setEditingPlan: (plan) => set({ editingPlan: plan }),

  clearEditingPlan: () => set({ editingPlan: null }),

  // 저장을 마친 목록을 비운다 — 커밋된 기록이 같은 파일을 가리키므로 사진은 두고 간다.
  // 이걸 먼저 부르면 뒤따르는 resetMultiPlan이 지울 게 없어 안전하다.
  commitTempPlans: () => set({ tempPlans: [] }),

  // 저장 없이 화면을 떠난 경우다 — 남은 임시 항목의 사진은 주인이 여기뿐이라 같이 지운다.
  // (저장 경로는 commitTempPlans로 이미 비우고 들어온다.)
  resetMultiPlan: () => {
    get().tempPlans.forEach((plan) => removePlanImages(plan.imageUri));
    set({
      isMultiPlanMode: false,
      tempPlans: [],
      editingPlan: null,
    });
  },
}));
