import { format } from "date-fns";
import { enUS, ko } from "date-fns/locale";
import type { Lang } from "@/lib/i18n";
import { getLanguage } from "@/hooks/use-user-store";
// use-workout-plan-store가 이 파일의 sortByCreatedAtDesc를 쓰므로 서로를 가리킨다 —
// 반드시 타입만 가져올 것(import type). 값을 하나라도 가져오면 순환 참조가 실체화돼
// 먼저 평가되는 쪽이 상대를 반쯤 초기화된 상태로 보고 앱이 부팅 즉시 죽는다.
import type { WorkoutPlanTypes } from "@/hooks/use-workout-plan-store";

// 프로젝트 전역 날짜 저장 포맷 (CLAUDE.md)
export const PLAN_DATE_FORMAT = "yyyy.MM.dd HH:mm:ss";

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
];

const enMonth = (month: string) => EN_MONTHS[parseInt(month, 10) - 1] ?? month;

// 표시용으로만 앞의 0을 뗀다("08" → "8"). 저장 포맷(PLAN_DATE_FORMAT)과 그룹 키는
// 정렬이 문자열 비교에 걸려 있으므로 0을 채운 고정폭 그대로 둔다.
const stripZero = (value: string) => {
  const num = parseInt(value, 10);
  return Number.isNaN(num) ? value : String(num);
};

// 계획 추가 화면 상단의 날짜·시각 표시
export const formatPlanDateTime = (date: Date, lang: Lang) =>
  lang === "ko"
    ? format(date, "yyyy년 M월 d일 H시 m분", { locale: ko })
    : format(date, "MMM d, yyyy HH:mm", { locale: enUS });

// PLAN_DATE_FORMAT은 전부 0으로 채운 고정폭이라(yyyy.MM.dd HH:mm:ss) 문자열
// 사전순 = 시간순이다. date-fns parse를 비교자 안에서 부르면 n log n번 파싱하게 되는데,
// 1만 건이면 그것만 수백 ms다 (계획 하나 추가할 때마다).
export const sortByCreatedAtDesc = <T extends { createdAt: string }>(
  list: T[],
): T[] =>
  [...list].sort((a, b) =>
    a.createdAt < b.createdAt ? 1 : a.createdAt > b.createdAt ? -1 : 0,
  );

// "2025.03.14 09:30:00" → "09:30"
export const formatTime = (value: string) => {
  if (!value) return "";
  const time = value.split(" ")[1];
  if (!time) return "";
  const [hour, minute] = time.split(":");
  return `${hour}:${minute}`;
};

// "2025.03.14" → "2025년 3월 14일" / "Mar 14, 2025"
export const formatDate = (value: string, lang: Lang = getLanguage()) => {
  if (!value) return "";
  const [year, month, day] = value.split(".");
  if (!year || !month || !day) return value;
  if (lang === "ko")
    return `${year}년 ${stripZero(month)}월 ${stripZero(day)}일`;
  return `${enMonth(month)} ${stripZero(day)}, ${year}`;
};

// "202503" → "2025년 3월" / "Mar 2025"
export const convertChartDate = (date: string, lang: Lang = getLanguage()) => {
  if (!date) return "";
  const year = date.slice(0, 4);
  const month = date.slice(4, 6);
  return lang === "ko"
    ? `${year}년 ${stripZero(month)}월`
    : `${enMonth(month)} ${year}`;
};

// 기록을 "yyyy.MM.dd" 날짜별로 묶는다 (리스트의 날짜 헤더 단위)
export const groupByDate = (arr: WorkoutPlanTypes[]) =>
  arr.reduce<Record<string, WorkoutPlanTypes[]>>((acc, cur) => {
    const date = cur.createdAt.split(" ")[0];
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(cur);
    return acc;
  }, {});

// 같은 날짜(yyyy.MM.dd)의 항목은 가장 마지막 기록 하나만 남긴다 — 날짜 키 Map으로 O(n)
export const removeSameItem = <T extends { createdAt: string }>(
  arr: T[],
): T[] => {
  const byDate = new Map<string, T>();
  for (const item of arr) {
    const dateKey = item.createdAt.split(" ")[0];
    const existing = byDate.get(dateKey);
    // 고정폭 저장 포맷이라 문자열 비교로 충분하다 (sortByCreatedAtDesc와 같은 이유)
    if (!existing || item.createdAt > existing.createdAt) {
      byDate.set(dateKey, item);
    }
  }
  return Array.from(byDate.values());
};

// 드로어 폴더 트리. 그룹 키는 항상 숫자 문자열("2025"/"03"/"14")로 두고
// title(표시용)만 언어에 따라 만든다 — 정렬과 날짜 조립이 키에 걸려 있다.
export const transformWorkoutData = (
  data: WorkoutPlanTypes[],
  lang: Lang = getLanguage(),
) => {
  const groupedData: Record<string, Record<string, Set<string>>> = {};

  data.forEach((item) => {
    // 저장 포맷이 이미 "yyyy.MM.dd"로 0을 채운 문자열이라 쪼개기만 하면 된다.
    // date-fns parse를 1만 번 부르면 그것만 수백 ms고, 드로어가 리렌더될 때마다 반복된다.
    const [year, month, day] = item.createdAt.split(" ")[0].split(".");
    if (!year || !month || !day) return;

    if (!groupedData[year]) {
      groupedData[year] = {};
    }
    if (!groupedData[year][month]) {
      groupedData[year][month] = new Set();
    }

    groupedData[year][month].add(day);
  });

  return Object.entries(groupedData)
    .sort((a, b) => b[0].localeCompare(a[0]))
    .map(([year, months]) => ({
      value: year,
      title: lang === "ko" ? `${year}년` : year,
      content: Object.entries(months)
        .sort((a, b) => parseInt(b[0]) - parseInt(a[0]))
        .map(([month, days]) => ({
          value: month,
          title: lang === "ko" ? `${stripZero(month)}월` : enMonth(month),
          content: Array.from(days)
            .sort((a, b) => parseInt(b) - parseInt(a))
            .map((day) => ({
              value: day,
              title: lang === "ko" ? `${stripZero(day)}일` : stripZero(day),
            })),
        })),
    }));
};
