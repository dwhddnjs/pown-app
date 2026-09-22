// AI 종목 인식 정확도 측정기. 앱 번들에 들어가지 않는다(아무도 import하지 않는다).
//
// 왜 필요한가: 프롬프트를 고칠 때마다 빌드 → 촬영 → 광고 → "영상당 리포트 1회" 제한에
// 막혀서, 정확도가 나아졌는지 좋아졌다는 느낌 말고는 알 방법이 없었다. 여기서는 같은
// 프레임을 몇 초 만에 다시 돌려 숫자로 비교한다.
//
// 쓰는 법
//   1) 개발 빌드로 문제의 영상들을 분석한다 (__DEV__면 프레임이 디스크에 남는다)
//   2) xcrun simctl get_app_container booted com.anonymous.workout-app data
//      → <그 경로>/Documents/ai-frames/ 아래 영상별 폴더가 생겨 있다
//   3) 폴더 이름을 정답으로 바꾼다 (enum key / 한글명 / 영문명 아무거나: push_up, 푸쉬업 …)
//      운동이 아닌 영상을 섞고 싶으면 폴더 이름을 notWorkout으로 둔다
//   4) node --env-file=.env scripts/ai-eval.mjs <그 ai-frames 경로>
//
// 프롬프트·스키마·기권 규칙은 lib/ai-identify.ts를 그대로 쓴다. 복사본을 두면 어긋나는
// 순간 측정치가 거짓말이 되므로, TypeScript를 그때그때 벗겨서 진짜 파일을 불러온다.
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import ts from "typescript";

const ROOT = process.cwd();
const CACHE = path.join(ROOT, "node_modules/.cache/ai-eval");
// lib/ai-identify.ts가 끌고 오는 것 전부. 셋 다 런타임 의존성이 없는 순수 데이터다.
const SOURCES = [
  "types/workout.ts",
  "constants/exercise.ts",
  "lib/ai-identify.ts",
];

// ai-report.ts와 같은 값이어야 한다. --model=로 덮어쓰면 "모델을 키우면 해결되나"를
// 쿼터만 쓰고 바로 확인할 수 있다 (gemini-3.5-flash는 무료 20회/일).
const DEFAULT_MODEL = "gemini-3.5-flash-lite";
// 무료 티어는 분당 20회 제한이 있다 — 한 건씩, 사이를 띄워 돈다
const GAP_MS = 3500;

