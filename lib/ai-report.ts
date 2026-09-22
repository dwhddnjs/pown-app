// 숏츠 영상 → AI 자세 분석 리포트.
//
// 이 앱 최초의 네트워크 코드다. 백엔드가 없으므로 기기에서 Gemini를 직접 부른다.
//
// ponytail: 영상을 통째로 올리지 않고 프레임 14장만 뽑아 보낸다. Gemini File API를
// 쓰면 템포·바 속도까지 진짜로 보지만 50MB+ 리줌 업로드와 처리 상태 폴링이 붙는다.
// 템포 피드백이 실제로 필요해지면 그때 File API로 올린다.
//
// 호출은 두 번이다. 먼저 identifyWorkout이 "운동 영상인가 + 무슨 종목인가"를 정하고,
// 그 다음 generateReport가 그 종목의 자세만 평가한다. 종목을 리포트와 같은 호출에서
// 자유 문자열로 뽑던 예전 방식은 푸쉬업을 버피로, 프론트레이즈를 사레레로 읽고는
// 리포트 전체를 틀린 종목에 맞춰 써 버렸다.
import { EXERCISES, ExerciseTypes } from "@/constants/exercise";
import { ShortsReportTypes } from "@/hooks/use-shorts-store";
import { getLanguage, useUserStore } from "@/hooks/use-user-store";
import { useWorkoutPlanStore } from "@/hooks/use-workout-plan-store";
import {
  IDENTIFY_SCHEMA,
  IdentifyResult,
  Part,
  identifyInstruction,
  pickIdentifyFrames,
  toIdentifyResult,
} from "@/lib/ai-identify";
import { resolveMediaUri } from "@/lib/media";
// expo
import * as FileSystem from "expo-file-system";
import * as VideoThumbnails from "expo-video-thumbnails";

// 무료 티어 일일 한도가 모델마다 크게 다르다(2026-09 실측):
//   gemini-3.5-flash       20회/일  ← 출시된 앱에 붙일 수 없는 숫자
//   gemini-3.5-flash-lite  500회/일
// 구글이 문서에서 이 표를 내려서 실제로 429를 맞아 보기 전엔 알 수 없다.
// 교체는 이 상수 한 줄.
const MODEL = "gemini-3.5-flash-lite";
// 키가 털려 쿼터가 소진되면 여기만 프록시 URL로 바꾼다 (앱 코드는 그대로).
const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;
// Google AI Studio에서 발급하되 결제 계정이 연결되지 않은 프로젝트에 만든다 —
// 그래야 키가 털려도 과금이 구조적으로 불가능하다(최악이 일일 쿼터 소진).
// EAS에는 대시보드 Environment variables에 같은 이름으로 등록하고 visibility는
// 반드시 sensitive로 둔다. secret으로 두면 eas update가 값을 못 읽어 빈 키가 박힌
// 번들이 에러 없이 조용히 배포된다.
const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;

// ponytail: 이 헤더는 현재 아무것도 막지 못한다. 2026-09부터 Gemini 키는 서비스
// 계정에 묶인 auth key(AQ.*)로만 발급되는데, auth key에는 Cloud 콘솔의 "iOS 앱"
// 애플리케이션 제한이 적용되지 않는다 — 헤더 없이 호출해도 200으로 통과하는 걸 확인했다.
// 즉 번들에 박힌 키는 무방비다. 결제가 붙지 않은 프로젝트라 과금은 불가능하고
// 최악이 일일 쿼터 소진이다. 쿼터가 실제로 털리면 ENDPOINT를 프록시로 돌린다.
// 헤더는 구글이 제한을 고칠 때를 대비해 남겨 둔다 (무시되므로 무해).
const BUNDLE_ID = "com.anonymous.workout-app";

