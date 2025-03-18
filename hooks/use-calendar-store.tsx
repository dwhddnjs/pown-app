import { create } from "zustand"
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  startOfWeek,
  endOfWeek,
  addMonths,
  subMonths,
  isSameDay,
} from "date-fns"

type CalendarTypes = {
  date: Date
  prevMonth: () => void
  nextMonth: () => void
}
const initialData = new Date()

export const useCalendarStore = create<CalendarTypes>((set) => ({
  date: initialData,
  prevMonth: () =>
    set((prev) => ({
      date: subMonths(prev.date, 1),
    })),

  nextMonth: () =>
    set((prev) => ({
      date: addMonths(prev.date, 1),
    })),
}))
