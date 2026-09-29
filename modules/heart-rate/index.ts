import { requireOptionalNativeModule } from "expo";

type Subscription = { remove(): void };

// 네이티브 스냅샷. 심박은 최근 30초 안에 들어온 값이 없으면 빠진다.
export type HeartRateSnapshot = {
  state: "running" | "paused";
  heartRate?: number;
  minHR?: number;
  maxHR?: number;
  avgHR?: number;
  activeKcal: number;
  totalKcal: number;
  elapsedSec: number;
  // 세션 시작 시각(ms)
  startedAt: number;
};

type HeartRateModule = {
  isSupported(): boolean;
  hasHeartRateDevice(): boolean;
  requestAuthorization(): Promise<boolean>;
  // 시작을 마친 시점의 첫 스냅샷 (기다리는 사이 세션이 닫혔으면 null)
  start(): Promise<HeartRateSnapshot | null>;
  pause(): Promise<void>;
  resume(): Promise<void>;
  // 1분 미만이면 저장하지 않고 null
  end(): Promise<HeartRateSnapshot | null>;
  getActive(): Promise<HeartRateSnapshot | null>;
  // 이 앱이 건강 앱에 저장한 운동을 시작 시각(ms)으로 찾아 지운다. 못 찾으면 false
  deleteWorkout(startedAt: number): Promise<boolean>;
  addListener(
    event: "onUpdate",
    // 시스템이 세션을 닫거나(다른 운동 앱 등) 아일랜드 버튼으로 끝내면 ended에 저장할 요약이
    // 붙는다 (1분 미만이면 없다)
    listener: (
      body: HeartRateSnapshot | { state: "ended"; summary?: HeartRateSnapshot },
    ) => void,
  ): Subscription;
  addListener(
    event: "onDeviceChange",
    // removed: 이어폰을 뺀 경우만 true (마이크 등으로 출력이 바뀐 건 false)
    listener: (body: { available: boolean; removed: boolean }) => void,
  ): Subscription;
};

// 모듈이 없는 바이너리(구버전·안드로이드)에서는 null — 기능을 통째로 숨긴다
export const HeartRate =
  requireOptionalNativeModule<HeartRateModule>("HeartRate");

export const isHeartRateSupported = HeartRate?.isSupported() ?? false;