const FRAME_COUNT = 14;
// 한 세트를 넘어가는 길이는 잘라낸다 — 프레임 간격만 벌어지고 얻는 게 없다
const MAX_SPAN_MS = 60_000;
// flash-lite는 14프레임 리포트가 실측 3초다(사고 토큰이 없다). 60초면 충분한 여유고,
// 재시도까지 합친 최악이 약 2분이라 ai.writing의 "최대 2분" 문구와 맞는다.
// 예전 flash(50~95초)에 맞춰 180초를 두면 최악 9분이 되어 문구가 거짓말이 된다.
const REQUEST_TIMEOUT_MS = 60_000;
// 무료 티어는 분당 20회 제한(429)과 간헐적 과부하(503)가 둘 다 난다. 사용자가 광고까지
// 본 뒤에 한 번의 일시 오류로 전부 날리면 안 되니 상태 코드 실패만 두 번 더 친다.
// (타임아웃은 재시도하지 않는다. 180초를 두 번 기다리게 할 수는 없다.)
const RETRY_STATUS = [429, 500, 502, 503, 504];
const MAX_RETRY = 1;
// 429 본문에 "Please retry in 3.01s"처럼 대기 시간이 담겨 온다. 2초 고정으로 재시도했더니
// 구글이 말한 시간보다 일찍 들이받아 또 429를 맞고 포기했다.
const DEFAULT_RETRY_MS = 4000;
const MAX_RETRY_MS = 15_000;

const retryDelayMs = (body: string, attempt: number) => {
  const match =
    body.match(/retry in ([\d.]+)s/i) ??
    body.match(/"retryDelay":\s*"([\d.]+)s"/);
  const told = match ? Number(match[1]) * 1000 : NaN;
  const wait = Number.isFinite(told)
    ? told + 500
    : DEFAULT_RETRY_MS * (attempt + 1);
  return Math.min(wait, MAX_RETRY_MS);
};

// __DEV__ 전용 진단. no-console 규칙 때문에 로그를 못 남겨 실패 원인을 두 번이나
// 추측으로 좁혔다 — 개발 빌드에서는 토스트에 붙여 바로 보이게 한다.
let lastFailure = "";
export const getLastAiFailure = () => lastFailure;

// 앞뒤는 폰을 세우고 걸어오는 장면, 끝내고 돌아가 끄는 장면이다. 이게 섞이면 푸쉬업
// 영상이 "서기 → 바닥 → 서기"가 되어 그대로 버피의 동작 패턴으로 읽힌다. 판별 호출은
// 진작 앞뒤를 잘라내고 있었는데(그래서 판별은 맞았다) 리포트 호출만 전 구간을 받아
// 종목을 통째로 틀렸다. 이제 한 곳에서 자른다.
//
// 다만 잘라내는 건 "걸어와서 자세 잡는 시간"이고 그건 영상 길이에 비례하지 않는다 —
// 몇 초다. 비율로만 자르면 1분짜리 영상에서 앞뒤 10초씩이 날아가 세트 한가운데를
// 자르고, 빅4 브리프가 보라고 한 셋업(데드의 바닥 출발)과 락아웃이 통째로 사라진다.
// 상한을 두면 짧은 영상은 지금과 똑같이 자르고 긴 영상만 살아난다.
const TRIM_RATIO = 0.175;
const TRIM_MAX_MS = 3000;

// 프레임을 뽑을 시점(ms). 앞뒤 준비 구간을 뺀 나머지에서 고르게 뽑는다.
// duration을 못 읽었으면(0) 4초짜리로 가정한다 — 멈추는 것보단 낫다.
export const frameTimes = (durationMs: number, count = FRAME_COUNT) => {
  const span = Math.min(durationMs > 0 ? durationMs : 4000, MAX_SPAN_MS);
  const trim = Math.min(span * TRIM_RATIO, TRIM_MAX_MS);
  const step = (span - trim * 2) / Math.max(count - 1, 1);
  return Array.from({ length: count }, (_, i) => Math.round(trim + step * i));
};

// __DEV__ 전용. 모델에게 실제로 보낸 프레임을 디스크에 남긴다 — 이게 없으면 프롬프트를
// 고칠 때마다 빌드→촬영→광고→리포트 1회 제한에 막혀 정확도가 나아졌는지 알 수 없다.
// 시뮬레이터에서는 맥의 일반 폴더다:
//   xcrun simctl get_app_container booted com.anonymous.workout-app data
// 그 Documents/ai-frames/<영상파일명>/ 을 scripts/ai-eval.mjs에 그대로 물린다.
const devFrameDir = async (storedVideoUri: string) => {
  const name =
    storedVideoUri
      .split("/")
      .pop()
      ?.replace(/\.\w+$/, "") || "clip";
  const dir = `${FileSystem.documentDirectory}ai-frames/${name}/`;
  // 매번 비우고 시작한다. copyAsync는 대상이 이미 있으면 실패하고(lib/media.ts),
  // TRIM을 바꾸면 파일명(=시점 ms)도 바뀌어서, 안 비우면 예전 구간 프레임이 섞인
  // 폴더를 평가하게 된다 — 측정하려고 만든 것이 측정을 망친다.
  await FileSystem.deleteAsync(dir, { idempotent: true });
  await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
  return dir;
};

