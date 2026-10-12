// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require("eslint/config");
const expoConfig = require("eslint-config-expo/flat");

module.exports = defineConfig([
  expoConfig,
  {
    // scripts/는 앱 번들이 아니라 맥에서 돌리는 개발 도구다 — 결과를 stdout으로
    // 찍는 게 일이라 no-console이 걸리면 안 된다
    ignores: ["dist/*", "scripts/*"],
  },
  {
    settings: {
      "import/resolver": {
        // tsconfig의 moduleSuffixes를 import 플러그인은 모른다 — 확장자 없이 import한
        // 플랫폼 쌍(foo.ios.tsx / foo.android.tsx)도 찾도록 확장자 후보에 넣는다
        typescript: {
          extensions: [
            ".ios.ts",
            ".ios.tsx",
            ".android.ts",
            ".android.tsx",
            ".ts",
            ".tsx",
            ".d.ts",
            ".js",
            ".jsx",
            ".json",
          ],
        },
      },
    },
    rules: {
      // 프로젝트 규칙: 프로덕션 console 금지 (CLAUDE.md)
      "no-console": "error",
      // 프로젝트 규칙: 플랫폼 분기 대신 foo.ios.tsx / foo.android.tsx 쌍 (CLAUDE.md "플랫폼 분리")
      "no-restricted-properties": [
        "error",
        {
          object: "Platform",
          property: "OS",
          message: "플랫폼 차이는 .ios/.android 파일 쌍으로 나눈다 (CLAUDE.md)",
        },
        {
          object: "Platform",
          property: "select",
          message: "플랫폼 차이는 .ios/.android 파일 쌍으로 나눈다 (CLAUDE.md)",
        },
      ],
    },
  },
]);
