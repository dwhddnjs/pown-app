// 리워드 광고 단위 ID (안드로이드 앱). 공개값이라 .env가 아니라 여기 둔다 — 이유는 lib/ads.ts
// (개발 빌드는 lib/ads.ts가 테스트 ID로 바꾼다)
export const REWARDED_AD_UNIT_ID = "ca-app-pub-6495300075044721/1019829311";

// 안드로이드엔 iOS의 앱 추적 투명성(ATT) 같은 실행 중 동의 창이 없다
export const requestAdTracking = async () => {};