// 프레임마다 "t=1.2s" 텍스트를 앞에 붙인다 — 정지 이미지 나열로는 사라지는
// 시간축을 모델이 최소한 순서로는 읽을 수 있게 한다.
export const extractFrames = async (
  storedVideoUri: string,
  durationMs: number,
  count = FRAME_COUNT,
): Promise<Part[]> => {
  const source = resolveMediaUri(storedVideoUri);
  const parts: Part[] = [];
  const dumpDir = __DEV__
    ? await devFrameDir(storedVideoUri).catch(() => "")
    : "";

  for (const time of frameTimes(durationMs, count)) {
    try {
      const { uri } = await VideoThumbnails.getThumbnailAsync(source, {
        time,
        quality: 0.5,
      });
      const data = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      if (dumpDir) {
        // 덤프가 실패해도 멀쩡한 프레임을 버리지 않는다
        await FileSystem.copyAsync({
          from: uri,
          to: `${dumpDir}${String(time).padStart(6, "0")}.jpg`,
        }).catch(() => {});
      }
      // 캐시에 쌓아두면 분석할 때마다 14장씩 늘어난다
      FileSystem.deleteAsync(uri, { idempotent: true }).catch(() => {});
      parts.push({ text: `t=${(time / 1000).toFixed(1)}s` });
      parts.push({ inlineData: { mimeType: "image/jpeg", data } });
    } catch {
      // 그 시점만 못 뽑았다 — 나머지 프레임으로 계속 간다
    }
  }
  return parts;
};

const callGemini = async (
  systemInstruction: string,
  parts: Part[],
  responseSchema: object,
  temperature: number,
): Promise<any | null> => {
  if (!API_KEY || parts.length === 0) {
    lastFailure = !API_KEY ? "no api key" : "no frames";
    return null;
  }

  for (let attempt = 0; ; attempt++) {
    const call = await callOnce(
      systemInstruction,
      parts,
      responseSchema,
      temperature,
    );
    if (call.result !== null || !call.retryable || attempt >= MAX_RETRY) {
      return call.result;
    }
    await new Promise((resolve) =>
      setTimeout(resolve, retryDelayMs(call.body, attempt)),
    );
  }
};

const callOnce = async (
  systemInstruction: string,
  parts: Part[],
  responseSchema: object,
  temperature: number,
): Promise<{ result: any | null; retryable: boolean; body: string }> => {
  // callGemini에서 이미 걸렀지만 여기서도 좁혀야 타입이 통과한다
  if (!API_KEY) {
    lastFailure = "no api key";
    return { result: null, retryable: false, body: "" };
  }

  // AbortSignal.timeout은 Hermes에 없다 — 컨트롤러를 직접 돌린다
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": API_KEY,
        "X-Ios-Bundle-Identifier": BUNDLE_ID,
      },
      signal: controller.signal,
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemInstruction }] },
        contents: [{ role: "user", parts }],
        generationConfig: {
          temperature,
          responseMimeType: "application/json",
          responseSchema,
        },
      }),
    });
    if (!response.ok) {
      const body = await response.text().catch(() => "");
      lastFailure = `HTTP ${response.status}`;
      return {
        result: null,
        retryable: RETRY_STATUS.includes(response.status),
        body,
      };
    }

    const json = await response.json();
    // 사고(thought) 파트가 섞여 오므로 실제 답변 텍스트만 추린다
    const text = (json?.candidates?.[0]?.content?.parts ?? [])
      .filter((part: any) => part?.text && !part?.thought)
      .map((part: any) => part.text)
      .join("");
    if (!text) lastFailure = "empty response";
    return {
      result: text ? JSON.parse(text) : null,
      retryable: false,
      body: "",
    };
  } catch (error) {
    // 네트워크·중단(타임아웃)·파싱 실패 — 호출부가 토스트를 띄운다 (console 금지)
    lastFailure =
      (error as Error)?.name === "AbortError" ? "timeout" : "network";
    return { result: null, retryable: false, body: "" };
  } finally {
    clearTimeout(timer);
  }
};

