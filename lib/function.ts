import { getLanguage, UserInfoTypes } from "@/hooks/use-user-store"
import { WorkoutPlanTypes } from "@/hooks/use-workout-plan-store"
import { parsePlanDate } from "@/lib/date"
import { Lang } from "@/lib/i18n"

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

const EN_MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
]

const enMonth = (month: string) => EN_MONTHS[parseInt(month, 10) - 1] ?? month

// "2025.03.14" → "2025년 03월 14일" / "Mar 14, 2025"
export const formatDate = (value: string, lang: Lang = getLanguage()) => {
  if (!value) return ""
  const splitValue = value.split(".")
  if (!splitValue[0] || !splitValue[1] || !splitValue[2]) return value
  const [year, month, day] = splitValue
  if (lang === "ko") return `${year}년 ${month}월 ${day}일`
  return `${enMonth(month)} ${parseInt(day, 10)}, ${year}`
}

export const setColor = (color: string, type: string) => {
  return {
    [type]: color,
  }
}

// 드로어 폴더 트리. 그룹 키는 항상 숫자 문자열("2025"/"03"/"14")로 두고
// title(표시용)만 언어에 따라 만든다 — 정렬과 날짜 조립이 키에 걸려 있다.
export const transformWorkoutData = (
  data: WorkoutPlanTypes[],
  lang: Lang = getLanguage()
) => {
  const groupedData: Record<string, Record<string, Set<string>>> = {}

  data.forEach((item) => {
    const date = parsePlanDate(item.createdAt)
    const year = `${date.getFullYear()}`
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const day = String(date.getDate()).padStart(2, "0")

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
      value: year,
      title: lang === "ko" ? `${year}년` : year,
      content: Object.entries(months)
        .sort((a, b) => parseInt(b[0]) - parseInt(a[0]))
        .map(([month, days]) => ({
          value: month,
          title: lang === "ko" ? `${month}월` : enMonth(month),
          content: Array.from(days)
            .sort((a, b) => parseInt(b) - parseInt(a))
            .map((day) => ({
              value: day,
              title: lang === "ko" ? `${day}일` : String(parseInt(day, 10)),
            })),
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

export const convertChartDate = (date: string, lang: Lang = getLanguage()) => {
  if (!date) {
    return ""
  }
  const year = date.slice(0, 4)
  const month = date.slice(4, 6)
  return lang === "ko" ? `${year}년 ${month}월` : `${enMonth(month)} ${year}`
}

type BodyDataItem = { id: number; value: number; date: string; label: string }

// 같은 날짜(yyyy.MM.dd)의 항목은 가장 마지막 기록 하나만 남긴다 — 날짜 키 Map으로 O(n)
export const removeSameItem = <T extends { createdAt: string }>(
  arr: T[]
): T[] => {
  const byDate = new Map<string, T>()
  for (const item of arr) {
    const dateKey = item.createdAt.split(" ")[0]
    const existing = byDate.get(dateKey)
    if (
      !existing ||
      parsePlanDate(item.createdAt).valueOf() >
        parsePlanDate(existing.createdAt).valueOf()
    ) {
      byDate.set(dateKey, item)
    }
  }
  return Array.from(byDate.values())
}

// 기록이 있는 날만 데이터 포인트로 반환한다 — 빈 날을 0으로 채우면 라인이 0까지 곤두박질치는 삼각파형이 된다
export const getMonthlyBodyData = (
  rawData: Pick<UserInfoTypes, "createdAt" | "weight">[],
  yearMonth: string,
  lang: Lang = getLanguage()
): BodyDataItem[] => {
  const year = yearMonth.slice(0, 4)
  const month = yearMonth.slice(4, 6)

  const monthData = rawData.filter((item) => {
    return (
      item.createdAt.slice(0, 4) === year &&
      item.createdAt.slice(5, 7) === month
    )
  })

  return removeSameItem(monthData)
    .map((item) => {
      const day = parseInt(item.createdAt.slice(8, 10), 10)
      return {
        id: day,
        value: parseFloat(item.weight ?? "0"),
        date: `${year.slice(2)}/${month}/${String(day).padStart(2, "0")}`,
        label: lang === "ko" ? `${day}일` : String(day),
      }
    })
    .sort((a, b) => a.id - b.id)
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
