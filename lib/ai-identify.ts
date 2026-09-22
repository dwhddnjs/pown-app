// 종목 판별에 들어가는 모든 것 — 프레임 선택, 프롬프트, 스키마, 기권 규칙.
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

// ponytail: 판별에 쓰는 프레임 수 — 정확도 knob이다. 6장에서 8장으로 올렸다.
// 결정적 구간(스쿼트의 맨 아래, 데드의 바닥 시작)이 한 장도 안 걸리면 모델은 기권하거나
// 찍는다. 이미지 한 장이 ~258토큰이라 8장이어도 리포트 호출(14장)보다 싸다.
// 기권율이 높으면 10장까지 올려보고, 응답이 느려지면 되돌린다.
export const IDENTIFY_FRAMES = 8;

// frameTimes가 앞뒤 준비 구간을 이미 잘라냈으므로 여기서는 고르게 솎기만 한다.
// (프레임 한 장은 "t=1.2s" 텍스트 + 이미지 두 파트라 쌍 단위로 센다.)
export const pickIdentifyFrames = (frames: Part[]) => {
  const pairs = Math.floor(frames.length / 2);
  const step = (pairs - 1) / Math.max(IDENTIFY_FRAMES - 1, 1);
  return Array.from({ length: IDENTIFY_FRAMES }, (_, i) => Math.round(step * i))
    .filter((pair, index, list) => list.indexOf(pair) === index)
    .flatMap((pair) => frames.slice(pair * 2, pair * 2 + 2));
};

// Gemini는 스키마에 적힌 순서대로 필드를 생성한다(propertyOrdering). 그래서 관찰
// 항목을 workout보다 앞에 둔다 — 이름을 먼저 뱉게 두면 그 뒤 필드들이 전부 그 이름을
// 합리화하는 쪽으로 흘렀다. 몸을 먼저 보게 만드는 게 이 순서의 전부다.
const IDENTIFY_ORDER = [
  "isWorkout",
  "bodyOrientation",
  "armPath",
  "workout",
  "confidence",
];

export const IDENTIFY_SCHEMA = {
  type: "OBJECT",
  properties: {
    isWorkout: { type: "BOOLEAN" },
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
) => `You identify ONE strength-training exercise from still frames sampled in order from a single video. Each frame is preceded by its timestamp.

Work in this order and do not skip ahead:
1. "bodyOrientation" — where is the torso across the frames? upright (standing or kneeling tall), horizontal (torso parallel to the floor, as in a push-up or plank), seated, lying (back or chest supported on a bench or the floor), mixed (upright in some frames and down on the floor in others).
2. "armPath" — how do the arms travel? forward (rising in front of the torso), sideways (rising out to the sides, away from the body), overhead (pressing or pulling above the head), pulling_down (pulling toward the chest or down from above), rotating (upper arms pinned against the ribs, only the forearms swing out or in), none.
3. "workout" — pick the single entry from the allowed list that matches BOTH observations above.
4. "confidence".

Rules for the cases that actually get confused:
- Torso horizontal, only hands and toes touching the floor, and NO frame shows the person standing → push_up. A burpee MUST contain a frame of the person standing or jumping. No standing frame, no burpee.
- Arms rising IN FRONT of the torso → front_raise. Arms rising OUT TO THE SIDES → lateral_raise. Upper arms pinned to the ribs with only the forearms swinging outward → external_rotation (inward → internal_rotation). These look alike at a glance and a rotation moves only a short distance; decide from "armPath", not from first impression.
- "forward" alone does not mean front_raise. A raise keeps the arms STRAIGHT and swings the whole arm up from the shoulder. If the elbow bends and the hand travels up toward the shoulder, it is a curl. If the hands stay close to the body and the ELBOWS lead upward past the shoulders, it is an upright row. Check the elbow before you pick.
- A frame may still catch the person walking to or from the camera. Judge the exercise from the frames where they are actually working.

Set "workout" to "${UNKNOWN_EXERCISE}" — rather than the nearest-looking entry — when the movement is not in the list, or when no frame shows the part of the movement that would separate it from a similar exercise. Set "confidence" to "low" when you did pick an entry but would not bet on it. A wrong name produces an entire report about the wrong exercise, so admitting you cannot tell is always the better answer.

Set "isWorkout" to false ONLY when the frames are clearly unrelated to training — scenery, pets, food, documents, screen recordings, someone doing something plainly non-athletic. Someone setting up for a set, resting between reps, holding equipment or standing in a gym is still training.${recentHint(recent)}`;

export type IdentifyResult =
  // 호출 자체가 실패했다(네트워크·쿼터). 호출부가 실패 토스트를 띄운다
  | { status: "failed" }
  | { status: "notWorkout" }
  // 운동은 맞는데 종목을 확정하지 못했다 — 리포트를 만들지 않는다
  | { status: "unknown" }
  | { status: "ok"; exercise: ExerciseTypes };

// ponytail: 기권 기준은 knob이다. 멀쩡한 영상까지 자주 튕기면(정상 영상 기권율이
// 15%를 넘으면) confidence 조건을 빼고 unknown만 남긴다. 반대로 틀린 이름이 계속
// 새면 medium까지 막는다. scripts/ai-eval.mjs로 재보고 정한다.
export const toIdentifyResult = (raw: any): IdentifyResult => {
  if (typeof raw?.isWorkout !== "boolean") return { status: "failed" };
  if (!raw.isWorkout) return { status: "notWorkout" };

  const exercise = findExercise(raw.workout);
  if (!exercise || raw.confidence === "low") return { status: "unknown" };
  return { status: "ok", exercise };
};
