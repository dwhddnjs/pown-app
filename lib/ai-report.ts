// 숏츠 영상 → AI 자세 분석 리포트.
//
// 이 앱 최초의 네트워크 코드다. 백엔드가 없으므로 기기에서 Gemini를 직접 부른다.
//
// ponytail: 영상을 통째로 올리지 않고 프레임 14장만 뽑아 보낸다. Gemini File API를
// 쓰면 템포·바 속도까지 진짜로 보지만 50MB+ 리줌 업로드와 처리 상태 폴링이 붙는다.
// 템포 피드백이 실제로 필요해지면 그때 File API로 올린다.
import { ShortsReportTypes } from "@/hooks/use-shorts-store";
import { getLanguage, useUserStore } from "@/hooks/use-user-store";
import { resolveMediaUri } from "@/lib/media";
import { WORKOUT_TYPE_LIST, WorkoutTypes } from "@/types/workout";
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
// 판별은 가운데 5장이면 충분하다 — 14장 다 보내면 느려지고 쿼터도 먹는다
const CLASSIFY_FRAMES = 5;
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

type Part =
  { text: string } | { inlineData: { mimeType: string; data: string } };

// 프레임을 뽑을 시점(ms). 맨 앞·맨 뒤는 준비 자세라 정보가 적어서 5%~95% 구간만 쓴다.
// duration을 못 읽었으면(0) 4초짜리로 가정한다 — 멈추는 것보단 낫다.
export const frameTimes = (durationMs: number, count = FRAME_COUNT) => {
  const span = Math.min(durationMs > 0 ? durationMs : 4000, MAX_SPAN_MS);
  const start = span * 0.05;
  const step = (span * 0.9) / Math.max(count - 1, 1);
  return Array.from({ length: count }, (_, i) => Math.round(start + step * i));
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

  for (const time of frameTimes(durationMs, count)) {
    try {
      const { uri } = await VideoThumbnails.getThumbnailAsync(source, {
        time,
        quality: 0.5,
      });
      const data = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
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
): Promise<any | null> => {
  if (!API_KEY || parts.length === 0) {
    lastFailure = !API_KEY ? "no api key" : "no frames";
    return null;
  }

  for (let attempt = 0; ; attempt++) {
    const call = await callOnce(systemInstruction, parts, responseSchema);
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
          temperature: 0.4,
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

const CLASSIFY_SCHEMA = {
  type: "OBJECT",
  properties: { isWorkout: { type: "BOOLEAN" } },
  required: ["isWorkout"],
};

// null = 판별 실패(네트워크 등). false = 운동 영상이 아님.
export const classifyWorkout = async (
  frames: Part[],
): Promise<boolean | null> => {
  // 앞뒤 20%는 버리고 가운데에서만 고른다. 직접 찍은 영상은 시작이 "폰 세우고
  // 걸어가는 장면", 끝이 "돌아와서 끄는 장면"이라 정작 운동은 가운데에만 있다.
  // 처음·중간·끝을 뽑던 예전 방식은 3장 중 2장이 서 있는 사람이라 판별이 뒤집혔다.
  const pairs = Math.floor(frames.length / 2);
  const first = Math.floor(pairs * 0.2);
  const last = Math.max(pairs - 1 - Math.floor(pairs * 0.2), first);
  const step = (last - first) / Math.max(CLASSIFY_FRAMES - 1, 1);
  const picked = Array.from({ length: CLASSIFY_FRAMES }, (_, i) =>
    Math.round(first + step * i),
  )
    .filter((pair, index, list) => list.indexOf(pair) === index)
    .flatMap((pair) => frames.slice(pair * 2, pair * 2 + 2));

  // 이 단계의 일은 명백히 무관한 영상을 걸러내는 것이지 심사가 아니다.
  // 엄격하게 굴면 준비 자세나 세트 사이 휴식을 찍은 멀쩡한 영상을 반려한다.
  const result = await callGemini(
    "Decide whether these frames come from a video of someone training. " +
      "Answer isWorkout=true if ANY frame shows a person exercising, setting up for a set, " +
      "resting between sets, holding equipment, or standing in a gym or training space. " +
      "Be generous: one frame of a person mid-movement is enough, and frames of the same " +
      "person standing still between reps still count. " +
      "Answer false only when the frames are clearly unrelated to training — scenery, pets, " +
      "food, documents, screen recordings, or someone doing something plainly non-athletic.",
    picked,
    CLASSIFY_SCHEMA,
  );
  return typeof result?.isWorkout === "boolean" ? result.isWorkout : null;
};

const REPORT_SCHEMA = {
  type: "OBJECT",
  properties: {
    workout: { type: "STRING" },
    bodyPart: { type: "STRING", enum: [...WORKOUT_TYPE_LIST] },
    score: { type: "INTEGER" },
    risk: { type: "STRING" },
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
  required: [
    "workout",
    "bodyPart",
    "score",
    "checkpoints",
    "good",
    "bad",
    "improve",
    "drills",
  ],
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

const systemInstruction = () => {
  const ko = getLanguage() === "ko";
  const lang = ko ? "Korean" : "English";
  // 말투: 앱 전체가 "~해요"체다. "수행하십시오" 같은 문어체가 섞이면 튄다.
  const tone = ko
    ? "Write in friendly Korean ~해요 style, like a coach talking to you at the gym. Never use 하십시오/하라 style."
    : "Write in plain, friendly English, like a coach talking to you at the gym.";

  return `You are a strength coach with deep expertise in biomechanics and functional anatomy.

You receive still frames sampled in order from one video of a single person training. Each frame is preceded by its timestamp.

WHO YOU ARE WRITING FOR — this matters more than anything else:
A regular gym-goer, not a clinician. Someone who has trained for years and still does not know what "요추 굴곡", "골반 후방 경사" or "dorsiflexion" mean. If they have to re-read a sentence, you have failed.

How to write:
- Plain words FIRST, always. Describe what the body is doing in words anyone would use: "허리가 살짝 말려요", "엉덩이가 밑에서 말려 들어가요", "발목이 잘 접혀요".
- You may add the technical term in parentheses ONCE, right after the plain description, and only when it is genuinely useful: "허리가 살짝 말려요 (요추 굴곡)". Never lead with the term. Never stack two terms in one sentence. Many bullets should have no term at all.
- NEVER print raw timestamps like "t=7.7s". The reader has no idea what that means. Say where in the movement it happens instead: "가장 낮은 지점에서", "일어서기 시작할 때", "내려가는 중반에", "맨 아래 두 번 모두에서".
- Say why it matters in practical terms — what it does to their training or their body — not just what it is.
- ${tone}
- Keep each bullet to 1-2 sentences.

Other rules:
- "workout": the exercise name in ${lang} ONLY. Do not append a translation in parentheses.
- "checkpoints[].joint": an everyday body-part name in ${lang} ONLY (발목, 무릎, 고관절, 허리, 어깨 …). No English, no parentheses.
- These are sampled stills, NOT continuous video. You cannot judge tempo, bar speed, time under tension or breathing — do not pretend otherwise.
- If the camera angle hides what you need, say so in "camera" and ask for the angle you need, in plain words. Leave "camera" out when the angle was fine.
- "score" is 0-100 for the technique in THIS clip only.
- "risk" only when you actually see an injury-risk pattern. Omit it otherwise — do not invent a warning.
- "bodyPart" is the primary region trained.
- "drills": 1-2 concrete drills or cues for the next session, described so they can do it without looking anything up.
- This is coaching feedback, not medical advice.${userContext()}`;
};

const clampBodyPart = (value: unknown): WorkoutTypes =>
  // 스키마 enum이 막아 주지만, 막히지 않았을 때 화면이 아이콘을 못 찾고 죽는 걸 방지
  WORKOUT_TYPE_LIST.includes(value as WorkoutTypes)
    ? (value as WorkoutTypes)
    : "leg";

const toStringList = (value: unknown): string[] =>
  Array.isArray(value)
    ? value.filter((v): v is string => typeof v === "string")
    : [];

export const generateReport = async (
  frames: Part[],
): Promise<ShortsReportTypes | null> => {
  const raw = await callGemini(systemInstruction(), frames, REPORT_SCHEMA);
  if (!raw?.workout) return null;

  return {
    workout: String(raw.workout),
    bodyPart: clampBodyPart(raw.bodyPart),
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
    camera:
      typeof raw.camera === "string" && raw.camera ? raw.camera : undefined,
    createdAt: new Date().toISOString(),
  };
};
