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
    rules: {
      // 프로젝트 규칙: 프로덕션 console 금지 (CLAUDE.md)
      "no-console": "error",
    },
  },
]);