// 최근에 기록한 종목 몇 개. 이 앱은 운동 기록 앱인데 그 기록을 AI에게 한 번도 준 적이
// 없었다 — 공짜로 쓸 수 있는 가장 큰 단서다.
//
// workoutPlanList는 이미 최신순 정렬이라(sortByCreatedAtDesc) 앞에서 자르는 게 곧
// "최근"이다. 날짜 파싱이 필요 없다. plan.workout은 사용자가 직접 칠 수도 있는 자유
// 문자열이라 사전에 정확히 맞는 것만 통과시킨다 — 못 맞히면 힌트가 비고, 그건 지금과
// 같은 동작이다(조용히 없는 쪽이 옳은 실패다).
const RECENT_PLANS = 30;
const RECENT_HINT_MAX = 10;

const recentExercises = () => {
  const names = new Set<string>();
  for (const plan of useWorkoutPlanStore
    .getState()
    .workoutPlanList.slice(0, RECENT_PLANS)) {
    const name = plan.workout?.trim();
    const exercise = EXERCISES.find(
      (item) => item.ko === name || item.en === name,
    );
    if (exercise) names.add(exercise.key);
    if (names.size >= RECENT_HINT_MAX) break;
  }
  return [...names];
};

// 판별과 종목 인식을 한 호출로 합쳤다. 광고는 이 뒤에 붙으므로, 여기서 기권하면
// 사용자는 광고도 안 보고 영상당 1회뿐인 리포트 기회도 잃지 않는다.
// 종목 판별은 창작이 아니다 — 같은 프레임이면 같은 답이 나와야 하므로 temperature 0.
export const identifyWorkout = async (
  frames: Part[],
): Promise<IdentifyResult> =>
  toIdentifyResult(
    await callGemini(
      identifyInstruction(recentExercises()),
      pickIdentifyFrames(frames),
      IDENTIFY_SCHEMA,
      0,
    ),
  );

// workout·bodyPart는 여기 없다 — 앱이 constants/exercise.ts에서 채운다.
// 모델에게 이름을 짓게 두면 "사레레" 같은 은어가 나오고, 틀린 이름이 리포트 전체를
// 끌고 간다. 모델은 자세 평가에만 용량을 쓴다.
//
// 순서가 내용을 바꾼다. 판별 호출은 진작 propertyOrdering으로 "이름을 말하기 전에
// 몸을 먼저 보게" 만들었는데(lib/ai-identify.ts), 리포트 호출엔 그 교훈이 오지 않아
// score가 맨 앞 — 즉 아무것도 관찰하기 전에 점수를 찍고 나머지 필드가 그 숫자를
// 합리화하고 있었다. 같은 버그가 형제 경로에 그대로 남아 있었다.
//
// 이제: 안 보이는 것 인정(camera) → 관절별 관찰(checkpoints) → 판단(good/bad/risk)
// → 처방(improve/drills/heavy) → 점수. score는 결론이지 첫인상이 아니다.
const REPORT_ORDER = [
  "camera",
  "checkpoints",
  "good",
  "bad",
  "risk",
  "improve",
  "drills",
  "heavy",
  "score",
];

const REPORT_SCHEMA = {
  type: "OBJECT",
  propertyOrdering: REPORT_ORDER,
  properties: {
    score: { type: "INTEGER" },
    risk: { type: "STRING" },
    // cues가 있는 종목(파워리프팅 빅4)에서만 채워진다
    heavy: { type: "ARRAY", items: { type: "STRING" } },
    checkpoints: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          joint: { type: "STRING" },
          status: { type: "STRING", enum: ["good", "caution"] },
          note: { type: "STRING" },
        },
        required: ["joint", "status", "note"],
      },
    },
    good: { type: "ARRAY", items: { type: "STRING" } },
    bad: { type: "ARRAY", items: { type: "STRING" } },
    improve: { type: "ARRAY", items: { type: "STRING" } },
    drills: { type: "ARRAY", items: { type: "STRING" } },
    camera: { type: "STRING" },
  },
  required: ["score", "checkpoints", "good", "bad", "improve", "drills"],
};

// 저장된 신체정보를 프롬프트 한 줄로. 없으면 빈 문자열 — 없는 값을 지어내게 두지 않는다.
const userContext = () => {
  const info = useUserStore.getState().userInfo.at(-1);
  if (!info) return "";
  const fields = [
    info.gender && `sex: ${info.gender}`,
    info.age && `age: ${info.age}`,
    info.height && `height: ${info.height}cm`,
    info.weight && `body weight: ${info.weight}kg`,
    info.sq && `squat 1RM: ${info.sq}kg`,
    info.bp && `bench 1RM: ${info.bp}kg`,
    info.dl && `deadlift 1RM: ${info.dl}kg`,
  ].filter(Boolean);
  return fields.length
    ? `\n\nLifter profile (use it for load/leverage context, never repeat it back): ${fields.join(", ")}.`
    : "";
};

