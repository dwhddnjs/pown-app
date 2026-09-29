import { requireOptionalNativeModule } from "expo";

type Subscription = { remove(): void };

// 네이티브 스냅샷. 심박은 최근 30초 안에 들어온 값이 없으면 빠진다.
export type HeartRateSnapshot = {
  state: "running" | "paused";
  heartRate?: number;
  minHR?: number;
  maxHR?: number;
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
  start(): Promise<void>;
  pause(): Promise<void>;
  resume(): Promise<void>;
  // 1분 미만이면 저장하지 않고 null
  end(): Promise<HeartRateSnapshot | null>;
  getActive(): Promise<HeartRateSnapshot | null>;
  addListener(
    event: "onUpdate",
    listener: (body: HeartRateSnapshot | { state: "ended" }) => void,
  ): Subscription;
  addListener(
    event: "onDeviceChange",
    listener: (body: { available: boolean }) => void,
  ): Subscription;
};

// 모듈이 없는 바이너리(구버전·안드로이드)에서는 null — 기능을 통째로 숨긴다
export const HeartRate =
  requireOptionalNativeModule<HeartRateModule>("HeartRate");

export const isHeartRateSupported = HeartRate?.isSupported() ?? false;
