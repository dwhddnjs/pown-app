// lib은 스토어를 값으로 가져오지 않는다 — lib/date.ts의 주석 참고
import type { WorkoutPlanTypes } from "@/hooks/use-workout-plan-store";
import { PLAN_DATE_FORMAT } from "@/lib/date";
import seedWorkoutPlans from "@/assets/seed-workout-plans.json";
import { format } from "date-fns";

// 스크롤 부하 테스트용 더미 기록 생성기 — 데이터 관리 화면의 숨김 기능에서만 부른다.
export const SEED_COUNT = 10000;

// 하루에 이만큼씩 쌓아 날짜 그룹을 2000개쯤 만든다.
// 하루 안의 시각을 슬롯에서 만들므로 24를 넘기면 안 된다.
const SEED_PLANS_PER_DAY = 5;
const SEED_DAYS = Math.ceil(SEED_COUNT / SEED_PLANS_PER_DAY);
const DAY_MS = 24 * 60 * 60 * 1000;

// 1만 개를 JSON 자산으로 들고 있으면 번들만 5MB 늘어난다 —
// 700개짜리 템플릿을 돌려쓰며 id와 날짜만 새로 매긴다. 최신순으로 만든다.
export const buildSeedPlans = (): WorkoutPlanTypes[] => {
  // JSON import는 progress 같은 리터럴 유니온을 string으로 넓혀서 읽는다
  const templates = seedWorkoutPlans as WorkoutPlanTypes[];
  const now = Date.now();
  // date-fns format은 1만 번 부르면 Hermes에서 100ms 넘게 멈춘다 — 하루당 한 번만 만든다
  const dates = Array.from(
    { length: SEED_DAYS },
    (_, day) =>
      format(new Date(now - day * DAY_MS), PLAN_DATE_FORMAT).split(" ")[0],
  );

  return Array.from({ length: SEED_COUNT }, (_, index) => {
    const template = templates[index % templates.length];
    // 스토어는 workoutPlanList가 항상 createdAt 내림차순이라고 가정한다.
    // 템플릿 시각을 그대로 쓰면 하루 그룹 안에서 순서가 뒤집히므로 슬롯에서 만든다.
    const slot = index % SEED_PLANS_PER_DAY;
    const createdAt = `${dates[Math.floor(index / SEED_PLANS_PER_DAY)]} ${String(
      23 - slot,
    ).padStart(2, "0")}:00:00`;
    // 과거 구간에서 발급한다 — now + index로 잡으면 앞으로 10초간의 Date.now()를
    // 선점해서, 시드 직후 추가한 진짜 계획과 id가 그대로 겹친다
    const id = now - SEED_COUNT + index;

    return {
      ...template,
      id,
      createdAt,
      updatedAt: createdAt,
      // 계획 하나당 100칸을 잡아 이웃 계획의 세트 id와 겹치지 않게 한다
      setWithCount: template.setWithCount.map((set, setIndex) => ({
        ...set,
        id: id * 100 + setIndex,
      })),
      imageUri: [],
    };
  });
};
