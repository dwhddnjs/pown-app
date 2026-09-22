// 운동 종목 사전 — AI 종목 인식의 "정답 목록"이자 표시 이름 사전.
//
// 왜 여기가 원본인가: 예전엔 AI가 종목명을 자유 문자열로 생성했는데, 한국어로 쓰라고
// 하니 학습 데이터의 헬스장 은어("사레레")가 그대로 나왔고, 반드시 답해야 하는 스키마라
// 확신이 없어도 제일 비슷한 걸 찍었다(익스터널 로테이션 → 사레레). 이 목록을 스키마
// enum으로 넣으면 둘 다 구조적으로 불가능해진다.
//
// key는 영어다. 모델이 영어 운동명 어휘에 훨씬 강하고, ko/en 표시는 앱이 여기서 고른다.
import { WORKOUT_TYPE_LIST, WorkoutTypes } from "@/types/workout";

export type ExerciseTypes = {
  // AI 스키마 enum 값. 바꾸면 프롬프트 정확도가 같이 흔들리므로 임의로 손대지 말 것
  key: string;
  ko: string;
  en: string;
  // bodyPart를 모델에게 묻지 않고 여기서 가져온다 — 이름과 부위가 어긋날 일이 없다
  part: WorkoutTypes;
  // 종목 태그 목록(workoutData)에는 넣지 않고 AI 인식만 하는 항목.
  // 맨몸·기능성 동작은 계획 태그로 쓰기엔 노이즈지만 사람들이 실제로 찍는다.
  tag?: false;
  // 이 종목을 볼 때 코치가 실제로 확인하는 항목. 리포트 프롬프트에 그대로 들어간다.
  // 있는 종목은 "무거운 중량으로 갈 때" 카드도 같이 받는다 (lib/ai-report.ts).
  cues?: string;
};

// 모델이 확신하지 못할 때 고르는 값. 이게 나오면 리포트를 만들지 않는다
// (영상당 1회 정책이라 틀린 리포트가 영구 저장되는 것보다 낫다).
export const UNKNOWN_EXERCISE = "unknown";

// 파워리프팅 빅4 코칭 브리프.
//
// 왜 필요한가: 모델은 "허리를 곧게 펴세요" 같은 말은 누구한테나 할 수 있지만, 무거운
// 스쿼트가 실제로 어디서 무너지는지(엉덩이가 먼저 솟아 굿모닝이 되는 것)는 찍어서
// 말해주지 않으면 짚지 못한다. 종목을 맞히는 것까지는 모델이 하고, 그 종목에서 뭘
// 봐야 하는지는 우리가 준다 — 모델을 키우지 않고 리포트 품질을 올리는 유일한 지렛대다.
//
// 항목은 전부 "옆 45°에서 찍은 정지 프레임으로 실제로 보이는 것"만 적는다. 호흡·바
// 속도처럼 안 보이는 걸 적으면 모델이 지어낸다.
//
// ponytail: 빅4(+직계 변형)만 있다. 나머지 종목은 브리프 없이 일반 코칭으로 간다 —
// PT 없이 독학이 어려운 건 이 넷이고, 종목마다 쓰면 관리할 게 90개가 된다.
const SQUAT_CUES = `- Bar path: the bar must stay stacked over the middle of the foot from start to finish. Any drift toward the toes is the single biggest reason a heavy squat is missed.
- Depth: the hip crease should pass below the top of the knee. Cutting depth as the bar gets heavier is the most common self-deception in this lift.
- Out of the hole: hips and chest must rise together. If the hips shoot up first and the chest folds down, the squat has turned into a good morning — this is THE heavy-squat failure and the main way backs get hurt here.
- Bottom position: watch for the pelvis tucking under at the very bottom (butt wink) and the lower back losing its arch.
- Knees: track in line with the toes and do not cave inward on the way up.
- Brace: a breath taken and held at the top, ribs pulled down, midsection visibly full. A squat braced at the bottom instead of the top is already too late.
- Feet: whole foot planted. Heels lifting means the weight has shifted forward.
- Front squat: the torso stays far more vertical and the elbows must stay high. Elbows dropping lets the bar roll forward and off the shoulders.`;

