import { format } from "date-fns"
import { enUS, ko } from "date-fns/locale"
import type { Lang } from "@/lib/i18n"

// 프로젝트 전역 날짜 저장 포맷 (CLAUDE.md)
export const PLAN_DATE_FORMAT = "yyyy.MM.dd HH:mm:ss"

// 계획 추가 화면 상단의 날짜·시각 표시
export const formatPlanDateTime = (date: Date, lang: Lang) =>
  lang === "ko"
    ? format(date, "yyyy년 M월 d일 HH시 mm분", { locale: ko })
    : format(date, "MMM d, yyyy HH:mm", { locale: enUS })

// PLAN_DATE_FORMAT은 전부 0으로 채운 고정폭이라(yyyy.MM.dd HH:mm:ss) 문자열
// 사전순 = 시간순이다. date-fns parse를 비교자 안에서 부르면 n log n번 파싱하게 되는데,
// 1만 건이면 그것만 수백 ms다 (계획 하나 추가할 때마다).
export const sortByCreatedAtDesc = <T extends { createdAt: string }>(
  list: T[]
): T[] =>
  [...list].sort((a, b) =>
    a.createdAt < b.createdAt ? 1 : a.createdAt > b.createdAt ? -1 : 0
  )
