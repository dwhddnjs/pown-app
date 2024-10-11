import { create } from "zustand"

type PlanStoreType = {
  workout: string
  type: string
  equipment: string
  set: string
  count: string
  weight: string
  condition: string[]
  title: string
  content: string
  setPlanValue: (type: string, value: string | string[]) => void
  setCondition: (value: string) => void
  setFilterCondition: (value: string) => void
  onReset: () => void
}

export const usePlanStore = create<PlanStoreType>((set) => ({
  workout: "",
  type: "",
  set: "",
  count: "",
  weight: "",
  equipment: "바벨",
  condition: [],
  title: "",
  content: "",
  setCondition: (value) => {
    set((prev) => ({
      condition: [...prev.condition, value],
    }))
  },
  setFilterCondition: (value) => {
    set((prev) => ({
      condition: prev.condition.filter((item) => item !== value),
    }))
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
      weight: "",
      condition: [],
      title: "",
      content: "",
    }),
}))
