import { create } from "zustand"

export type WorkoutTypes = "chest" | "back" | "shoulder" | "leg" | "arm"

type ImageUriType = {
  id: number
  imageUri?: string
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

export type PlanStoreType = {
  workout: string
  type: string
  date: Date
  equipment: string
  weightType: "kg" | "lb"
  weight: string
  condition: string[]
  title: string
  content: string
  setWithCount: SetWithCountType[]
  imageUri: ImageUriType[]

  setImageUri: (uri: ImageUriType) => void
  setRemoveImageUri: (id: number) => void
  setPlanValue: (type: keyof Pick<PlanStoreType, "workout" | "type" | "equipment" | "weight" | "title" | "content" | "weightType">, value: string | string[]) => void
  setCondition: (value: string) => void
  setFilterCondition: (value: string) => void
  onReset: () => void
  setSetWithCount: (value: SetWithCountType) => void
  setFilterSetWithCount: (id: number) => void
  setDate: (date: Date) => void
  setPrevPlanValue: (
    value: Partial<
      Pick<
        PlanStoreType,
        | "workout"
        | "type"
        | "equipment"
        | "weight"
        | "condition"
        | "title"
        | "content"
        | "setWithCount"
        | "imageUri"
        | "date"
      >
    >
  ) => void
}

export const usePlanStore = create<PlanStoreType>((set) => ({
  date: new Date(),
  workout: "",
  type: "",
  weight: "",
  setWithCount: [],
  equipment: "바벨",
  condition: [],
  title: "",
  content: "",
  imageUri: [],
  weightType: "kg",

  setDate: (date) =>
    set({
      date,
    }),

  setImageUri: (uri) =>
    set((prev) => ({
      imageUri: [...prev.imageUri, uri],
    })),

  setRemoveImageUri: (id) =>
    set((prev) => ({
      imageUri: prev.imageUri.filter((item) => item.id !== id),
    })),

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
      equipment: "바벨",
      title: "",
      content: "",
      imageUri: [],
      date: new Date(),
      weightType: "kg",
    }),

  setPrevPlanValue: (value) =>
    set((prev) => ({
      workout: value.workout ?? prev.workout,
      type: value.type ?? prev.type,
      setWithCount: value.setWithCount ?? prev.setWithCount,
      weight: value.weight ?? prev.weight,
      condition: value.condition ?? prev.condition,
      equipment: value.equipment ?? prev.equipment,
      title: value.title ?? prev.title,
      content: value.content ?? prev.content,
      imageUri: value.imageUri ?? prev.imageUri,
      date: value.date ?? prev.date,
    })),
}))
