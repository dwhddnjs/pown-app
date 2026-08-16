import { create } from "zustand"
import { ImageUriType, SetWithCountType } from "@/types/workout"

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
  setPlanValue: (type: PlanTextField, value: string | string[]) => void
  setCondition: (value: string) => void
  setFilterCondition: (value: string) => void
  onReset: () => void
  setSetWithCount: (value: SetWithCountType) => void
  setFilterSetWithCount: (id: number) => void
  setDate: (date: Date) => void
  setPrevPlanValue: (value: Partial<PlanFormValues>) => void
}

// 문자열 하나로 갈아끼우는 필드 (setPlanValue의 대상)
type PlanTextField =
  | "workout"
  | "type"
  | "equipment"
  | "weight"
  | "title"
  | "content"
  | "weightType"

// 액션을 뺀 폼 값 전체 — 수정 화면이 기존 기록으로 한 번에 채울 때 쓴다
type PlanFormValues = Pick<
  PlanStoreType,
  | PlanTextField
  | "condition"
  | "setWithCount"
  | "imageUri"
  | "date"
>

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

  // 스프레드 기반 — PlanStoreType에 필드를 추가해도 이 함수는 손댈 필요가 없다
  setPrevPlanValue: (value) =>
    set((prev) => ({
      ...prev,
      ...value,
    })),
}))
