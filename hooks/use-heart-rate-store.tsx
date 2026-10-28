import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
// lib
import { storage } from "@/lib/storage";
import { dateKey, PLAN_DATE_FORMAT } from "@/lib/date";
import { format } from "date-fns";
// native (타입만 — 런타임에는 네이티브 모듈을 건드리지 않는다)
import type { HeartRateSnapshot } from "@/modules/heart-rate";

// 심박 측정 "기록" 데이터 — 플랫폼 공통. 측정 자체(라이브 상태·네이티브 세션·화면)는
// iOS 전용이라 use-heart-rate-live-store.ios.tsx와 components/heart-rate/에 있다.
// 기록만 공통으로 두는 건 백업(lib/backup.ts) 때문이다 — iOS 백업을 안드로이드에서
// 복원했다가 다시 iOS로 옮겨도 심박 기록이 남아야 한다.

// 측정 한 번의 요약. 운동 카드 하나가 아니라 "그날 운동"의 지표라 날짜 헤더에 붙는다.
export type HeartRateRecordTypes = {
  id: number;
  // 시작한 날 "yyyy.MM.dd" — 자정을 넘겨도 시작일에 붙는다
  date: string;
  startedAt: string;
  // 시작 시각(ms) — 건강 앱 운동을 찾아 지울 때 쓴다. startedAt 문자열은 시간대가 없어
  // 여행 중엔 몇 시간 어긋난다. 이번 버전부터 저장한다
  startedAtMs?: number;
  durationSec: number;
  // 심박이 한 번도 안 들어온 세션(미지원 기기)이면 없다
  minHR?: number;
  maxHR?: number;
  // 이번 버전부터 저장한다 — 예전 기록엔 없다
  avgHR?: number;
  activeKcal: number;
  totalKcal: number;
  // 1분 칸마다 [최소, 최대] 심박 — 기록 화면 그래프. 심박이 없던 분(일시정지·신호 끊김)은
  // null. 이번 버전부터 저장한다
  heartRates?: ([number, number] | null)[];
  // 건강 앱에 저장된 운동들의 시작 시각(ms) — 에어팟을 빼 일시정지됐다 이어 잰 측정은 구간마다 운동이
  // 따로 있다. 이번 버전부터 저장한다(없으면 startedAtMs 하나)
  healthStarts?: number[];
  // 세트 압박 알림이 울린 때(시작 후 초) — 기록 그래프에 점으로 찍는다. 안 울렸으면 없다. 3.7.2부터 저장한다
  restAlerts?: number[];
};

// 전체 초기화한 시각. 그 전에 시작해 초기화 뒤에 끝난 측정(이미 끝나는 중이라 버리지 못한 것)의
// 요약은 남기지 않는다 — 방금 비운 기록에 옛 측정이 다시 생긴다
let resetAt = 0;

// 측정 요약을 남길 때(use-heart-rate-live-store.ios.tsx의 saveRecord) 거른다
export const isBeforeReset = (startedAt: number) => startedAt < resetAt;

type HeartRateStoreTypes = {
  records: HeartRateRecordTypes[];
  addRecord: (snapshot: HeartRateSnapshot) => void;
  onSetRecords: (records: HeartRateRecordTypes[]) => void;
  onDeleteRecord: (id: number) => void;
  onResetRecords: () => void;
};

export const useHeartRateStore = create<HeartRateStoreTypes>()(
  persist(
    (set) => ({
      records: [],
      addRecord: (snapshot) =>
        set((prev) => {
          const start = new Date(snapshot.startedAt);
          // 요약 여럿이 한꺼번에 오면(다음 실행 때 넘겨받은 것) 같은 ms라 ID가 겹친다 — 겹치면 하나를 지울 때 같이 지워졌다
          let id = Date.now();
          while (prev.records.some((record) => record.id === id)) id += 1;
          return {
            records: [
              ...prev.records,
              {
                id,
                date: dateKey(start),
                startedAt: format(start, PLAN_DATE_FORMAT),
                startedAtMs: snapshot.startedAt,
                durationSec: snapshot.elapsedSec,
                minHR: snapshot.minHR,
                maxHR: snapshot.maxHR,
                avgHR: snapshot.avgHR,
                activeKcal: snapshot.activeKcal,
                totalKcal: snapshot.totalKcal,
                heartRates: snapshot.samples?.length
                  ? toMinuteRanges(snapshot.samples)
                  : undefined,
                healthStarts: snapshot.healthStarts,
                restAlerts: snapshot.restAlerts,
              },
            ],
          };
        }),
      onSetRecords: (records) => set({ records }),
      onDeleteRecord: (id) =>
        set((prev) => ({
          records: prev.records.filter((record) => record.id !== id),
        })),
      onResetRecords: () => {
        resetAt = Date.now();
        set({ records: [] });
      },
    }),
    {
      name: "heart-rate",
      storage: createJSONStorage(() => storage),
    },
  ),
);

// 여러 번 잰 기록을 하나로 — 칼로리·시간은 더하고 심박은 전체 최소·최대를 잡는다.
// 평균 심박은 잰 시간만큼 가중한다(평균이 없는 예전 기록은 빼고)
export const summarize = (records: HeartRateRecordTypes[]) => {
  if (records.length === 0) return null;
  const heart = records
    .flatMap((record) => [record.minHR, record.maxHR])
    .filter((value): value is number => value != null);
  const sum = (key: "activeKcal" | "totalKcal" | "durationSec") =>
    records.reduce((acc, record) => acc + record[key], 0);
  const averaged = records.filter((record) => record.avgHR != null);
  const averagedSec = averaged.reduce((acc, r) => acc + r.durationSec, 0);
  return {
    activeKcal: sum("activeKcal"),
    totalKcal: sum("totalKcal"),
    durationSec: sum("durationSec"),
    minHR: heart.length ? Math.min(...heart) : undefined,
    maxHR: heart.length ? Math.max(...heart) : undefined,
    avgHR: averagedSec
      ? Math.round(
          averaged.reduce((acc, r) => acc + (r.avgHR ?? 0) * r.durationSec, 0) /
            averagedSec,
        )
      : undefined,
  };
};

// 측정 중 모은 [시작 후 초, bpm]을 1분 칸의 [최소, 최대]로 묶는다
export const toMinuteRanges = (samples: [number, number][]) => {
  const ranges: ([number, number] | null)[] = [];
  for (const [sec, bpm] of samples) {
    const index = Math.floor(sec / 60);
    while (ranges.length <= index) ranges.push(null);
    const range = ranges[index];
    ranges[index] = range
      ? [Math.min(range[0], bpm), Math.max(range[1], bpm)]
      : [bpm, bpm];
  }
  return ranges;
};

// 잰 시간을 "N분"으로 보여줄 때 — 1분 미만은 저장하지 않지만 반올림으로 0분이 되지 않게 최소 1
export const toMinutes = (sec: number) => Math.max(1, Math.round(sec / 60));

export const summarizeDay = (records: HeartRateRecordTypes[], date: string) =>
  summarize(records.filter((record) => record.date === date));
