import { format, parse } from "date-fns"
import { enUS, ko } from "date-fns/locale"
import type { Lang } from "@/lib/i18n"

// 프로젝트 전역 날짜 저장 포맷 (CLAUDE.md)
export const PLAN_DATE_FORMAT = "yyyy.MM.dd HH:mm:ss"

export const parsePlanDate = (value: string) =>
  parse(value, PLAN_DATE_FORMAT, new Date())

// 계획 추가 화면 상단의 날짜·시각 표시
export const formatPlanDateTime = (date: Date, lang: Lang) =>
  lang === "ko"
    ? format(date, "yyyy년 M월 d일 HH시 mm분", { locale: ko })
    : format(date, "MMM d, yyyy HH:mm", { locale: enUS })

export const sortByCreatedAtDesc =<T extends { createdAt: string }>(
  list: T[]
): T[] =>
  [...list].sort(
    (a, b) => parsePlanDate(b.createdAt).getTime() - parsePlanDate(a.createdAt).getTime()
  )
