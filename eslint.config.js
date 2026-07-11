// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require("eslint/config");
const expoConfig = require("eslint-config-expo/flat");

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ["dist/*"],
  },
  {
    rules: {
      // 프로젝트 규칙: 프로덕션 console 금지 (CLAUDE.md)
      "no-console": "error",
    },
  },
]);
