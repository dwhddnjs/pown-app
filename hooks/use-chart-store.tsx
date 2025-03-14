import { create } from "zustand"

type ChartStore = {
  date: string

  setDate: (type: string) => void
  onReset: () => void
}
const initialData = new Date().toISOString().slice(0, 7).replace("-", "")

export const useChartStore = create<ChartStore>((set) => ({
  date: initialData,

  setDate: (type) =>
    set((prev) => {
      if (type === "prev") {
        if (prev.date.slice(4, 6) === "01") {
          const year = parseInt(prev.date.slice(0, 4)) - 1
          return {
            date: `${year}12`,
          }
        }
        return {
          date: String(parseInt(prev.date) - 1),
        }
      }
      if (type === "next") {
        if (prev.date.slice(4, 6) === "12") {
          const year = parseInt(prev.date.slice(0, 4)) + 1
          return {
            date: `${year}01`,
          }
        }
        return {
          date: String(parseInt(prev.date) + 1),
        }
      }
      return {
        date: initialData,
      }
    }),
  onReset: () =>
    set({
      date: "",
    }),
}))