const systemInstruction = (exercise: ExerciseTypes) => {
  const ko = getLanguage() === "ko";
  const lang = ko ? "Korean" : "English";
  // 말투: 앱 전체가 "~해요"체다. "수행하십시오" 같은 문어체가 섞이면 튄다.
  const tone = ko
    ? "Write in friendly Korean ~해요 style, like a coach talking to you at the gym. Never use 하십시오/하라 style."
    : "Write in plain, friendly English, like a coach talking to you at the gym.";

  // 빅4는 "PT 없이는 독학이 안 되는" 종목이라 코치의 정체성부터 바꾼다.
  // 브리프가 있는데 일반 코치로 말하게 두면 체크리스트를 받고도 일반론으로 돌아간다.
  const role = exercise.cues
    ? `You are a powerlifting coach. You have taken lifters from their first bar to competition platforms, and your job here is the one a lifter cannot do for themselves: watch their ${exercise.en} and tell them exactly what is capping the weight on the bar.`
    : "You are a strength coach with deep expertise in biomechanics and functional anatomy.";

  // 종목별 체크리스트. 모델은 이 종목을 "안다"고 착각하기 쉬운데, 무거운 중량에서
  // 실제로 무너지는 지점은 짚어주지 않으면 일반론으로 흐른다.
  const brief = exercise.cues
    ? `

WHAT TO CHECK ON THIS LIFT — go through every line against the frames before you write a single word. These are the things that separate a lift that stalls from one that keeps adding weight:
${exercise.cues}

Only report what you can actually see in these frames. Do not read this list back to the lifter, and do not claim you checked something the camera angle hides.`
    : "";

  return `${role}

You receive still frames sampled in order from one video of a single person training. Each frame is preceded by its timestamp.

The exercise has already been identified: **${exercise.en}**. Coach THIS movement — do not re-identify it, do not name a different one, and do not print the exercise name anywhere in your answer (the app shows it already). If the frames genuinely do not look like ${exercise.en}, say that in "camera" instead of silently grading something else.${brief}

WHO YOU ARE WRITING FOR — this matters more than anything else:
A regular gym-goer, not a clinician. Someone who has trained for years and still does not know what "요추 굴곡", "골반 후방 경사" or "dorsiflexion" mean. If they have to re-read a sentence, you have failed.

How to write:
- Plain words FIRST, always. Describe what the body is doing in words anyone would use: "허리가 살짝 말려요", "엉덩이가 밑에서 말려 들어가요", "발목이 잘 접혀요".
- You may add the technical term in parentheses ONCE, right after the plain description, and only when it is genuinely useful: "허리가 살짝 말려요 (요추 굴곡)". Never lead with the term. Never stack two terms in one sentence. Many bullets should have no term at all.
- NEVER print raw timestamps like "t=7.7s". The reader has no idea what that means. Say where in the movement it happens instead: "가장 낮은 지점에서", "일어서기 시작할 때", "내려가는 중반에", "맨 아래 두 번 모두에서".
- Say why it matters in practical terms — what it does to their training or their body — not just what it is.
- ${tone}
- Keep each bullet to 1-2 sentences.

THE RULE THAT DECIDES WHETHER THIS REPORT IS WORTH READING:
Every item in "bad" and "improve" must be something you can actually point at in a specific frame, and must say WHERE in the movement it happens ("맨 아래에서", "일어서기 시작할 때", "마지막 두 번은"). If you cannot point at it, delete it. A sentence that would fit any video of this exercise — "코어에 힘을 주세요", "허리를 곧게 펴세요" — is worse than writing nothing, because it teaches the reader that this report is filler.

Other rules:
- Write every field in ${lang} ONLY.
- "good", "bad", "improve": at most 3 items each, most important FIRST. The first item in "bad" must be the one thing that, if fixed, would change the most. If you only found one real problem, write one — three sharp items beat six vague ones.
- "checkpoints[].joint": an everyday body-part name in ${lang} ONLY (발목, 무릎, 고관절, 허리, 어깨 …). No English, no parentheses.
- "checkpoints[].status": "caution" whenever the note describes anything the lifter should change — a position that is off, a joint that moves the wrong way, anything you would stop them to fix. "good" ONLY when the note is pure praise. The app paints a warning colour from this field, so a note pointing out a fault while marked "good" is worse than not writing it.
- These are sampled stills, NOT continuous video. You cannot judge tempo, bar speed, time under tension or breathing — do not pretend otherwise.
- If the camera angle hides what you need, say so in "camera" and ask for the angle you need, in plain words. Leave "camera" out when the angle was fine.
- "risk" only when you actually see an injury-risk pattern. Omit it otherwise — do not invent a warning.
- "drills": 1-2 concrete drills or cues for the next session, described so they can do it without looking anything up.
${
  exercise.cues
    ? `- "heavy": 1-2 items, and this is what they came for. Name the specific thing in THIS clip that will break FIRST as the bar gets heavier, and the one concrete change that buys stable reps at a higher load — a setup change, a bracing change, a bar-path change, or a loading decision ("지금 무게로 3주만 더 다듬고 올리기"). Not a drill; drills go in "drills". If their form here is genuinely solid, say what the next limit will be instead of inventing a flaw.`
    : `- Leave "heavy" out entirely.`
}
- "score" 0-100 for the technique in THIS clip only — not for the lifter in general — written LAST, as a summary of what you just wrote rather than a first impression. 90+: nothing real to fix. 75-89: solid, one minor leak. 60-74: it works, but there is a clear leak.${
    exercise.cues
      ? " Below 60: a pattern that will hurt them under a heavy bar."
      : " Below 60: a pattern that will hurt them if they keep repeating it."
  }
- This is coaching feedback, not medical advice.${userContext()}`;
};

