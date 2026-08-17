import { getLanguage, UserInfoTypes } from "@/hooks/use-user-store";
// lib은 스토어를 값으로 가져오지 않는다 — lib/date.ts의 주석 참고
import type { WorkoutPlanTypes } from "@/hooks/use-workout-plan-store";
import { removeSameItem } from "@/lib/date";
import { Lang } from "@/lib/i18n";
import { WorkoutTypes } from "@/types/workout";

// 기록 탭 차트들이 쓰는 집계 함수. 저장값은 항상 한국어가 정본이라(lib/i18n 참고)
// 아래 매핑들의 키도 한국어다 — 표시 라벨과 헷갈리지 말 것.

// 미리 0으로 채운 카운터에 항목을 세어 담는다.
// 키를 뽑아내는 건 호출부가 정한다 — 중간 배열을 만들지 않으려고 값 목록이 아니라
// 항목 목록을 그대로 받는다. 매핑에 없는 값(구 데이터·오타)은 undefined라 조용히 무시된다.
const countBy = <K extends string, T>(
  keys: readonly K[],
  items: readonly T[],
  toKey: (item: T) => K | undefined,
): Record<K, number> => {
  const result = Object.fromEntries(keys.map((key) => [key, 0])) as Record<
    K,
    number
  >;
  for (const item of items) {
    const key = toKey(item);
    if (key) result[key] += 1;
  }
  return result;
};

// ── 부위별 개수 ────────────────────────────────────────────────
export type WorkoutTypeCount = Record<WorkoutTypes, number>;

// 화면 표시 순서(WORKOUT_TYPE_LIST)와 일부러 다르다 — 월간 요약의 "가장 많이 한
// 부위"가 Object.entries 순서를 훑어 동점이면 먼저 나온 키를 고르므로, 키 순서를
// 바꾸면 동점일 때 표시되는 부위가 바뀐다.
const WORKOUT_COUNT_KEYS = [
  "chest",
  "back",
  "arm",
  "leg",
  "shoulder",
] as const satisfies readonly WorkoutTypes[];

// 저장된 type이 곧 키다 — 자기 자신으로 매핑. 아는 부위인지 걸러내는 역할도 겸하므로
// (모르는 값은 undefined) 모듈 로드 때 한 번만 만들어 둔다 — 차트 세 개가 렌더마다 부른다.
const WORKOUT_KEY: Record<string, WorkoutTypes> = Object.fromEntries(
  WORKOUT_COUNT_KEYS.map((type) => [type, type]),
);

export const sortWorkoutPlanList = (
  list: WorkoutPlanTypes[],
): WorkoutTypeCount =>
  countBy(WORKOUT_COUNT_KEYS, list, (item) => WORKOUT_KEY[item.type]);

// ── 컨디션별 개수 ──────────────────────────────────────────────
const CONDITION_KEYS = [
  "good",
  "tired",
  "angry",
  "sick",
  "sad",
  "lol",
  "cool",
  "neutral",
  "anoy",
] as const;

export type ConditionKey = (typeof CONDITION_KEYS)[number];

const CONDITION_MAP: Record<string, ConditionKey> = {
  좋음: "good",
  피곤함: "tired",
  화남: "angry",
  아픔: "sick",
  슬픔: "sad",
  신남: "lol",
  상쾌함: "cool",
  양호함: "neutral",
  짜증남: "anoy",
};

export const convertConditionType = (type: string): ConditionKey | undefined =>
  CONDITION_MAP[type];

export const getConditionCount = (workoutPlanList: WorkoutPlanTypes[]) =>
  countBy(
    CONDITION_KEYS,
    // 계획 하나에 컨디션이 여러 개라 여기서만 평탄화가 필요하다
    workoutPlanList.flatMap((item) => item.condition),
    (condition) => CONDITION_MAP[condition],
  );

// ── 기구별 개수 ────────────────────────────────────────────────
const EQUIPMENT_KEYS = [
  "babel",
  "dumbel",
  "machine",
  "smith",
  "cable",
  "body",
] as const;

const EQUIPMENT_MAP: Record<string, (typeof EQUIPMENT_KEYS)[number]> = {
  바벨: "babel",
  덤벨: "dumbel",
  머신: "machine",
  스미스: "smith",
  케이블: "cable",
  맨몸: "body",
};

export const getEquipmentCount = (data: WorkoutPlanTypes[]) =>
  countBy(EQUIPMENT_KEYS, data, (item) => EQUIPMENT_MAP[item.equipment]);

// ── 차트 값 변환 ───────────────────────────────────────────────
export const convertChartValuesToPercentage = (
  data: { value: number; color: string }[],
) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  if (total === 0) return data;

  return data.map((item) => {
    const percent = Math.round(
      parseFloat(((item.value / total) * 100).toFixed(2)),
    );
    return { ...item, value: percent, text: `${percent}%` };
  });
};

type BodyDataItem = { id: number; value: number; date: string; label: string };

// 기록이 있는 날만 데이터 포인트로 반환한다 — 빈 날을 0으로 채우면 라인이 0까지 곤두박질치는 삼각파형이 된다
export const getMonthlyBodyData = (
  rawData: Pick<UserInfoTypes, "createdAt" | "weight">[],
  yearMonth: string,
  lang: Lang = getLanguage(),
): BodyDataItem[] => {
  const year = yearMonth.slice(0, 4);
  const month = yearMonth.slice(4, 6);

  const monthData = rawData.filter(
    (item) =>
      item.createdAt.slice(0, 4) === year &&
      item.createdAt.slice(5, 7) === month,
  );

  return removeSameItem(monthData)
    .map((item) => {
      const day = parseInt(item.createdAt.slice(8, 10), 10);
      return {
        id: day,
        value: parseFloat(item.weight ?? "0"),
        date: `${year.slice(2)}/${month}/${String(day).padStart(2, "0")}`,
        label: lang === "ko" ? `${day}일` : String(day),
      };
    })
    .sort((a, b) => a.id - b.id);
};
