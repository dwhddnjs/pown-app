import Colors from "@/constants/Colors"
import { WorkoutPlanTypes } from "@/hooks/use-workout-plan-store"
import { format, parseISO } from "date-fns"

export const groupByDate = (arr: WorkoutPlanTypes[]) => {
  return arr.reduce<Record<string, WorkoutPlanTypes[]>>((acc, cur) => {
    const date = cur.createdAt.split(" ")[0]
    if (!acc[date]) {
      acc[date] = []
    }
    acc[date].push(cur)
    return acc
  }, {})
}

export const formatTime = (value: string) => {
  const splitValue = value.split(" ")
  const splitValueAgain = splitValue[1].split(":")
  return `${splitValueAgain[0]}:${splitValueAgain[1]}`
}

export const formatDate = (value: string) => {
  const splitValue = value.split(".")
  return `${splitValue[0]}년 ${splitValue[1]}월 ${splitValue[2]}일`
}

export const setColor = (color: string, type: string) => {
  return {
    [type]: color,
  }
}

interface MonthGroup {
  title: string
  content: string[]
}

interface YearGroup {
  title: string
  content: MonthGroup[]
}

export const transformWorkoutData = (data: WorkoutPlanTypes[]) => {
  const groupedData: Record<string, Record<string, Set<string>>> = {}

  data.forEach((item) => {
    const date = new Date(item.createdAt.replace(".", "-").replace(".", "-"))
    const year = `${date.getFullYear()}년`
    const month = `${date.getMonth() + 1}월`
    const day = `${date.getDate()}일`

    if (!groupedData[year]) {
      groupedData[year] = {}
    }
    if (!groupedData[year][month]) {
      groupedData[year][month] = new Set()
    }

    groupedData[year][month].add(day)
  })

  return Object.entries(groupedData)
    .sort((a, b) => b[0].localeCompare(a[0]))
    .map(([year, months]) => ({
      title: year,
      content: Object.entries(months)
        .sort((a, b) => parseInt(b[0]) - parseInt(a[0]))
        .map(([month, days]) => ({
          title: month,
          content: Array.from(days).sort((a, b) => parseInt(b) - parseInt(a)),
        })),
    }))
}
