// component
import { ThemeColorType } from "@/constants/colors";

// 심박수 측정은 HealthKit(애플워치·에어팟) 기반 iOS 전용이다 — 안드로이드는 자리를 비운다.
// iOS 엔트리(index.ios.tsx)와 같은 이름·시그니처로 내보내야 공통 코드가 그대로 돈다.
// 심박 "기록" 데이터(hooks/use-heart-rate-store)는 백업 호환 때문에 공통으로 남아 있다.

export const HeartRateRow = (_props: { isLatest: boolean }) => null;
export const HeartRateChart = () => null;
export const DayHeartRateSummary = (_props: {
  date: string;
  themeColor: ThemeColorType;
}) => null;
// 라우트((modals)/heart-rate-records)는 Expo Router 규칙상 지울 수 없어 남지만,
// 여는 곳(DayHeartRateSummary)이 없어 닿지 않는다
export const HeartRateRecordsScreen = () => null;

export const useHeartRateSync = () => {};
export const useIsHeartRateLive = () => false;
export const useIsHeartRateMeasuring = () => false;
export const discardHeartRateSession = () => {};
