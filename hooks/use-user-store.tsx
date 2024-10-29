import { storage } from "@/lib/storage"
import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"

export type UserTypes = {
  height: string | null
  age: string | null
  weight: string | null
  gender: "male" | "female" | null
  bp: string | null
  sq: string | null
  dl: string | null
  theme: "light" | "dark" | "system"
  setUser: (type: string, value: string) => void
  setUserData: (
    value:
      | Pick<UserTypes, "bp" | "sq" | "dl">
      | Pick<UserTypes, "height" | "age" | "gender" | "weight">
  ) => void
  onReset: () => void
}

export const useUserStore = create<UserTypes>()(
  persist(
    (set) => ({
      height: null,
      age: null,
      weight: null,
      gender: null,
      bp: null,
      sq: null,
      dl: null,
      theme: "system",
      setUserData: (value) =>
        set((prev) => ({
          ...prev,
          ...value,
        })),
      setUser: (type, value) =>
        set({
          [type]: value,
        }),

      onReset: () =>
        set({
          height: null,
          age: null,
          weight: null,
          gender: null,
          bp: null,
          sq: null,
          dl: null,
          theme: "system",
        }),
    }),
    {
      name: "user",
      storage: createJSONStorage(() => storage),
    }
  )
)
