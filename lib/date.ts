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

// "yyyy.MM.dd HH:mm:ss"는 자리수가 고정돼 있어 사전순 = 시간순이다.
// 비교 함수 안에서 parse를 부르면 정렬 한 번에 O(n log n)번 파싱하게 된다 —
// 계획을 추가/수정할 때마다 전체 목록을 다시 정렬하므로 그 비용이 그대로 드러난다.
export const sortByCreatedAtDesc = <T extends { createdAt: string }>(
  list: T[]
): T[] => [...list].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
