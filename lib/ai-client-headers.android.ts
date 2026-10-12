// Gemini auth key엔 앱 제한이 걸리지 않아(ai-client-headers.ios.ts 주석) 안드로이드 앱
// 식별 헤더(X-Android-Package·X-Android-Cert)도 보내 봐야 무시된다 — 보내지 않는다
export const AI_CLIENT_HEADERS = {};
