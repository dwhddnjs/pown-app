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
  theme: "light" | "dark" | "system"
  camera: boolean
  mediaLibrary: boolean
  setUser: (type: string, value: string | boolean) => void
  setUserData: (value: UserInfoTypes) => void
  onReset: () => void
}

export const useUserStore = create<UserTypes>()(
  persist(
    (set) => ({
      camera: false,
      mediaLibrary: false,
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
    }),
    {
      name: "user",
      storage: createJSONStorage(() => storage),
    }
  )
)
