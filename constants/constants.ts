import { tagsByPart } from "@/constants/exercise";
import { WorkoutTypes } from "@/types/workout";

export const equipmentData: string[] = [
  "바벨",
  "덤벨",
  "머신",
  "스미스",
  "케이블",
  "맨몸",
];

// 종목 태그 기본 목록. 이름 원본은 constants/exercise.ts다 — AI 종목 인식의 enum과
// 같은 목록이어야 해서 한쪽에만 종목을 추가하는 일이 없도록 거기서 파생시킨다.
// (tag:false인 맨몸·기능성 동작은 AI만 인식하고 태그 목록엔 안 들어온다.)
export const workoutData: Record<WorkoutTypes, string[]> = tagsByPart();

export const setData = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];
export const setTypeData = ["웜업", "본 세트", "PR", "연습"];
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
];

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
];
