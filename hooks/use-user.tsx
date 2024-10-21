import { create } from "zustand"

export type UserTypes = {
  user:
    | undefined
    | {
        id: string
        email: string
        provider: string
        created_at: Date
        updated_at: Date
        name: string
        gender?: null
      }
  setUser: (value: any) => void
}

export const useUser = create<UserTypes>((set) => ({
  user: undefined,
  setUser: (value) =>
    set({
      user: value,
    }),
}))
