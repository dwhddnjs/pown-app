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

export const transformWorkoutData = (data: WorkoutPlanTypes[]): YearGroup[] => {
  // Sort data by createdAt in descending order
  const sortedData = [...data].sort((a, b) =>
    a.createdAt > b.createdAt ? -1 : 1
  )

  const groupedByYear = sortedData.reduce<YearGroup[]>((acc, item) => {
    const year = item.createdAt.substring(0, 4)
    const month = item.createdAt.substring(5, 7)
    const day = item.createdAt.substring(8, 10)

    // Find or create year group
    let yearGroup = acc.find((y) => y.title === `${year}년`)
    if (!yearGroup) {
      yearGroup = {
        title: `${year}년`,
        content: [],
      }
      acc.push(yearGroup)
    }

    // Find or create month group
    const monthNumber = parseInt(month)
    let monthGroup = yearGroup.content.find(
      (m) => m.title === `${monthNumber}월`
    )
    if (!monthGroup) {
      monthGroup = {
        title: `${monthNumber}월`,
        content: [],
      }
      yearGroup.content.push(monthGroup)
    }

    // Add day if not already present
    const dayString = `${parseInt(day)}일`
    if (!monthGroup.content.includes(dayString)) {
      monthGroup.content.push(dayString)
    }

    return acc
  }, [])

  // Sort everything in descending order
  groupedByYear.forEach((year) => {
    // Sort months
    year.content.sort((a, b) => {
      const monthA = parseInt(a.title)
      const monthB = parseInt(b.title)
      return monthB - monthA
    })

    // Sort days within each month
    year.content.forEach((month) => {
      month.content.sort((a, b) => {
        const dayA = parseInt(a)
        const dayB = parseInt(b)
        return dayB - dayA
      })
    })
  })

  return groupedByYear
}
