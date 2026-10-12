// expo
import { requestTrackingPermissionsAsync } from "expo-tracking-transparency";

// 리워드 광고 단위 ID (iOS 앱). 공개값이라 .env가 아니라 여기 둔다 — 이유는 lib/ads.ts
export const REWARDED_AD_UNIT_ID = "ca-app-pub-6495300075044721/2721484297";

// 앱 추적 투명성(ATT) — 응답 "전에" 광고를 초기화하면 IDFA 없이 초기화되므로 먼저 묻는다
export const requestAdTracking = async () => {
  await requestTrackingPermissionsAsync();
};
