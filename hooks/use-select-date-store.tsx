import { create } from "zustand"

type SelectDateStoreTypes = {
  date: string
  onSetDate: (value: string) => void
}

export const useSelectDateStore = create<SelectDateStoreTypes>((set) => ({
  date: "",
  onSetDate: (value) =>
    set({
      date: value,
    }),
}))