const BENCH_CUES = `- Shoulder blades: pulled back and down into the bench and STAYING there through every rep. They unpack first as the weight climbs, and that is where shoulders get hurt.
- Contact points: head, upper back and hips stay on the bench, both feet planted and pushing into the floor. Hips lifting off means the brace has failed, not that the lifter is strong.
- Bar path: touches the lower chest / bottom of the sternum, not the throat, and travels back slightly toward the shoulders on the way up. Straight up and down is a weaker path.
- Elbows: roughly 45-75° from the torso. Flared to a full 90° puts the shoulder in its worst position under a heavy bar.
- Wrists: stacked straight over the forearms, not bent backwards — a bent wrist bleeds force and hurts.
- Touch point must be the same every rep. A touch point that creeps up the chest as the set goes on is fatigue changing the lift.
- Both sides should press evenly. One side finishing first is worth calling out.
- Variants change what "correct" means, so judge against the variant in front of you: on an incline the bar touches the UPPER chest near the collarbone, not the sternum; a close grip keeps the elbows tucked much nearer the ribs, around 30°; a wide grip runs the elbows wider and the bar travels a shorter distance. Do not report a variant's defining trait as a fault.`;

const DEADLIFT_CUES = `- Setup: bar over the middle of the foot and against the shins, shoulders just in front of the bar, lats engaged so the bar is pulled back into the legs.
- Hip height: too high turns it into a stiff-leg deadlift, too low makes the bar travel around the knees. The correct height is whatever puts the shoulders just ahead of the bar.
- Back: the lower back must hold its natural arch. Lower-back rounding under a heavy bar is the injury in this lift — say so plainly if you see it. (Some lifters round the upper back on purpose; that is a different thing.)
- Break from the floor: hips and shoulders rise at the same rate. Hips shooting up first while the bar stays down is the most common heavy-deadlift miss.
- Bar path: straight up, staying in contact with the legs the whole way. Any forward drift away from the body instantly costs leverage.
- Lockout: stand tall with the glutes, shoulders over the hips. Leaning back past standing at the top adds nothing and loads the lower back.
- Between reps: watch whether each rep is reset from a dead stop or bounced off the floor. Bouncing hides a weak start position.
- Sumo: the torso sits more upright and the shins stay vertical with the knees pushed out over the toes.`;

const PRESS_CUES = `- Start: the bar rests on the front of the shoulders / collarbone, not floating out in front of the chest. Elbows slightly in front of the bar.
- Head and bar: the head moves back out of the bar's way on the way up, then the torso moves forward UNDER the bar at the top. The bar should finish over the middle of the foot and behind the ears, not out in front of the face.
- Ribs and hips: ribs pulled down, glutes and midsection squeezed. Leaning back into a standing incline press is the classic way this lift is cheated, and it is where the lower back pays for it.
- Wrists: stacked over the forearms, not folded back under the bar.
- Lockout: elbows fully straight with the arms beside the ears, not stopping short with the bar in front.
- The bar should travel in a straight vertical line once it clears the face. A bar that arcs out and around means the head did not get out of the way.
- Push press: the dip is short and straight DOWN, knees re-bending to receive the bar. A dip that travels forward kills the leg drive entirely.`;

