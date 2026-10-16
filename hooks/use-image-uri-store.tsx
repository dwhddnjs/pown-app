import { create } from "zustand";

type ImageUriStoreType = {
  uri: string;
  // 사진 뷰어를 자기 안에서 띄우는 시트 화면 수 — 0이면 루트가 띄운다 (image-modal.tsx)
  hosts: number;
  setImageUri: (uri: string) => void;
  onResetImageUri: () => void;
  addHost: () => void;
  removeHost: () => void;
};

export const useImageUriStore = create<ImageUriStoreType>((set) => ({
  uri: "",
  hosts: 0,
  setImageUri: (uri) =>
    set({
      uri: uri,
    }),
  onResetImageUri: () =>
    set({
      uri: "",
    }),
  addHost: () => set((prev) => ({ hosts: prev.hosts + 1 })),
  removeHost: () => set((prev) => ({ hosts: Math.max(0, prev.hosts - 1) })),
}));