const loadIdentifyModule = async () => {
  fs.rmSync(CACHE, { recursive: true, force: true });
  for (const rel of SOURCES) {
    const out = path.join(CACHE, rel.replace(/\.ts$/, ".mjs"));
    const { outputText } = ts.transpileModule(
      fs.readFileSync(path.join(ROOT, rel), "utf8"),
      {
        compilerOptions: {
          module: ts.ModuleKind.ESNext,
          target: ts.ScriptTarget.ES2022,
        },
      },
    );
    // "@/x/y" 별칭은 metro만 아는 것이라 node가 읽을 상대경로로 바꿔준다
    const code = outputText.replace(/(["'])@\/([^"']+)\1/g, (_, q, target) => {
      let to = path.relative(
        path.dirname(out),
        path.join(CACHE, `${target}.mjs`),
      );
      if (!to.startsWith(".")) to = `./${to}`;
      return `${q}${to}${q}`;
    });
    fs.mkdirSync(path.dirname(out), { recursive: true });
    fs.writeFileSync(out, code);
  }
  return import(pathToFileURL(path.join(CACHE, "lib/ai-identify.mjs")).href);
};

// 운동이 아닌 영상을 섞어 넣고 싶을 때 쓰는 정답 라벨. isWorkout=false가 정답이 된다
const NOT_WORKOUT = ["notworkout", "운동아님"];

// 폴더 이름을 정답 key로. key·한글명·영문명 아무거나 받는다 — 폴더 이름을 바꾸는 건
// 사람이 하는 일이라 "push_up"을 정확히 적으라고 요구할 이유가 없다.
//
// 같은 종목을 여러 개 넣으려면 폴더 이름이 겹치면 안 되니 푸쉬업2·push_up-2처럼
// 쓰게 된다. 뒤의 번호를 떼고 맞춰본다 — 안 그러면 모델이 맞혀도 전부 오답이 되고,
// 여러 클립으로 도는 "정상적인" 측정이 정확도 0%를 찍는다.
const toKey = (EXERCISES, label) => {
  const norm = (v) => v.toLowerCase().replace(/[\s_-]/g, "");
  const find = (v) =>
    EXERCISES.find((item) =>
      [item.key, item.ko, item.en].some((x) => norm(x) === norm(v)),
    );
  const hit = find(label) ?? find(label.replace(/[\s_-]*\d+$/, ""));
  return hit?.key ?? label;
};

// 라벨을 못 알아봤으면 크게 알린다. 조용히 넘어가면 오답으로 세어놓고 왜 떨어졌는지
// 프롬프트를 뒤지게 된다 — 측정 도구가 거짓말하는 게 제일 나쁘다.
const unknownLabel = (EXERCISES, expected) =>
  !NOT_WORKOUT.includes(expected.toLowerCase().replace(/[\s_-]/g, "")) &&
  !EXERCISES.some((item) => item.key === expected);

const framesFromDir = (dir) =>
  fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".jpg"))
    .sort()
    .flatMap((file) => [
      { text: `t=${(parseInt(file, 10) / 1000).toFixed(1)}s` },
      {
        inlineData: {
          mimeType: "image/jpeg",
          data: fs.readFileSync(path.join(dir, file)).toString("base64"),
        },
      },
    ]);

const main = async () => {
  const args = process.argv.slice(2);
  const model =
    args.find((a) => a.startsWith("--model="))?.slice(8) ?? DEFAULT_MODEL;
  const root = args.find((a) => !a.startsWith("--"));
  const key = process.env.EXPO_PUBLIC_GEMINI_API_KEY;

  if (!root || !key) {
    console.error(
      "사용: node --env-file=.env scripts/ai-eval.mjs <ai-frames 경로> [--model=…]\n" +
        (key
          ? ""
          : "EXPO_PUBLIC_GEMINI_API_KEY가 없습니다 (--env-file=.env 빠뜨렸나요?)"),
    );
    process.exit(1);
  }

  const mod = await loadIdentifyModule();
  const { EXERCISES } = await import(
    pathToFileURL(path.join(CACHE, "constants/exercise.mjs")).href
  );

  const cases = fs
    .readdirSync(root, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => ({ label: d.name, dir: path.join(root, d.name) }));

  if (cases.length === 0) {
    console.error(`${root} 아래에 프레임 폴더가 없습니다.`);
    process.exit(1);
  }

  console.log(`모델 ${model} · ${cases.length}건\n`);
  const rows = [];

  for (const [index, item] of cases.entries()) {
    const expected = toKey(EXERCISES, item.label);
    const parts = mod.pickIdentifyFrames(framesFromDir(item.dir));
    const raw = await callGemini(model, key, parts, mod);
    const verdict = mod.toIdentifyResult(raw);
    const got =
      verdict.status === "ok" ? verdict.exercise.key : `(${verdict.status})`;
    const wantNotWorkout = NOT_WORKOUT.includes(
      expected.toLowerCase().replace(/[\s_-]/g, ""),
    );
    rows.push({
      expected,
      got,
      hit: wantNotWorkout
        ? verdict.status === "notWorkout"
        : verdict.status === "ok" && verdict.exercise.key === expected,
      abstain: verdict.status === "unknown",
      // 429·503·네트워크는 프롬프트의 실력이 아니다. 오답에 섞으면 쿼터에 막힌 날
      // 프롬프트가 나빠진 것처럼 보인다 — 앱은 이걸 재시도해서 맞혔을 것이다.
      failed: verdict.status === "failed",
      bad: unknownLabel(EXERCISES, expected),
      raw,
    });
    print(rows.at(-1));
    if (index < cases.length - 1)
      await new Promise((r) => setTimeout(r, GAP_MS));
  }

  // 호출이 실패한 건은 분모에서 뺀다 — 프롬프트를 재는 게 목적이다
  const scored = rows.filter((r) => !r.failed);
  const hit = scored.filter((r) => r.hit).length;
  const abstain = scored.filter((r) => r.abstain).length;
  const failed = rows.length - scored.length;
  console.log(
    `\n정답 ${hit}/${scored.length} · 기권 ${abstain} · 오답 ${scored.length - hit - abstain}` +
      (failed ? ` · 호출실패 ${failed}(집계 제외)` : ""),
  );
  const mislabelled = rows.filter((r) => r.bad).map((r) => r.expected);
  if (mislabelled.length) {
    console.log(
      `폴더 이름을 종목으로 못 읽었습니다: ${mislabelled.join(", ")}\n` +
        "  → 이 건들은 무슨 답이 나와도 오답이 됩니다. key·한글명·영문명 중 하나로 바꾸세요.",
    );
  }
  // 기권이 너무 잦으면 멀쩡한 영상도 리포트를 못 받는다 — lib/ai-identify.ts의
  // toIdentifyResult에서 confidence 조건을 빼는 게 그때의 knob이다.
  if (scored.length && abstain / scored.length > 0.15) {
    console.log(
      "기권율이 15%를 넘습니다 — toIdentifyResult의 기권 기준을 느슨하게 할 것",
    );
  }
};

