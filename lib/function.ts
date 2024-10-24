import { WorkoutPlanTypes } from "@/hooks/use-workout-plan-store"

export const groupByDate = (arr: WorkoutPlanTypes[]) => {
  return arr.reduce<Record<string, WorkoutPlanTypes[]>>((acc, cur) => {
    const getTime = cur.createdAt as string
    const date = getTime.split("T")[0]
    if (!acc[date]) {
      acc[date] = []
    }
    acc[date].push(cur)
    return acc
  }, {})
}
