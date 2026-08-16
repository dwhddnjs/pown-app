// 운동 도메인 공용 타입. 스토어·화면·차트가 모두 참조하므로 여기 한 곳에서만 정의한다.
// (예전엔 use-plan-store와 use-user-store, lib/function이 같은 유니온을 각자 인라인으로 적어
//  부위를 하나 추가하면 세 곳을 같이 고쳐야 했다.)

export type WorkoutTypes = "chest" | "back" | "shoulder" | "leg" | "arm";

// 부위를 순회하는 화면(부위 선택, 부위별 카운트)이 공유하는 표시 순서.
// 순서를 바꾸면 그 화면들의 배치가 같이 바뀐다.
export const WORKOUT_TYPE_LIST = [
  "back",
  "chest",
  "shoulder",
  "leg",
  "arm",
] as const satisfies readonly WorkoutTypes[];

export type ImageUriType = {
  id: number;
  imageUri?: string;
};

export type ConditionTypes = {
  id: number;
  condition: string;
};

// progress 값은 저장된 데이터에 그대로 들어 있다 — 문자열을 바꾸면 기존 기록이 깨진다
export type SetWithCountType = {
  id: number;
  set: string;
  count: string;
  progress: "진행중" | "완료";
};
