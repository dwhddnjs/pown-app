import { create } from "zustand";

// 전체 노트 모달의 제목 — 본문은 에디터(react-native-enriched)가 직접 들고 있다가 저장할 때 꺼낸다
type NoteStoreType = {
  title: string;
  setValue: (type: "title", value: string) => void;
  onReset: () => void;
};

export const useNoteStore = create<NoteStoreType>((set) => ({
  title: "",
  setValue: (type, value) =>
    set({
      [type]: value,
    }),
  onReset: () =>
    set({
      title: "",
    }),
}));
