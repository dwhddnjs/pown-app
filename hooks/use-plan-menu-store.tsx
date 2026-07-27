import { create } from "zustand";

// 열려 있는 ⋯ 메뉴는 항상 하나뿐이라 행마다 상태를 두지 않고 여기 한 곳에 모은다.
// 행은 자기 좌표(anchor rect)만 올리고, 배치·애니메이션은 PlanMenu가 맡는다.
export type PlanMenuTarget = {
  id: number;
  type: string;
  // measureInWindow 기준 — 버튼의 위/높이, 그리고 오른쪽 끝 x
  y: number;
  height: number;
  rightEdge: number;
};

type PlanMenuStoreTypes = {
  target: PlanMenuTarget | null;
  openPlanMenu: (target: PlanMenuTarget) => void;
  closePlanMenu: () => void;
};

export const usePlanMenuStore = create<PlanMenuStoreTypes>((set) => ({
  target: null,
  openPlanMenu: (target) => set({ target }),
  closePlanMenu: () => set({ target: null }),
}));
