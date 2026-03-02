import { UserInfoTypes } from "@/hooks/use-user-store"
import { WorkoutPlanTypes } from "@/hooks/use-workout-plan-store"
import { parse } from "date-fns"

type WorkoutTypeCount = Record<
  "chest" | "back" | "arm" | "leg" | "shoulder",
  number
>

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
  if (!value) return ""
  const splitValue = value.split(" ")
  if (!splitValue[1]) return ""
  const splitValueAgain = splitValue[1].split(":")
  return `${splitValueAgain[0]}:${splitValueAgain[1]}`
}

export const formatDate = (value: string) => {
  if (!value) return ""
  const splitValue = value.split(".")
  if (!splitValue[0] || !splitValue[1] || !splitValue[2]) return value
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
    const date = new Date(item.createdAt.replaceAll(".", "-"))
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

export const sortWorkoutPlanList = (
  list: WorkoutPlanTypes[]
): WorkoutTypeCount => {
  const result: WorkoutTypeCount = {
    chest: 0,
    back: 0,
    arm: 0,
    leg: 0,
    shoulder: 0,
  }
  return list.reduce<WorkoutTypeCount>((acc, item) => {
    const key = item.type as keyof WorkoutTypeCount
    if (key in acc) {
      acc[key] = (acc[key] || 0) + 1
    }
    return acc
  }, { ...result })
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

type ConditionCountResult = {
  good: number
  tired: number
  angry: number
  sick: number
  sad: number
  lol: number
  cool: number
  neutral: number
  anoy: number
}

const CONDITION_MAP: Record<string, keyof ConditionCountResult> = {
  좋음: "good",
  피곤함: "tired",
  화남: "angry",
  아픔: "sick",
  슬픔: "sad",
  신남: "lol",
  상쾌함: "cool",
  양호함: "neutral",
  짜증남: "anoy",
}

export const getConditionCount = (
  workoutPlanList: WorkoutPlanTypes[]
): ConditionCountResult => {
  const countMap = new Map<keyof ConditionCountResult, number>([
    ["good", 0],
    ["tired", 0],
    ["angry", 0],
    ["sick", 0],
    ["sad", 0],
    ["lol", 0],
    ["cool", 0],
    ["neutral", 0],
    ["anoy", 0],
  ])

  const conditionList = workoutPlanList.flatMap((item) => item.condition)

  for (const item of conditionList) {
    const key = CONDITION_MAP[item]
    if (key) {
      countMap.set(key, (countMap.get(key) ?? 0) + 1)
    }
  }

  return Object.fromEntries(countMap) as ConditionCountResult
}

export const convertConditionType = (
  type: string
): keyof ConditionCountResult | undefined => {
  switch (type) {
    case "좋음":
      return "good"
    case "피곤함":
      return "tired"
    case "화남":
      return "angry"
    case "아픔":
      return "sick"
    case "슬픔":
      return "sad"
    case "신남":
      return "lol"
    case "상쾌함":
      return "cool"
    case "양호함":
      return "neutral"
    case "짜증남":
      return "anoy"
    default:
      return undefined
  }
}

type EquipmentCountResult = {
  babel: number
  dumbel: number
  machine: number
  smith: number
  cable: number
  body: number
}

const EQUIPMENT_MAP: Record<string, keyof EquipmentCountResult> = {
  바벨: "babel",
  덤벨: "dumbel",
  머신: "machine",
  스미스: "smith",
  케이블: "cable",
  맨몸: "body",
}

export const getEquipmentCount = (
  data: WorkoutPlanTypes[]
): EquipmentCountResult => {
  const countMap = new Map<keyof EquipmentCountResult, number>([
    ["babel", 0],
    ["dumbel", 0],
    ["machine", 0],
    ["smith", 0],
    ["cable", 0],
    ["body", 0],
  ])

  for (const item of data) {
    const key = EQUIPMENT_MAP[item.equipment]
    if (key) {
      countMap.set(key, (countMap.get(key) ?? 0) + 1)
    }
  }

  return Object.fromEntries(countMap) as EquipmentCountResult
}

export const convertChartDate = (date: string) => {
  if (!date) {
    return ""
  }
  const year = date.slice(0, 4)
  const month = date.slice(4, 6)
  return `${year}년 ${month}월`
}

type BodyDataItem = { id: number; value: number; date: string }

export const removeSameItem = <T extends { createdAt: string }>(
  arr: T[]
): T[] => {
  return arr.reduce<T[]>((acc, item) => {
    const dateKey = item.createdAt.split(" ")[0] // YYYY.MM.DD만 추출
    const parsedDate = parse(
      item.createdAt,
      "yyyy.MM.dd HH:mm:ss",
      new Date()
    ).valueOf()
    const existingIndex = acc.findIndex((el) =>
      el.createdAt.startsWith(dateKey)
    )
    if (existingIndex === -1) {
      acc.push(item)
    } else {
      const existingDate = parse(
        acc[existingIndex].createdAt,
        "yyyy.MM.dd HH:mm:ss",
        new Date()
      ).valueOf()

      if (parsedDate > existingDate) {
        acc[existingIndex] = item
      }
    }
    return acc
  }, [])
}

export const getMonthlyBodyData = (
  rawData: Pick<UserInfoTypes, "createdAt" | "weight">[],
  yearMonth: string
): BodyDataItem[] => {
  const year = yearMonth.slice(0, 4)
  const month = yearMonth.slice(4, 6)

  const filterPlanListData = rawData.filter((item) => {
    return (
      item.createdAt.slice(0, 4) === year &&
      item.createdAt.slice(5, 7) === month
    )
  })

  const removeSameDateItem = removeSameItem(filterPlanListData)

  const processedData = removeSameDateItem.map((item) => {
    const y = item.createdAt.slice(0, 4)
    const m = item.createdAt.slice(5, 7)
    const d = item.createdAt.slice(8, 10)
    return {
      value: item.weight ?? "0",
      date: `${y}년 ${m}월 ${d}일`,
    }
  })
  const daysInMonth = new Date(parseInt(year, 10), parseInt(month, 10), 0).getDate()

  const result: BodyDataItem[] = []
  for (let day = 1; day <= daysInMonth; day++) {
    result.push({
      id: day,
      value: 0,
      date: `${year}년 ${month}월 ${String(day).padStart(2, "0")}일`,
    })
  }

  return result.map((item) => {
    const findItem = processedData.find((el) => el.date === item.date)
    return {
      ...item,
      value: findItem ? parseInt(findItem.value, 10) : item.value,
    }
  })
}

export const getInitialConsonant = (str: string) => {
  if (!str) return ""
  const firstChar = str.charCodeAt(0)
  if (firstChar < 0xac00 || firstChar > 0xd7a3) return str[0]
  const firstConsonant = Math.floor((firstChar - 0xac00) / 28 / 21)
  const initialConsonants = [
    "ㄱ",
    "ㄲ",
    "ㄴ",
    "ㄷ",
    "ㄸ",
    "ㄹ",
    "ㅁ",
    "ㅂ",
    "ㅃ",
    "ㅅ",
    "ㅆ",
    "ㅇ",
    "ㅈ",
    "ㅉ",
    "ㅊ",
    "ㅋ",
    "ㅌ",
    "ㅍ",
    "ㅎ",
  ]
  return initialConsonants[firstConsonant]
}

// 초성 검색 함수
export const searchByInitial = (name: string, search: string) => {
  const initial = getInitialConsonant(name)
  return initial === search
}
