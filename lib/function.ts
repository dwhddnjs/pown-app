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
    const month = `${String(date.getMonth() + 1).padStart(2, "0")}월` // 월을 2자리로 변환
    const day = `${String(date.getDate()).padStart(2, "0")}일` // 일을 2자리로 변환

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

export const sortWorkoutPlanList = (list: WorkoutPlanTypes[]) => {
  const result = { chest: 0, back: 0, arm: 0, leg: 0, shoulder: 0 }
  return list.reduce((acc: any, item) => {
    acc[item.type] = (acc[item.type] || 0) + 1
    return acc
  }, result)
}

export const convertChartValuesToPercentage = (
  data: { value: number; color: string }[]
) => {
  const total = data.reduce((sum, item) => sum + item.value, 0)

  if (total === 0) return data

  return data.map((item) => ({
    ...item,
    value: Math.round(parseFloat(((item.value / total) * 100).toFixed(2))),
    text: `${Math.round(parseFloat(((item.value / total) * 100).toFixed(2)))}%`,
  }))
}
