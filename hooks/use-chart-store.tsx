import { create } from "zustand";
import { WorkoutPlanTypes } from "./use-workout-plan-store";
import { removeSameItem } from "@/lib/function";
import { parse } from "date-fns";

type ChartStore = {
  date: string;

  setDate: (type: "prev" | "next", list: WorkoutPlanTypes[]) => void;
  onReset: () => void;
};
const initialData = new Date().toISOString().slice(0, 7).replace("-", "");

export const useChartStore = create<ChartStore>((set) => ({
  date: initialData,

  setDate: (type, list) =>
    set((prev) => {
      const currentDate = prev.date;
      const currentYear = currentDate.slice(0, 4);
      const currentMonth = currentDate.slice(4, 6);

      const removeSameDateItemList = removeSameItem(list);
      const sorted = removeSameDateItemList.sort(
        (a: WorkoutPlanTypes, b: WorkoutPlanTypes) =>
          parse(b.createdAt, "yyyy.MM.dd HH:mm:ss", new Date()).getTime() -
          parse(a.createdAt, "yyyy.MM.dd HH:mm:ss", new Date()).getTime(),
      );

      const seen = new Set<string>();
      const monthList = sorted.filter((log: WorkoutPlanTypes) => {
        const yearMonth = log.createdAt.slice(0, 7);
        if (seen.has(yearMonth)) return false;
        seen.add(yearMonth);
        return true;
      });

      const findIndex = monthList.findIndex((item: WorkoutPlanTypes) => {
        const [year, month] = item.createdAt.split(".");
        return year === currentYear && month === currentMonth;
      });

      if (findIndex === -1) return prev;

      let newDate = currentDate;

      if (type === "prev") {
        const prevItem = monthList[findIndex + 1];
        if (!prevItem) return prev;
        const [year, month] = prevItem.createdAt.split(".");
        newDate = `${year}${month}`;
      } else if (type === "next") {
        const nextItem = monthList[findIndex - 1];
        if (!nextItem) return prev;
        const [year, month] = nextItem.createdAt.split(".");
        newDate = `${year}${month}`;
      }
      if (newDate === currentDate) return prev;
      return { date: newDate };
    }),
  onReset: () =>
    set({
      date: "",
    }),
}));
