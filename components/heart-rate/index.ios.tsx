// 심박수 측정 — HealthKit(애플워치·에어팟) 기반 iOS 전용 기능의 입구.
// 공통 코드는 이 엔트리로만 심박 기능에 닿는다. 안드로이드는 같은 이름을 빈 구현으로
// 내보낸다(index.android.tsx) — 이름·시그니처를 바꾸면 거기도 같이 바꿀 것.
// 폴더 안의 나머지 파일(*.ios.tsx)은 iOS 전용이라 공통 코드에서 직접 import하지 않는다.
import { useHeartRateLiveStore } from "@/hooks/use-heart-rate-live-store";
// native
import { HeartRate } from "@/modules/heart-rate";

export { HeartRateRow } from "./heart-rate-row";
export { HeartRateChart } from "./heart-rate-chart";
export { DayHeartRateSummary } from "./day-heart-rate-summary";
export { HeartRateRecordsScreen } from "./heart-rate-records-screen";
export { useHeartRateSync } from "@/hooks/use-heart-rate-live-store";

// 측정 중 — 계획을 다 지워도 빈 화면 대신 리스트(헤더의 측정 박스)를 남길지 정한다
export const useIsHeartRateLive = () =>
  useHeartRateLiveStore((state) => !!state.live);

// 측정 중이거나 시작을 눌러 센서를 기다리는 중 — 연간 잔디를 접을지 정한다
export const useIsHeartRateMeasuring = () =>
  useHeartRateLiveStore((state) => !!state.live || state.preparingAt !== null);

// 전체 초기화 때 부른다. 측정 중이거나 센서를 기다리는 중이면 세션도 저장 없이 버린다(건강 앱에
// 이미 들어간 심박·칼로리 샘플까지 지운다 — 워치 것은 워치 앱이) — 안 버리면 지운 뒤에도
// 아일랜드에 남는다. JS가 모르는 세션도 버리게 늘 부른다(없으면 reject). 이미 끝나는 중이라
// 못 버린 측정의 요약은 saveRecord가 거른다
export const discardHeartRateSession = () => {
  HeartRate?.discard().catch(() => {});
  const { setLive, setPreparingAt } = useHeartRateLiveStore.getState();
  setLive(null);
  setPreparingAt(null);
};
