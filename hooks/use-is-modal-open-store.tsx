import { create } from "zustand"

type IsModalOpenStoreTypes = {
  open: boolean
  setOpen: (value: boolean) => void
}

export const useIsModalOpenStore = create<IsModalOpenStoreTypes>((set) => ({
  open: false,
  setOpen: (value) => set({ open: value }),
}))
