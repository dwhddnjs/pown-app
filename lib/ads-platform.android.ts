import { TestIds } from "react-native-google-mobile-ads";

// TODO(안드로이드 출시 전): AdMob 콘솔에서 안드로이드 앱을 만들고 받은 리워드 단위 ID로 교체.
// app.json의 androidAppId(지금은 구글 샘플 ID)도 같이 바꿔야 한다 — CLAUDE.md 출시 체크리스트
export const REWARDED_AD_UNIT_ID = TestIds.REWARDED;

// 안드로이드엔 iOS의 앱 추적 투명성(ATT) 같은 실행 중 동의 창이 없다
export const requestAdTracking = async () => {};
