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
    set((prev) => {
      const next = format(
        addMonths(
          parse(prev.date, "yyyyMM", new Date()),
          type === "prev" ? -1 : 1,
        ),
        "yyyyMM",
      );
      // 미래 달 진입 방지 — yyyyMM은 사전순 비교가 시간순 비교와 일치한다
      if (type === "next" && next > currentYearMonth()) {
        return prev;
      }
      return { date: next };
    }),
  onReset: () => set({ date: currentYearMonth() }),
}));
