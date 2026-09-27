// 종목 판별에 들어가는 모든 것 — 프레임 뽑는 시점(훑기·구간), 프롬프트, 스키마, 기권 규칙.
//
// 네트워크(lib/ai-report.ts)와 갈라 둔 이유: 여기엔 런타임 의존성이 없어서
// scripts/ai-eval.mjs가 이 파일을 그대로 import해 맥에서 돌릴 수 있다. 프롬프트를
// 스크립트에 복사해 두면 둘이 어긋나는 순간 측정치가 거짓말이 된다 — 정확도를 재는
// 게 목적인데 그러면 재는 의미가 없다.
import {
  EXERCISE_KEYS,
  ExerciseTypes,
  UNKNOWN_EXERCISE,
  findExercise,
} from "@/constants/exercise";

export type Part =
  { text: string } | { inlineData: { mimeType: string; data: string } };

// 프레임은 두 번 뽑는다. 판별은 영상 전체를 훑어 종목과 "실제로 드는 구간"을 짚고,
// 리포트는 그 구간 안에서만 촘촘히 본다. 예전엔 14장을 영상 전체에 고르게 깔았는데,
// 세팅·호흡에 30초를 쓰고 1RM을 한 번 드는 영상이면 14장 중 1~2장만 동작에 걸리고
// 나머지는 서 있는 장면이었다(60초를 넘기면 뒤쪽은 아예 잘렸다). 짧게 찍으라는 가이드로
// 그 구멍을 사용자에게 떠넘기고 있었다.
//
// ponytail: 훑는 간격·장수는 knob이다. 2초 간격이면 1RM 한 번(4~6초)에 최소 한 장은
// 떨어진다. 장당 ~250KB라 20장에서 멈추고, 그보다 긴 영상은 간격이 벌어진다 — 긴
// 영상에서 구간을 자주 놓치면 SCAN_MAX를 올려본다.
const SCAN_STEP_MS = 2000;
const SCAN_MIN = 8;
const SCAN_MAX = 20;
// 리포트가 구간 안에서 뽑는 장수. 1RM 5초면 0.4초 간격이다
const REPORT_FRAMES = 14;
// 구간을 못 짚었을 때 앞뒤에서 잘라낼 준비 구간(걸어오기·세팅, 끄러 가기)
const TRIM_RATIO = 0.175;
const TRIM_MAX_MS = 3000;

const scanCount = (durationMs: number) =>
  Math.min(SCAN_MAX, Math.max(SCAN_MIN, Math.round(durationMs / SCAN_STEP_MS)));

// [from, to]를 count칸으로 나눈 각 칸의 한가운데(ms) — 0ms와 영상 끝(썸네일 추출이
// 실패할 수 있다)을 피한다
const spread = (from: number, to: number, count: number) =>
  Array.from({ length: count }, (_, i) =>
    Math.round(from + ((to - from) * (i + 0.5)) / count),
  );

export const scanTimes = (durationMs: number) =>
  spread(0, durationMs, scanCount(durationMs));

// 판별 호출이 짚은 반복 구간(ms)
export type RepsRange = { from: number; to: number };

// 모델이 짚는 건 "움직임이 보이는 첫·끝 프레임"이라 실제 시작·끝은 그 앞뒤 프레임
// 사이 어딘가다 — 훑은 간격 한 칸만큼 양쪽으로 넓힌다.
export const focusTimes = (durationMs: number, reps?: RepsRange) => {
  // 못 짚었으면 예전처럼 앞뒤 준비 구간만 잘라내고 나머지를 고르게 본다. 영상 전체를
  // 넘기면 "서기 → 바닥 → 서기"가 버피로 읽히고, 리포트 프롬프트도 준비 구간은
  // 잘라냈다고 말한다(lib/ai-report.ts)
  if (!reps || reps.from >= durationMs) {
    const trim = Math.min(durationMs * TRIM_RATIO, TRIM_MAX_MS);
    return spread(trim, durationMs - trim, REPORT_FRAMES);
  }
  const pad = durationMs / scanCount(durationMs);
  return spread(
    Math.max(0, reps.from - pad),
    Math.min(durationMs, reps.to + pad),
    REPORT_FRAMES,
  );
};

