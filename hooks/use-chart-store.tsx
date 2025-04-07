import { create } from "zustand"
import { WorkoutPlanTypes } from "./use-workout-plan-store"
import { removeSameItem } from "@/lib/function"
import { WorkoutTypes } from "./use-plan-store"
import { toast } from "sonner-native"

type ChartStore = {
  date: string

  setDate: (type: string, list: WorkoutPlanTypes[]) => void
  onReset: () => void
}
const initialData = new Date().toISOString().slice(0, 7).replace("-", "")

export const useChartStore = create<ChartStore>((set) => ({
  date: initialData,

  setDate: (type, list) =>
    set((prev) => {
      const currentDate = prev.date
      const currentYear = currentDate.slice(0, 4)
      const currentMonth = currentDate.slice(4, 6)

      const removeSameDateItemList = removeSameItem(list)
      const sorted = removeSameDateItemList.sort(
        (a: any, b: any) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )

      const seen = new Set<string>()
      const monthList = sorted.filter((log: any) => {
        const yearMonth = log.createdAt.slice(0, 7)
        if (seen.has(yearMonth)) return false
        seen.add(yearMonth)
        return true
      })

      const findIndex = monthList.findIndex((item: WorkoutPlanTypes) => {
        const [year, month] = item.createdAt.split(".")
        return year === currentYear && month === currentMonth
      })

      let newDate = currentDate

      if (type === "prev") {
        const prevItem = monthList[findIndex + 1]
        if (!prevItem) return { date: currentDate } // 없으면 유지
        const [year, month] = prevItem.createdAt.split(".")
        newDate = `${year}${month}`
      } else if (type === "next") {
        const nextItem = monthList[findIndex - 1]
        if (!nextItem) return { date: currentDate }

        const [year, month] = nextItem.createdAt.split(".")
        newDate = `${year}${month}`
      }
      if (newDate === currentDate) return prev
      return { date: newDate }
    }),
  onReset: () =>
    set({
      date: "",
    }),
}))
