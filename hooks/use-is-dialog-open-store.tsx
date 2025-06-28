import { create } from "zustand"

type UseIsDialogOpenStoreTypes = {
  open: boolean
  setOpen: (value: boolean) => void
}

export const useIsDialogOpenStore = create<UseIsDialogOpenStoreTypes>(
  (set) => ({
    open: false,
    setOpen: (value) => set({ open: value }),
  })
)