// Gemini는 스키마에 적힌 순서대로 필드를 생성한다(propertyOrdering). 그래서 관찰
// 항목을 workout보다 앞에 둔다 — 이름을 먼저 뱉게 두면 그 뒤 필드들이 전부 그 이름을
// 합리화하는 쪽으로 흘렀다. 몸을 먼저 보게 만드는 게 이 순서의 전부다.
// 구간은 그보다도 앞이다. 영상 전체를 훑으니 걸어오고 세팅하는 장면이 섞이는데,
// 어디서 드는지부터 정해야 몸을 그 구간에서 본다.
const IDENTIFY_ORDER = [
  "isWorkout",
  "repsFrom",
  "repsTo",
  "bodyOrientation",
  "armPath",
  "workout",
  "confidence",
];

export const IDENTIFY_SCHEMA = {
  type: "OBJECT",
  properties: {
    isWorkout: { type: "BOOLEAN" },
    // 반복 구간(초, 프레임 라벨 그대로) — 리포트가 이 구간만 촘촘히 뽑는다.
    // required라 못 찾아도 뭔가를 채워야 한다 — nullable이 없으면 0/0을 지어낸다
    repsFrom: { type: "NUMBER", nullable: true },
    repsTo: { type: "NUMBER", nullable: true },
    // 푸쉬업(horizontal)과 버피(mixed)를 가르는 축
    bodyOrientation: {
      type: "STRING",
      enum: ["upright", "horizontal", "seated", "lying", "mixed"],
    },
    // 프론트레이즈(forward)·사레레(sideways)·익스터널로테이션(rotating)을 가르는 축
    armPath: {
      type: "STRING",
      enum: [
        "forward",
        "sideways",
        "overhead",
        "pulling_down",
        "rotating",
        "none",
      ],
    },
    workout: { type: "STRING", enum: EXERCISE_KEYS },
    confidence: { type: "STRING", enum: ["high", "medium", "low"] },
  },
  propertyOrdering: IDENTIFY_ORDER,
  required: IDENTIFY_ORDER,
};

// 이 사람이 최근에 기록한 종목들. 앱이 유일하게 가진, 모델 크기로는 살 수 없는 단서다
// (운동 기록 앱이면서 그걸 안 쓰고 있었다). 다만 "힌트"지 "정답"이 아니다 — 기록하지 않고
// 찍는 동작이 훨씬 많아서(맨몸·재활·워밍업), 강하게 쓰면 안 하던 종목을 전부 기록된
// 종목으로 끌어당긴다. 그래서 "똑같아 보일 때만 갈라라"로 한정한다.
const recentHint = (recent: string[]) =>
  recent.length === 0
    ? ""
    : `

The lifter logged these exercises in their own training log recently: ${recent.join(", ")}.
Use this ONLY to break a tie between two entries that look the same in these frames. It is not evidence of anything — people film movements they never log, and log movements they never film. If the frames show something that is not on this list, ignore the list completely.`;