const print = (row) => {
  // 호출실패(!)는 오답(X)과 다르게 찍는다 — 표에서도 구분돼야 의미가 있다
  const mark = row.failed ? "!" : row.hit ? "O" : row.abstain ? "-" : "X";
  const pad = (v, n) => String(v).padEnd(n);
  console.log(
    `${mark} ${pad(row.expected, 24)}→ ${pad(row.got, 24)}` +
      `${pad(row.raw?.confidence ?? "", 8)}${pad(row.raw?.bodyOrientation ?? "", 12)}${row.raw?.armPath ?? ""}`,
  );
};

// 던지지 않는다. 한 건이 터져서 프로세스가 죽으면 이미 쓴 쿼터가 통째로 날아간다.
const callGemini = async (model, key, parts, mod) => {
  try {
    return await callGeminiOnce(model, key, parts, mod);
  } catch (error) {
    console.error("호출 실패:", error?.message ?? error);
    return null;
  }
};

const callGeminiOnce = async (model, key, parts, mod) => {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": key },
      body: JSON.stringify({
        // 힌트 없이 잰다. 앱은 사용자의 운동 기록을 힌트로 넣지만 스크립트는 그걸
        // 알 수 없고, 넣는다 해도 "기록이 없는 사용자"의 정확도가 이 숫자다 —
        // 프롬프트의 실력을 재는 게 목적이므로 하한을 재는 쪽이 맞다.
        systemInstruction: { parts: [{ text: mod.identifyInstruction([]) }] },
        contents: [{ role: "user", parts }],
        generationConfig: {
          temperature: 0,
          responseMimeType: "application/json",
          responseSchema: mod.IDENTIFY_SCHEMA,
        },
      }),
    },
  );
  if (!response.ok) {
    console.error(
      `HTTP ${response.status}`,
      (await response.text()).slice(0, 300),
    );
    return null;
  }
  const json = await response.json();
  const text = (json?.candidates?.[0]?.content?.parts ?? [])
    .filter((p) => p?.text && !p?.thought)
    .map((p) => p.text)
    .join("");
  return text ? JSON.parse(text) : null;
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
