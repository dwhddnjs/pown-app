import { workoutData } from "@/constants/constants"
import { storage } from "@/lib/storage"
import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"

export type UserInfoTypes = {
  height: string | null
  age: string | null
  weight: string | null
  gender: "male" | "female" | null
  bp: string | null
  sq: string | null
  dl: string | null
  createdAt: string
}

export type UserTypes = {
  userInfo: UserInfoTypes[]
  workoutList: Record<"back" | "chest" | "shoulder" | "leg" | "arm", string[]>
  theme: "light" | "dark" | "system"
  camera: boolean
  mediaLibrary: boolean
  microphone: boolean
  setUser: (type: string, value: string | boolean) => void
  setUserData: (value: UserInfoTypes) => void
  onReset: () => void
  setAddWorkoutTag: (
    type: "back" | "chest" | "shoulder" | "leg" | "arm",
    tag: string
  ) => void
  setRemoveWorkoutTag: (
    type: "back" | "chest" | "shoulder" | "leg" | "arm",
    tag: string
  ) => void
}

export const useUserStore = create<UserTypes>()(
  persist(
    (set) => ({
      workoutList: workoutData,
      camera: false,
      mediaLibrary: false,
      microphone: false,
      userInfo: [],
      theme: "system",
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
          theme: "system",
          camera: false,
          mediaLibrary: false,
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
    }
  )
)
