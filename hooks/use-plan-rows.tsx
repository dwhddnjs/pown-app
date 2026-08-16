import { useMemo } from "react";
import { WorkoutPlanTypes } from "@/hooks/use-workout-plan-store";
import { groupByDate } from "@/lib/date";

// 날짜 그룹을 통째로 한 행에 넣으면 행 하나가 화면 몇 개 높이가 되어 가상화가
// 무의미해진다 — 빠른 플릭으로 창을 벗어나면 그 거대한 행들을 처음부터 다시
// 그리는 동안 화면이 비어 보인다. 그래서 운동 하나가 한 행이다.
// 잔디도 행으로 두면 헤더 타이틀을 "맨 위에 걸친 행" 하나로만 판정할 수 있다.
export type Row =
  | { kind: "grass" }
  | { kind: "header"; date: string }
  | {
      kind: "plan";
      date: string;
      plan: WorkoutPlanTypes;
      index: number;
      total: number;
    };

export const GRASS_ROW: Row = { kind: "grass" };

// 재활용 풀을 "구조가 같은 것끼리" 나눈다. 전부 "plan" 하나로 두면 세트 5개짜리
// 셀을 세트 1개짜리로 재활용할 때 React가 SetListItem 4개(=네이티브 뷰 수십 개)를
// 언마운트했다 다시 마운트한다. 플릭 중엔 이게 매 프레임 반복돼 렌더가 스크롤을
// 못 따라간다. 다만 세트 수를 그대로 키로 쓰면 풀이 사용자 데이터만큼 쪼개져
// 재활용이 아예 안 되므로 버킷으로 묶어 종류 수를 상수로 고정한다.
const SET_COUNT_BUCKETS = 3;

export const getRowType = (item: Row) =>
  item.kind === "plan"
    ? `plan${Math.min(item.plan.setWithCount?.length ?? 0, SET_COUNT_BUCKETS)}`
    : item.kind;

export const getRowKey = (item: Row) =>
  item.kind === "grass"
    ? "grass"
    : item.kind === "header"
      ? `h${item.date}`
      : `p${item.plan.id}`;

// 기록 전체를 한 번만 행 목록으로 펼친다 — 화면에 그리는 양은 가상화가 알아서
// 줄이므로 스크롤 도중 데이터를 덧붙일(=리렌더할) 이유가 없다.
// dates/starts는 날짜 단위(점프)를 행 인덱스로 옮기는 색인이다.
export const usePlanRows = (workoutPlanList: WorkoutPlanTypes[]) =>
  useMemo(() => {
    const allRows: Row[] = [];
    const dates: string[] = [];
    const starts: number[] = [];
    Object.entries(groupByDate(workoutPlanList)).forEach(([date, plans]) => {
      dates.push(date);
      starts.push(allRows.length);
      allRows.push({ kind: "header", date });
      plans.forEach((plan, index) =>
        allRows.push({
          kind: "plan",
          date,
          plan,
          index,
          total: plans.length,
        }),
      );
    });
    return { allRows, dates, starts };
  }, [workoutPlanList]);
