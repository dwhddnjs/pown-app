import { create } from "zustand";

type WorkoutTagDialogStoreTypes = {
  isOpen: boolean;
  setOpen: (value: boolean) => void;
  // 삭제 확인창은 대상 태그 이름을 들고 있는다 (null = 닫힘).
  // 수정모드에서는 태그를 눌러도 선택이 아니라 드래그가 되므로 "선택된 운동"에 기댈 수 없다.
  removeTarget: string | null;
  setRemoveTarget: (value: string | null) => void;
  // 운동 태그 수정모드 (롱프레스로 진입, 태그 밖을 누르면 해제)
  isEditMode: boolean;
  setEditMode: (value: boolean) => void;
};

export const useWorkoutTagDialogStore = create<WorkoutTagDialogStoreTypes>(
  (set) => ({
    isOpen: false,
    setOpen: (value) =>
      set({
        isOpen: value,
      }),
    removeTarget: null,
    setRemoveTarget: (value) =>
      set({
        removeTarget: value,
      }),
    isEditMode: false,
    setEditMode: (value) =>
      set({
        isEditMode: value,
      }),
  }),
);