const toStringList = (value: unknown): string[] =>
  Array.isArray(value)
    ? value.filter((v): v is string => typeof v === "string")
    : [];

// ponytail: 그래도 종목이 자주 틀리면 다음 단계는 identifyWorkout을 3회 병렬로 돌려
// 다수결을 내는 것이다(분석당 호출 4회 = 무료 125회/일). 싼 수정의 효과를 먼저 재고.
export const generateReport = async (
  frames: Part[],
  exercise: ExerciseTypes,
): Promise<ShortsReportTypes | null> => {
  const raw = await callGemini(
    systemInstruction(exercise),
    frames,
    REPORT_SCHEMA,
    0.4,
  );
  if (!raw) return null;
  // 스키마는 빈 배열로도 만족된다(required에 최소 개수가 없다). 게다가 새 프롬프트는
  // "짚을 수 없으면 지워라"로 빈 배열 쪽을 민다 — 전부 빈 리포트가 진짜로 나올 수 있다.
  // 그게 저장되면 사용자는 광고까지 본 뒤 머리말과 0점 막대만 남은 화면을 받고, 영상당
  // 1회 정책이라 다시 만들 수도 없다. 알맹이가 하나도 없으면 실패로 되돌린다.
  const hasContent = [
    raw.checkpoints,
    raw.good,
    raw.bad,
    raw.improve,
    raw.drills,
  ].some((field) => Array.isArray(field) && field.length > 0);
  if (!hasContent) {
    lastFailure = "empty report";
    return null;
  }

  return {
    // 종목명은 모델이 아니라 사전에서 온다 — 은어가 나올 통로가 없다
    workout: getLanguage() === "ko" ? exercise.ko : exercise.en,
    bodyPart: exercise.part,
    score: Math.max(0, Math.min(100, Math.round(Number(raw.score) || 0))),
    risk: typeof raw.risk === "string" && raw.risk ? raw.risk : undefined,
    checkpoints: Array.isArray(raw.checkpoints)
      ? raw.checkpoints
          .filter((c: any) => c?.joint && c?.note)
          .map((c: any) => ({
            joint: String(c.joint),
            status:
              c.status === "caution" ? ("caution" as const) : ("good" as const),
            note: String(c.note),
          }))
      : [],
    good: toStringList(raw.good),
    bad: toStringList(raw.bad),
    improve: toStringList(raw.improve),
    drills: toStringList(raw.drills),
    // 브리프가 없는 종목이면 프롬프트가 빼라고 했어도 모델이 채울 수 있다 — 종목명을
    // 스키마로 막아놓고 새 필드는 부탁으로 막는 건 같은 실수의 반복이다. 여기서 끊는다.
    heavy: exercise.cues ? toStringList(raw.heavy) : undefined,
    camera:
      typeof raw.camera === "string" && raw.camera ? raw.camera : undefined,
    createdAt: new Date().toISOString(),
  };
};