// 부위별로 묶어 둔다 — workoutData가 이 순서를 그대로 쓴다.
// 각 부위의 앞쪽 항목들은 기존 workoutData의 문자열·순서 그대로다(기본 태그 목록이
// 바뀌면 안 된다). tag:false가 뒤에 붙는다.
export const EXERCISES: ExerciseTypes[] = [
  // back
  {
    key: "deadlift",
    ko: "데드리프트",
    en: "Deadlift",
    part: "back",
    cues: DEADLIFT_CUES,
  },
  { key: "row", ko: "로우", en: "Row", part: "back" },
  { key: "pull_up", ko: "풀업", en: "Pull-up", part: "back" },
  { key: "chin_up", ko: "친업", en: "Chin-up", part: "back" },
  { key: "lat_pulldown", ko: "랫풀다운", en: "Lat Pulldown", part: "back" },
  {
    key: "straight_arm_pulldown",
    ko: "암풀다운",
    en: "Straight-arm Pulldown",
    part: "back",
  },
  {
    key: "conventional_deadlift",
    ko: "컨벤셔널데드",
    en: "Conventional Deadlift",
    part: "back",
    cues: DEADLIFT_CUES,
  },
  {
    key: "romanian_deadlift",
    ko: "루마니안데드",
    en: "Romanian Deadlift",
    part: "back",
  },
  { key: "rack_pull", ko: "렉풀", en: "Rack Pull", part: "back" },
  { key: "t_bar_row", ko: "티바로우", en: "T-bar Row", part: "back" },
  { key: "high_row_machine", ko: "하이로우", en: "High Row", part: "back" },
  { key: "low_row_machine", ko: "로우로우", en: "Low Row", part: "back" },
  {
    key: "one_arm_dumbbell_row",
    ko: "원암로우",
    en: "One-arm Dumbbell Row",
    part: "back",
  },
  {
    key: "bent_over_row",
    ko: "벤트오버로우",
    en: "Bent-over Row",
    part: "back",
  },
  { key: "pendlay_row", ko: "펜들레이로우", en: "Pendlay Row", part: "back" },
  {
    key: "seated_cable_row",
    ko: "시티드로우",
    en: "Seated Cable Row",
    part: "back",
  },
  { key: "front_row_machine", ko: "프론트로우", en: "Front Row", part: "back" },
  { key: "shrug", ko: "슈러그", en: "Shrug", part: "back" },
  // ponytail: WORKOUT_TYPE_LIST에 복부가 없어 코어 종목은 몸통에서 제일 가까운
  // back으로 접는다. 지금도 모델이 5개 부위 중 하나를 억지로 고르고 있으니 회귀는 아니다.
  // core를 제대로 넣으려면 BODY_PART_ICON·BODY_PART_ITEMS·차트 집계까지 같이 손봐야 한다.
  {
    key: "good_morning",
    ko: "굿모닝",
    en: "Good Morning",
    part: "back",
    tag: false,
  },
  {
    key: "back_extension",
    ko: "백익스텐션",
    en: "Back Extension",
    part: "back",
    tag: false,
  },
  {
    key: "kettlebell_swing",
    ko: "케틀벨스윙",
    en: "Kettlebell Swing",
    part: "back",
    tag: false,
  },
  {
    key: "farmers_walk",
    ko: "파머스워크",
    en: "Farmer's Walk",
    part: "back",
    tag: false,
  },
  { key: "plank", ko: "플랭크", en: "Plank", part: "back", tag: false },
  {
    key: "side_plank",
    ko: "사이드플랭크",
    en: "Side Plank",
    part: "back",
    tag: false,
  },
  { key: "crunch", ko: "크런치", en: "Crunch", part: "back", tag: false },
  { key: "sit_up", ko: "싯업", en: "Sit-up", part: "back", tag: false },
  {
    key: "leg_raise",
    ko: "레그레이즈",
    en: "Leg Raise",
    part: "back",
    tag: false,
  },
  {
    key: "hanging_leg_raise",
    ko: "행잉레그레이즈",
    en: "Hanging Leg Raise",
    part: "back",
    tag: false,
  },
  {
    key: "russian_twist",
    ko: "러시안트위스트",
    en: "Russian Twist",
    part: "back",
    tag: false,
  },
  {
    key: "mountain_climber",
    ko: "마운틴클라이머",
    en: "Mountain Climber",
    part: "back",
    tag: false,
  },

  // chest
  {
    key: "bench_press",
    ko: "벤치프레스",
    en: "Bench Press",
    part: "chest",
    cues: BENCH_CUES,
  },
  {
    key: "incline_bench_press",
    ko: "인클라인프레스",
    en: "Incline Bench Press",
    part: "chest",
    cues: BENCH_CUES,
  },
  {
    key: "decline_bench_press",
    ko: "디클라인프레스",
    en: "Decline Bench Press",
    part: "chest",
    cues: BENCH_CUES,
  },
  {
    key: "chest_press_machine",
    ko: "체스트프레스",
    en: "Chest Press",
    part: "chest",
  },
  {
    key: "close_grip_bench_press",
    ko: "클로즈그립프레스",
    en: "Close-grip Bench Press",
    part: "chest",
    cues: BENCH_CUES,
  },
  {
    key: "wide_grip_bench_press",
    ko: "와이드프레스",
    en: "Wide-grip Bench Press",
    part: "chest",
    cues: BENCH_CUES,
  },
  {
    key: "seated_chest_press",
    ko: "시티드프레스",
    en: "Seated Chest Press",
    part: "chest",
  },
  {
    key: "flat_bench_press",
    ko: "플랫프레스",
    en: "Flat Bench Press",
    part: "chest",
    cues: BENCH_CUES,
  },
  { key: "pec_deck_fly", ko: "팩덱플라이", en: "Pec Deck Fly", part: "chest" },
  { key: "dumbbell_fly", ko: "플라이", en: "Fly", part: "chest" },
  { key: "dips", ko: "딥스", en: "Dips", part: "chest" },
  { key: "pullover", ko: "풀오버", en: "Pullover", part: "chest" },
  { key: "push_up", ko: "푸쉬업", en: "Push-up", part: "chest", tag: false },
  {
    key: "cable_crossover",
    ko: "케이블크로스오버",
    en: "Cable Crossover",
    part: "chest",
    tag: false,
  },

  // shoulder
  {
    key: "overhead_press",
    ko: "오버헤드프레스",
    en: "Overhead Press",
    part: "shoulder",
    cues: PRESS_CUES,
  },
  {
    key: "military_press",
    ko: "밀리터리프레스",
    en: "Military Press",
    part: "shoulder",
    cues: PRESS_CUES,
  },
  {
    key: "shoulder_press",
    ko: "숄더프레스",
    en: "Shoulder Press",
    part: "shoulder",
  },
  {
    key: "push_press",
    ko: "푸쉬프레스",
    en: "Push Press",
    part: "shoulder",
    cues: PRESS_CUES,
  },
  {
    key: "behind_the_neck_press",
    ko: "비하인드넥프레스",
    en: "Behind-the-neck Press",
    part: "shoulder",
  },
  {
    key: "front_raise",
    ko: "프론트레이즈",
    en: "Front Raise",
    part: "shoulder",
  },
  {
    key: "lateral_raise",
    ko: "사이드레터럴레이즈",
    en: "Lateral Raise",
    part: "shoulder",
  },
  {
    key: "bent_over_lateral_raise",
    ko: "벤트오버레이즈",
    en: "Bent-over Lateral Raise",
    part: "shoulder",
  },
  {
    key: "upright_row",
    ko: "업라이트로우",
    en: "Upright Row",
    part: "shoulder",
  },
  { key: "face_pull", ko: "페이스풀", en: "Face Pull", part: "shoulder" },
  {
    key: "external_rotation",
    ko: "익스터널로테이션",
    en: "External Rotation",
    part: "shoulder",
    tag: false,
  },
  {
    key: "internal_rotation",
    ko: "인터널로테이션",
    en: "Internal Rotation",
    part: "shoulder",
    tag: false,
  },
  {
    key: "arnold_press",
    ko: "아놀드프레스",
    en: "Arnold Press",
    part: "shoulder",
    tag: false,
  },
  {
    key: "pike_push_up",
    ko: "파이크푸쉬업",
    en: "Pike Push-up",
    part: "shoulder",
    tag: false,
  },

  // leg
  { key: "squat", ko: "스쿼트", en: "Squat", part: "leg", cues: SQUAT_CUES },
  {
    key: "back_squat",
    ko: "백스쿼트",
    en: "Back Squat",
    part: "leg",
    cues: SQUAT_CUES,
  },
  { key: "hack_squat", ko: "핵스쿼트", en: "Hack Squat", part: "leg" },
  { key: "v_squat", ko: "브이스쿼트", en: "V-Squat", part: "leg" },
  { key: "leg_press", ko: "레그프레스", en: "Leg Press", part: "leg" },
  {
    key: "leg_extension",
    ko: "레그익스텐션",
    en: "Leg Extension",
    part: "leg",
  },
  { key: "leg_curl", ko: "레그컬", en: "Leg Curl", part: "leg" },
  { key: "lunge", ko: "런지", en: "Lunge", part: "leg" },
  {
    key: "stiff_leg_deadlift",
    ko: "스티프데드",
    en: "Stiff-leg Deadlift",
    part: "leg",
  },
  {
    key: "sumo_deadlift",
    ko: "스모데드",
    en: "Sumo Deadlift",
    part: "leg",
    cues: DEADLIFT_CUES,
  },
  {
    key: "hip_adduction_machine",
    ko: "인어싸이",
    en: "Hip Adduction",
    part: "leg",
  },
  {
    key: "hip_abduction_machine",
    ko: "아웃싸이",
    en: "Hip Abduction",
    part: "leg",
  },
  {
    key: "front_squat",
    ko: "프론트스쿼트",
    en: "Front Squat",
    part: "leg",
    cues: SQUAT_CUES,
  },
  { key: "split_squat", ko: "스플릿스쿼트", en: "Split Squat", part: "leg" },
  {
    key: "wide_stance_squat",
    ko: "와이드스쿼트",
    en: "Wide-stance Squat",
    part: "leg",
  },
  {
    key: "pendulum_squat",
    ko: "펜듈럼스쿼트",
    en: "Pendulum Squat",
    part: "leg",
  },
  { key: "hip_thrust", ko: "힙쓰러스트", en: "Hip Thrust", part: "leg" },
  { key: "calf_raise", ko: "카프레이즈", en: "Calf Raise", part: "leg" },
  { key: "burpee", ko: "버피", en: "Burpee", part: "leg", tag: false },
  {
    key: "jump_squat",
    ko: "점프스쿼트",
    en: "Jump Squat",
    part: "leg",
    tag: false,
  },
  {
    key: "bulgarian_split_squat",
    ko: "불가리안스플릿스쿼트",
    en: "Bulgarian Split Squat",
    part: "leg",
    tag: false,
  },
  {
    key: "glute_bridge",
    ko: "글루트브릿지",
    en: "Glute Bridge",
    part: "leg",
    tag: false,
  },
  { key: "step_up", ko: "스텝업", en: "Step-up", part: "leg", tag: false },
  {
    key: "power_clean",
    ko: "파워클린",
    en: "Power Clean",
    part: "leg",
    tag: false,
  },
  {
    key: "jumping_jack",
    ko: "점핑잭",
    en: "Jumping Jack",
    part: "leg",
    tag: false,
  },
  { key: "jump_rope", ko: "줄넘기", en: "Jump Rope", part: "leg", tag: false },

  // arm
  { key: "biceps_curl", ko: "컬", en: "Biceps Curl", part: "arm" },
  { key: "hammer_curl", ko: "해머컬", en: "Hammer Curl", part: "arm" },
  {
    key: "triceps_pushdown",
    ko: "푸쉬다운",
    en: "Triceps Pushdown",
    part: "arm",
  },
  { key: "skull_crusher", ko: "스컬크러셔", en: "Skull Crusher", part: "arm" },
  {
    key: "triceps_extension",
    ko: "삼두익스텐션",
    en: "Triceps Extension",
    part: "arm",
  },
  { key: "reverse_curl", ko: "리버스컬", en: "Reverse Curl", part: "arm" },
  { key: "wrist_curl", ko: "리스트컬", en: "Wrist Curl", part: "arm" },
  { key: "preacher_curl", ko: "프리쳐컬", en: "Preacher Curl", part: "arm" },
  { key: "spider_curl", ko: "스파이더컬", en: "Spider Curl", part: "arm" },
  {
    key: "reverse_wrist_curl",
    ko: "리버스리스트컬",
    en: "Reverse Wrist Curl",
    part: "arm",
  },
  {
    key: "concentration_curl",
    ko: "컨센트레이션컬",
    en: "Concentration Curl",
    part: "arm",
  },
  {
    key: "triceps_kickback",
    ko: "킥백",
    en: "Triceps Kickback",
    part: "arm",
    tag: false,
  },
  {
    key: "bench_dip",
    ko: "벤치딥스",
    en: "Bench Dip",
    part: "arm",
    tag: false,
  },
];

// AI 스키마 enum. unknown이 없으면 모델이 반드시 뭔가를 찍어야 한다.
export const EXERCISE_KEYS = [
  ...EXERCISES.map((item) => item.key),
  UNKNOWN_EXERCISE,
];

export const findExercise = (key: unknown) =>
  EXERCISES.find((item) => item.key === key);

// 종목 태그 기본 목록. 부위별 배열 순서는 EXERCISES에 적힌 순서 그대로다.
export const tagsByPart = (): Record<WorkoutTypes, string[]> =>
  WORKOUT_TYPE_LIST.reduce(
    (acc, part) => {
      acc[part] = EXERCISES.filter(
        (item) => item.part === part && item.tag !== false,
      ).map((item) => item.ko);
      return acc;
    },
    {} as Record<WorkoutTypes, string[]>,
  );
