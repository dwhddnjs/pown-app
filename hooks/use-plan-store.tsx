import { create } from "zustand";

export type WorkoutTypes = "chest" | "back" | "shoulder" | "leg" | "arm";

type ImageUriType = {
  id: number;
  imageUri?: string;
};

export type ConditionTypes = {
  id: number;
  condition: string;
};

export type SetWithCountType = {
  id: number;
  set: string;
  count: string;
  progress: "진행중" | "완료";
};

export type PlanStoreType = {
  workout: string;
  type: string;
  equipment: string;
  weightType: "kg" | "lb";
  weight: string;
  condition: string[];
  title: string;
  content: string;
  setWithCount: SetWithCountType[];
  imageUri: ImageUriType[];

  setImageUri: (uri: ImageUriType) => void;
  setRemoveImageUri: (id: number) => void;
  setPlanValue: (type: string, value: string | string[]) => void;
  setCondition: (value: string) => void;
  setFilterCondition: (value: string) => void;
  onReset: () => void;
  setSetWithCount: (value: SetWithCountType) => void;
  setFilterSetWithCount: (id: number) => void;
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
      >
    >
  ) => void;
};

export const usePlanStore = create<PlanStoreType>((set) => ({
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
    }));
  },

  setFilterSetWithCount: (id) => {
    set((prev) => ({
      setWithCount: prev.setWithCount.filter((item) => item.id !== id),
    }));
  },

  setCondition: (value) => {
    set((prev) => ({
      condition: [...prev.condition, value],
    }));
  },
  setFilterCondition: (value) => {
    set((prev) => ({
      condition: prev.condition.filter((item) => item !== value),
    }));
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
      weightType: "kg",
    }),

  setPrevPlanValue: (value: any) =>
    set({
      workout: value.workout,
      type: value.type,
      setWithCount: value.setWithCount,
      weight: value.weight,
      condition: value.condition,
      equipment: value.equipment,
      title: value.title,
      content: value.content,
      imageUri: value.imageUri,
    }),
}));
