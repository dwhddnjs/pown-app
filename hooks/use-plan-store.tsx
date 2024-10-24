import { create } from "zustand"

export type PlanStoreType = {
  workout: string
  type: string
  equipment: string
  weight: string
  condition: string[]
  title: string
  content: string
  setWithCount: SetWithCountType[]
  setPlanValue: (type: string, value: string | string[]) => void
  setCondition: (value: string) => void
  setFilterCondition: (value: string) => void
  onReset: () => void
  setSetWithCount: (value: SetWithCountType) => void
  setFilterSetWithCount: (id: number) => void
}

export type ConditionTypes = {
  id: number
  condition: string
}

export type SetWithCountType = {
  id: number
  set: string
  count: string
  progress: "진행중" | "완료"
}

export const usePlanStore = create<PlanStoreType>((set) => ({
  workout: "",
  type: "",
  weight: "",
  setWithCount: [],
  equipment: "바벨",
  condition: [],
  title: "",
  content: "",

  setSetWithCount: (value) => {
    set((prev) => ({
      setWithCount: [...prev.setWithCount, value],
    }))
  },

  setFilterSetWithCount: (id) => {
    set((prev) => ({
      setWithCount: prev.setWithCount.filter((item) => item.id !== id),
    }))
  },

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
      setWithCount: [],
      weight: "",
      condition: [],
      title: "",
      content: "",
    }),
}))
