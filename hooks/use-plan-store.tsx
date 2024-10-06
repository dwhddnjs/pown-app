import { create } from "zustand"

type PlanStoreType = {
  workout: string
  type: string
  set: string
  count: string
  condition: string[]
  note: {
    title: string
    content: string
  }
  setPlanValue: (type: string, value: any) => void
  onReset: () => void
}

export const usePlanStore = create<PlanStoreType>((set) => ({
  workout: "",
  type: "",
  set: "",
  count: "",
  condition: [],
  note: {
    title: "",
    content: "",
  },
  setPlanValue: (type, value) =>
    set({
      [type]: value,
    }),
  onReset: () =>
    set({
      workout: "",
      type: "",
      set: "",
      count: "",
      condition: [],
      note: {
        title: "",
        content: "",
      },
    }),
}))
