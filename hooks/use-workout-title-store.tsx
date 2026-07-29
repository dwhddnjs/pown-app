import { create } from "zustand";

// 스크롤 중 타이틀 갱신이 네비게이터 전체를 리렌더하지 않도록, 헤더 하나만
// 구독하는 임시 스토어. navigation.setOptions는 매번 새 옵션 객체를 만들어
// 탭 네비게이터를 리렌더하고 그게 다시 헤더의 BlurView를 그리게 만든다 —
// 빠른 스크롤 도중에 이 루프가 돌면 셀 렌더가 프레임 예산을 넘긴다.
type WorkoutTitleStoreTypes = {
  title: string;
  setTitle: (title: string) => void;
};

export const useWorkoutTitleStore = create<WorkoutTitleStoreTypes>((set) => ({
  title: "",
  // 같은 값이면 prev를 그대로 돌려준다 — zustand는 Object.is가 참이면 리스너를
  // 아예 부르지 않으므로 달이 바뀔 때만 헤더가 리렌더된다
  setTitle: (title) => set((prev) => (prev.title === title ? prev : { title })),
}));
