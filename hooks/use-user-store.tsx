import { workoutData } from "@/constants/constants";
import { storage } from "@/lib/storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { getLocales } from "expo-localization";
import type { Lang } from "@/lib/i18n";

export type UserInfoTypes = {
  height: string | null;
  age: string | null;
  weight: string | null;
  gender: "male" | "female" | null;
  bp: string | null;
  sq: string | null;
  dl: string | null;
  createdAt: string;
};

export type UserTypes = {
  userInfo: UserInfoTypes[];
  workoutList: Record<"back" | "chest" | "shoulder" | "leg" | "arm", string[]>;
  theme: "light" | "dark" | "system";
  // null = 미선택 → 기기 언어를 따라간다 (useLanguage)
  language: Lang | null;
  setUser: (
    type: keyof Omit<
      UserTypes,
      | "setUser"
      | "setUserData"
      | "onReset"
      | "setAddWorkoutTag"
      | "setRemoveWorkoutTag"
    >,
    value:
      | string
      | boolean
      | UserInfoTypes[]
      | UserTypes["workoutList"]
      | Lang,
  ) => void;
  setUserData: (value: UserInfoTypes) => void;
  onReset: () => void;
  setAddWorkoutTag: (
    type: "back" | "chest" | "shoulder" | "leg" | "arm",
    tag: string,
  ) => void;
  setRemoveWorkoutTag: (
    type: "back" | "chest" | "shoulder" | "leg" | "arm",
    tag: string,
  ) => void;
};

export const useUserStore = create<UserTypes>()(
  persist(
    (set) => ({
      workoutList: workoutData,
      userInfo: [],
      theme: "system",
      language: null,
      setUserData: (value) =>
        set((prev) => ({
          ...prev,
          userInfo: [...prev.userInfo, value],
        })),
      setUser: (type, value) =>
        set({
          [type]: value,
        }),
      onReset: () =>
        set({
          userInfo: [],
          workoutList: workoutData,
          theme: "system",
          language: null,
        }),

      setAddWorkoutTag: (type, tag) =>
        set((prev) => ({
          ...prev,
          workoutList: {
            ...prev.workoutList,
            [type]: [...prev.workoutList[type], tag],
          },
        })),
      setRemoveWorkoutTag: (type, tag) =>
        set((prev) => ({
          ...prev,
          workoutList: {
            ...prev.workoutList,
            [type]: prev.workoutList[type].filter((item) => item !== tag),
          },
        })),
    }),
    {
      name: "user",
      storage: createJSONStorage(() => storage),
    },
  ),
);

const deviceLang = (): Lang =>
  getLocales()[0]?.languageCode === "ko" ? "ko" : "en";

// 명시 선택이 없으면 기기 언어. 훅 밖(lib의 토스트 등)에서는 getLanguage() 사용.
export const useLanguage = (): Lang =>
  useUserStore((s) => s.language) ?? deviceLang();

export const getLanguage = (): Lang =>
  useUserStore.getState().language ?? deviceLang();
