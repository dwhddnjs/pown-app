import { create } from "zustand"
import { addMonths, subMonths, isAfter, startOfMonth } from "date-fns"

type CalendarTypes = {
  date: Date
  prevMonth: () => void
  nextMonth: () => void
}

export const useCalendarStore = create<CalendarTypes>((set) => ({
  date: new Date(),
  prevMonth: () =>
    set((prev) => ({
      date: subMonths(prev.date, 1),
    })),

  // 미래 달 진입 방지 — 현재 달까지만 이동할 수 있다
  nextMonth: () =>
    set((prev) => {
      const next = addMonths(prev.date, 1)
      if (isAfter(startOfMonth(next), startOfMonth(new Date()))) {
        return prev
      }
      return { date: next }
    }),
}))
