const planData = {
  id: 1,
  type: "back",
  workout: "바벨로우",
  totalSet: 10,
  maxWeight: {
    weight: 100,
    count: 1,
  },
  createdAt: "9시 30분",
  condition: ["화남", "피곤함", "우울함", "신남"],
  comment: "아 진짜 개빡치네 너무 아쉽게 못 들었음",
}

export const equipmentData: string[] = [
  "바벨",
  "덤벨",
  "머신",
  "스미스",
  "케이블",
  "맨몸",
]

export const workoutData: {
  [key: string]: string[]
} = {
  back: [
    "풀업",
    "시티드로우",
    "랫풀다운",
    "로우",
    "하이로우",
    "로우로우",
    "암풀다운",
    "슈러그",
  ],
  chest: [
    "인클라인프레스",
    "디클라인프레스",
    "벤치프레스",
    "케이블플라이",
    "팩덱플라이",
  ],
  shoulder: [
    "프론트레이즈",
    "사이드레터럴레이즈",
    "케이블푸쉬다운",
    "밀리터리프레스",
    "오버헤드프레스",
    "업라이트로우",
  ],
  leg: [
    "스쿼트",
    "브이스쿼트",
    "핵스쿼트",
    "인어싸이",
    "아웃싸이",
    "카프레이즈",
    "데드리프트",
    "레그익스텐션",
    "레그컬",
    "레그프레스",
    "스플릿 스쿼트",
    "런지",
    "힙쓰러스트",
  ],
  arm: [
    "해머컬",
    "바벨컬",
    "덤벨컬",
    "케이블컬",
    "리버스컬",
    "리스트컬",
    "리버스리스트컬",
  ],
}

export const setData = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"]
export const setTypeData = ["웜업", "본 세트", "PR", "연습"]
export const countData = [
  "1 + α",
  "2 + α",
  "3 + α",
  "4 + α",
  "5 + α",
  "6 + α",
  "7 + α",
  "8 + α",
  "9 + α",
  "10 + α",
  "11 + α",
  "12 + α",
  "13 + α",
  "14 + α",
  "15 + α",
]

export const conditionData = [
  {
    id: 1,
    condition: "좋음",
  },
  {
    id: 2,
    condition: "피곤함",
  },
  {
    id: 3,
    condition: "화남",
  },
  {
    id: 4,
    condition: "아픔",
  },
  {
    id: 5,
    condition: "슬픔",
  },
  {
    id: 6,
    condition: "신남",
  },
  {
    id: 7,
    condition: "상쾌함",
  },
  {
    id: 8,
    condition: "양호함",
  },
  {
    id: 9,
    condition: "짜증남",
  },
]