export const identifyInstruction = (
  recent: string[] = [],
) => `You identify ONE strength-training exercise from still frames sampled evenly across a whole video, in order. Each frame is preceded by its timestamp.

Work in this order and do not skip ahead:
1. "repsFrom" and "repsTo" — find where the set actually happens. People start recording, walk to the equipment, set up and brace, and only then lift; afterwards they rack the weight and walk back to stop the recording. Give the timestamps of the FIRST and the LAST frame in which the person is performing reps — the weight or the body visibly moving through the exercise — in seconds, copied from the frame labels (t=12.0s → 12). Walking, chalking, gripping, unracking, bracing and walking the weight out are not reps; neither are racking it and walking away. A single heavy rep, such as a 1RM attempt, may show up in only one or two frames — that is still the set. If only one frame shows it, give that frame for both. If the whole clip is reps, give the first and the last frame. If no frame shows reps being performed, give null for both.
2. "bodyOrientation" — looking only at the frames from repsFrom to repsTo, where is the torso? upright (standing or kneeling tall), horizontal (torso parallel to the floor, as in a push-up or plank), seated, lying (back or chest supported on a bench or the floor), mixed (upright in some frames and down on the floor in others).
3. "armPath" — how do the arms travel? forward (rising in front of the torso), sideways (rising out to the sides, away from the body), overhead (pressing or pulling above the head), pulling_down (pulling toward the chest or down from above), rotating (upper arms pinned against the ribs, only the forearms swing out or in), none.
4. "workout" — pick the single entry from the allowed list that matches BOTH observations above.
5. "confidence".

Rules for the cases that actually get confused:
- Torso horizontal, only hands and toes touching the floor, and NO frame between repsFrom and repsTo shows the person standing → push_up. A burpee MUST show the person standing or jumping in between reps. Standing before the first rep or after the last one is only walking in and out — no standing between reps, no burpee.
- Arms rising IN FRONT of the torso → front_raise. Arms rising OUT TO THE SIDES → lateral_raise. Upper arms pinned to the ribs with only the forearms swinging outward → external_rotation (inward → internal_rotation). These look alike at a glance and a rotation moves only a short distance; decide from "armPath", not from first impression.
- "forward" alone does not mean front_raise. A raise keeps the arms STRAIGHT and swings the whole arm up from the shoulder. If the elbow bends and the hand travels up toward the shoulder, it is a curl. If the hands stay close to the body and the ELBOWS lead upward past the shoulders, it is an upright row. Check the elbow before you pick.

Set "workout" to "${UNKNOWN_EXERCISE}" — rather than the nearest-looking entry — when the movement is not in the list, or when no frame shows the part of the movement that would separate it from a similar exercise. Set "confidence" to "low" when you did pick an entry but would not bet on it. A wrong name produces an entire report about the wrong exercise, so admitting you cannot tell is always the better answer.

Set "isWorkout" to false ONLY when the frames are clearly unrelated to training — scenery, pets, food, documents, screen recordings, someone doing something plainly non-athletic. Someone setting up for a set, resting between reps, holding equipment or standing in a gym is still training.${recentHint(recent)}`;

export type IdentifyResult =
  // 호출 자체가 실패했다(네트워크·쿼터). 호출부가 실패 토스트를 띄운다
  | { status: "failed" }
  | { status: "notWorkout" }
  // 운동은 맞는데 종목을 확정하지 못했다 — 리포트를 만들지 않는다
  | { status: "unknown" }
  // reps는 덤이다 — 못 읽었으면 비우고 리포트가 영상 전체를 본다(focusTimes)
  | { status: "ok"; exercise: ExerciseTypes; reps?: RepsRange };

// ponytail: 기권 기준은 knob이다. 멀쩡한 영상까지 자주 튕기면(정상 영상 기권율이
// 15%를 넘으면) confidence 조건을 빼고 unknown만 남긴다. 반대로 틀린 이름이 계속
// 새면 medium까지 막는다. scripts/ai-eval.mjs로 재보고 정한다.
export const toIdentifyResult = (raw: any): IdentifyResult => {
  if (typeof raw?.isWorkout !== "boolean") return { status: "failed" };
  if (!raw.isWorkout) return { status: "notWorkout" };

  const exercise = findExercise(raw.workout);
  if (!exercise || raw.confidence === "low") return { status: "unknown" };
  // Number()로 느슨하게 읽으면 null이 0이 되어 빈 값이 "영상 맨 앞"으로 둔갑한다.
  // 훑기 프레임은 0초에 없으므로(spread) repsTo 0은 "못 찾았다"를 숫자로 때운 값이다
  const { repsFrom, repsTo } = raw;
  const reps =
    typeof repsFrom === "number" &&
    typeof repsTo === "number" &&
    repsFrom >= 0 &&
    repsTo > 0 &&
    repsTo >= repsFrom
      ? { from: repsFrom * 1000, to: repsTo * 1000 }
      : undefined;
  return { status: "ok", exercise, reps };
};
