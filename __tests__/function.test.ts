import {
  groupByDate,
  formatTime,
  formatDate,
  sortWorkoutPlanList,
  convertChartValuesToPercentage,
  getInitialConsonant,
  searchByInitial,
  convertChartDate,
} from "../lib/function"

type WorkoutPlanTypes = {
  id: number
  workout: string
  type: string
  equipment: string
  weight: string
  condition: string[]
  content: string
  title: string
  setWithCount: {
    id: number
    set: string
    count: string
    progress: "진행중" | "완료"
  }[]
  imageUri: { id: number; imageUri?: string }[]
  createdAt: string
  updatedAt: string
}

const createMockPlan = (
  overrides: Partial<WorkoutPlanTypes>
): WorkoutPlanTypes => ({
  id: 1,
  workout: "벤치프레스",
  type: "chest",
  equipment: "바벨",
  weight: "80",
  condition: [],
  content: "",
  title: "",
  setWithCount: [],
  imageUri: [],
  createdAt: "2025.03.01 14:30:00",
  updatedAt: "2025.03.01 14:30:00",
  ...overrides,
})

describe("groupByDate", () => {
  it("날짜별로 운동 계획을 그룹화한다", () => {
    const plans: WorkoutPlanTypes[] = [
      createMockPlan({ id: 1, createdAt: "2025.03.01 10:00:00" }),
      createMockPlan({ id: 2, createdAt: "2025.03.01 14:00:00" }),
      createMockPlan({ id: 3, createdAt: "2025.03.02 10:00:00" }),
    ]

    const result = groupByDate(plans)

    expect(result["2025.03.01"]).toHaveLength(2)
    expect(result["2025.03.02"]).toHaveLength(1)
    expect(result["2025.03.01"][0].id).toBe(1)
    expect(result["2025.03.01"][1].id).toBe(2)
    expect(result["2025.03.02"][0].id).toBe(3)
  })

  it("빈 배열이면 빈 객체를 반환한다", () => {
    const result = groupByDate([])
    expect(result).toEqual({})
  })
})

describe("formatTime", () => {
  it("YYYY.MM.DD HH:MM:SS에서 HH:MM을 추출한다", () => {
    expect(formatTime("2025.03.01 14:30:45")).toBe("14:30")
  })

  it("자정 시간을 올바르게 추출한다", () => {
    expect(formatTime("2025.01.15 00:00:00")).toBe("00:00")
  })
})

describe("formatDate", () => {
  it("YYYY.MM.DD를 YYYY년 MM월 DD일로 변환한다", () => {
    expect(formatDate("2025.03.01")).toBe("2025년 03월 01일")
  })

  it("한 자리 월/일도 올바르게 변환한다", () => {
    expect(formatDate("2025.1.5")).toBe("2025년 1월 5일")
  })
})

describe("sortWorkoutPlanList", () => {
  it("운동 타입별 개수를 카운트한다", () => {
    const plans: WorkoutPlanTypes[] = [
      createMockPlan({ type: "chest" }),
      createMockPlan({ type: "chest" }),
      createMockPlan({ type: "back" }),
      createMockPlan({ type: "arm" }),
      createMockPlan({ type: "leg" }),
      createMockPlan({ type: "shoulder" }),
    ]

    const result = sortWorkoutPlanList(plans)

    expect(result.chest).toBe(2)
    expect(result.back).toBe(1)
    expect(result.arm).toBe(1)
    expect(result.leg).toBe(1)
    expect(result.shoulder).toBe(1)
  })

  it("빈 배열이면 모든 타입이 0이다", () => {
    const result = sortWorkoutPlanList([])
    expect(result).toEqual({
      chest: 0,
      back: 0,
      arm: 0,
      leg: 0,
      shoulder: 0,
    })
  })
})

describe("convertChartValuesToPercentage", () => {
  it("값을 퍼센트로 변환하고 text를 추가한다", () => {
    const data = [
      { value: 25, color: "#ff0000" },
      { value: 75, color: "#00ff00" },
    ]

    const result = convertChartValuesToPercentage(data) as {
      value: number
      color: string
      text: string
    }[]

    expect(result[0].value).toBe(25)
    expect(result[0].text).toBe("25%")
    expect(result[1].value).toBe(75)
    expect(result[1].text).toBe("75%")
  })

  it("총합이 0이면 원본 데이터를 그대로 반환한다", () => {
    const data = [
      { value: 0, color: "#ff0000" },
      { value: 0, color: "#00ff00" },
    ]

    const result = convertChartValuesToPercentage(data)

    expect(result).toEqual(data)
  })

  it("퍼센트를 반올림한다", () => {
    const data = [
      { value: 33, color: "#ff0000" },
      { value: 33, color: "#00ff00" },
      { value: 34, color: "#0000ff" },
    ]

    const result = convertChartValuesToPercentage(data)

    expect(result[0].value).toBe(33)
    expect(result[1].value).toBe(33)
    expect(result[2].value).toBe(34)
  })
})

describe("getInitialConsonant", () => {
  it("한글의 초성을 추출한다", () => {
    expect(getInitialConsonant("가")).toBe("ㄱ")
    expect(getInitialConsonant("나")).toBe("ㄴ")
    expect(getInitialConsonant("다")).toBe("ㄷ")
    expect(getInitialConsonant("바")).toBe("ㅂ")
    expect(getInitialConsonant("사")).toBe("ㅅ")
    expect(getInitialConsonant("아")).toBe("ㅇ")
    expect(getInitialConsonant("자")).toBe("ㅈ")
    expect(getInitialConsonant("하")).toBe("ㅎ")
  })

  it("한글이 아니면 첫 글자를 그대로 반환한다", () => {
    expect(getInitialConsonant("A")).toBe("A")
    expect(getInitialConsonant("1")).toBe("1")
  })
})

describe("searchByInitial", () => {
  it("초성이 일치하면 true를 반환한다", () => {
    expect(searchByInitial("가나다", "ㄱ")).toBe(true)
    expect(searchByInitial("바벨", "ㅂ")).toBe(true)
  })

  it("초성이 일치하지 않으면 false를 반환한다", () => {
    expect(searchByInitial("가나다", "ㄴ")).toBe(false)
    expect(searchByInitial("바벨", "ㄱ")).toBe(false)
  })
})

describe("convertChartDate", () => {
  it("YYYYMM을 YYYY년 MM월로 변환한다", () => {
    expect(convertChartDate("202503")).toBe("2025년 03월")
  })

  it("빈 문자열이면 빈 문자열을 반환한다", () => {
    expect(convertChartDate("")).toBe("")
  })

  it("1월을 올바르게 변환한다", () => {
    expect(convertChartDate("202501")).toBe("2025년 01월")
  })
})
