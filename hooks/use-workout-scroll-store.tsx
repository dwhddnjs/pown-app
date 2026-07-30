import { create } from "zustand";

type WorkoutScrollStoreTypes = {
  title: string;
  scrolled: boolean;
  setWorkoutTitle: (value: string) => void;
  setScrolled: (value: boolean) => void;
};

// 스크롤에 따라 바뀌는 운동 탭 UI 상태(헤더 타이틀, "맨 위로" 버튼 노출).
// 화면 상태나 navigation.setOptions로 올리면 값이 바뀔 때마다 화면/네비게이터가
// 통째로 리렌더된다 — 스크롤 중에는 그 비용이 그대로 셀 렌더를 밀어내 화면이
// 비어 보인다. 스토어로 빼서 리렌더 범위를 실제로 값을 읽는 컴포넌트로 가둔다.
// 두 setter 모두 같은 값이면 상태를 바꾸지 않아 구독자도 리렌더되지 않는다.
export const useWorkoutScrollStore = create<WorkoutScrollStoreTypes>((set) => ({
  title: "",
  scrolled: false,
  setWorkoutTitle: (value) =>
    set((prev) => (prev.title === value ? prev : { title: value })),
  setScrolled: (value) =>
    set((prev) => (prev.scrolled === value ? prev : { scrolled: value })),
}));
