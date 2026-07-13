import { create } from "zustand";
import { addMonths, format, parse } from "date-fns";

type ChartStore = {
  date: string; // yyyyMM

  setDate: (type: "prev" | "next") => void;
  onReset: () => void;
};

const currentYearMonth = () => format(new Date(), "yyyyMM");

export const useChartStore = create<ChartStore>((set) => ({
  date: currentYearMonth(),

  // 기록 유무와 무관하게 ±1개월씩 이동 — 데이터가 없는 달은 각 차트가 빈 상태를 보여준다
  setDate: (type) =>
    set((prev) => ({
      date: format(
        addMonths(
          parse(prev.date, "yyyyMM", new Date()),
          type === "prev" ? -1 : 1,
        ),
        "yyyyMM",
      ),
    })),
  onReset: () => set({ date: currentYearMonth() }),
}));
