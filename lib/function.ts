import { WorkoutPlanTypes } from "@/hooks/use-workout-plan-store"
import { addDays, format, lastDayOfMonth, parse, parseISO } from "date-fns"

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

export const getConditionCount = (workoutPlanList: WorkoutPlanTypes[]) => {
  const result = {
    good: 0,
    tired: 0,
    angry: 0,
    sick: 0,
    sad: 0,
    lol: 0,
    cool: 0,
    neutral: 0,
    anoy: 0,
  }
  const getConditionList = workoutPlanList
    .map((item: WorkoutPlanTypes) => item.condition)
    .flat()

  return getConditionList.reduce((acc: any, item: string) => {
    if (item === "좋음") {
      acc["good"] = (acc["good"] || 0) + 1
    }
    if (item === "피곤함") {
      acc["tired"] = (acc["tired"] || 0) + 1
    }
    if (item === "화남") {
      acc["angry"] = (acc["angry"] || 0) + 1
    }
    if (item === "아픔") {
      acc["sick"] = (acc["sick"] || 0) + 1
    }
    if (item === "슬픔") {
      acc["sad"] = (acc["sad"] || 0) + 1
    }
    if (item === "신남") {
      acc["lol"] = (acc["lol"] || 0) + 1
    }
    if (item === "상쾌함") {
      acc["cool"] = (acc["cool"] || 0) + 1
    }
    if (item === "양호함") {
      acc["neutral"] = (acc["neutral"] || 0) + 1
    }
    if (item === "짜증남") {
      acc["anoy"] = (acc["anoy"] || 0) + 1
    }
    return acc
  }, result)
}

export const convertConditionType = (type: string) => {
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
  }
}

export const getEquipmentCount = (data: WorkoutPlanTypes[]) => {
  const result = {
    babel: 0,
    dumbel: 0,
    machine: 0,
    smith: 0,
    cable: 0,
    body: 0,
  }
  const equipmentList = data.map((item: WorkoutPlanTypes) => item.equipment)

  return equipmentList.reduce((acc: any, item: string) => {
    if (item === "바벨") {
      acc["babel"] = (acc["babel"] || 0) + 1
    }
    if (item === "덤벨") {
      acc["dumbel"] = (acc["dumbel"] || 0) + 1
    }
    if (item === "머신") {
      acc["machine"] = (acc["machine"] || 0) + 1
    }
    if (item === "스미스") {
      acc["smith"] = (acc["smith"] || 0) + 1
    }
    if (item === "케이블") {
      acc["cable"] = (acc["cable"] || 0) + 1
    }
    if (item === "맨몸") {
      acc["body"] = (acc["body"] || 0) + 1
    }
    return acc
  }, result)
}

export const convertChartDate = (date: string) => {
  if (!date) {
    return ""
  }
  const year = date.slice(0, 4)
  const month = date.slice(4, 6)
  return `${year}년 ${month}월`
}

type RawData = {
  age: string
  bp: string
  createdAt: string
  dl: string
  gender: string
  height: string
  sq: string
  weight: string
}

type ProcessedData = { id: number; value: number; date: string }

export const removeSameItem = (arr: any) => {
  return arr.reduce((acc: any, item: any) => {
    const dateKey = item.createdAt.split(" ")[0] // YYYY.MM.DD만 추출
    const parsedDate = parse(
      item.createdAt,
      "yyyy.MM.dd HH:mm:ss",
      new Date()
    ).valueOf()
    const existingIndex = acc.findIndex((el: any) =>
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

export const getMonthlyBodyData = (rawData: any[], yearMonth: string) => {
  const year = yearMonth.slice(0, 4)
  const month = yearMonth.slice(4, 6)

  // 해당 월 데이터 필터링
  const filterPlanListData = rawData.filter((item) => {
    return (
      item.createdAt.slice(0, 4) === year &&
      item.createdAt.slice(5, 7) === month
    )
  })

  // 중복 제거 (함수 정의 필요)
  const removeSameDateItem = removeSameItem(filterPlanListData)

  // 필요한 데이터만 추출하여 변환
  const processedData = removeSameDateItem.map((item: any) => {
    const year = item.createdAt.slice(0, 4)
    const month = item.createdAt.slice(5, 7)
    const day = item.createdAt.slice(8, 10)
    return {
      value: item.weight,
      date: `${year}년 ${month}월 ${day}일`,
    }
  })
  const daysInMonth = new Date(parseInt(year), parseInt(month), 0).getDate()

  const result = []
  for (let day = 1; day <= daysInMonth; day++) {
    result.push({
      id: day,
      value: 0,
      date: `${year}년 ${month}월 ${day}일`,
    })
  }

  return result.map((item) => {
    const findItem = processedData.find(
      (el: (typeof processedData)[0]) => el.date === item.date
    )
    return {
      ...item,
      value: findItem ? parseInt(findItem.value, 10) : item.value,
    }
  })
}

export const getInitialConsonant = (str: string) => {
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

// const mockup = [
//   { date: "2025년 03월 01일", value: "70" },
//   { date: "2025년 03월 02일", value: "70" },
//   { date: "2025년 03월 03일", value: "70" },
//   { date: "2025년 03월 04일", value: "70" },
//   { date: "2025년 03월 05일", value: "70" },
//   { date: "2025년 03월 06일", value: "70" },
//   { date: "2025년 03월 07일", value: "70" },
//   { date: "2025년 03월 08일", value: "70" },
//   { date: "2025년 03월 09일", value: "70" },
//   { date: "2025년 03월 10일", value: "70" },
//   { date: "2025년 03월 11일", value: "70" },
//   { date: "2025년 03월 12일", value: "70" },
//   { date: "2025년 03월 13일", value: "70" },
//   { date: "2025년 03월 14일", value: "70" },
//   { date: "2025년 03월 15일", value: "80" },
//   { date: "2025년 03월 16일", value: "80" },
//   { date: "2025년 03월 17일", value: "80" },
//   { date: "2025년 03월 18일", value: "90" },
// ]
