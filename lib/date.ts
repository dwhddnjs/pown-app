import { parse } from "date-fns"

// 프로젝트 전역 날짜 저장 포맷 (CLAUDE.md)
export const PLAN_DATE_FORMAT = "yyyy.MM.dd HH:mm:ss"

export const parsePlanDate = (value: string) =>
  parse(value, PLAN_DATE_FORMAT, new Date())

export const sortByCreatedAtDesc = <T extends { createdAt: string }>(
  list: T[]
): T[] =>
  [...list].sort(
    (a, b) => parsePlanDate(b.createdAt).getTime() - parsePlanDate(a.createdAt).getTime()
  )
