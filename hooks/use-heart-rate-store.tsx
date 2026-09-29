import { useEffect } from "react";
import { AppState } from "react-native";
import { toast } from "sonner-native";
// zustand
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { getLanguage } from "@/hooks/use-user-store";
// lib
import { storage } from "@/lib/storage";
import { translate } from "@/lib/i18n";
import { PLAN_DATE_FORMAT } from "@/lib/date";
import { format } from "date-fns";
// native
import {
  HeartRate,
  HeartRateSnapshot,
  isHeartRateSupported,
} from "@/modules/heart-rate";

// 측정 한 번의 요약. 운동 카드 하나가 아니라 "그날 운동"의 지표라 날짜 헤더에 붙는다.
export type HeartRateRecordTypes = {
  id: number;
  // 시작한 날 "yyyy.MM.dd" — 자정을 넘겨도 시작일에 붙는다
  date: string;
  startedAt: string;
  durationSec: number;
  // 심박이 한 번도 안 들어온 세션(미지원 기기)이면 없다
  minHR?: number;
  maxHR?: number;
  activeKcal: number;
  totalKcal: number;
};

export type HeartRateLiveTypes = HeartRateSnapshot & {
  // 경과 시간을 JS에서 매초 이어 세기 위한 기준 시각
  receivedAt: number;
};

type HeartRateStoreTypes = {
  records: HeartRateRecordTypes[];
  // 아래는 임시 상태 — partialize로 영속에서 뺀다
  live: HeartRateLiveTypes | null;
  deviceAvailable: boolean;
  setLive: (snapshot: HeartRateSnapshot | null) => void;
  setDeviceAvailable: (available: boolean) => void;
  addRecord: (snapshot: HeartRateSnapshot) => void;
  onSetRecords: (records: HeartRateRecordTypes[]) => void;
  onResetRecords: () => void;
};

export const useHeartRateStore = create<HeartRateStoreTypes>()(
  persist(
    (set) => ({
      records: [],
      live: null,
      deviceAvailable: false,
      setLive: (snapshot) =>
        set({
          live: snapshot ? { ...snapshot, receivedAt: Date.now() } : null,
        }),
      setDeviceAvailable: (deviceAvailable) => set({ deviceAvailable }),
      addRecord: (snapshot) =>
        set((prev) => {
          const start = new Date(snapshot.startedAt);
          return {
            records: [
              ...prev.records,
              {
                id: Date.now(),
                date: format(start, "yyyy.MM.dd"),
                startedAt: format(start, PLAN_DATE_FORMAT),
                durationSec: snapshot.elapsedSec,
                minHR: snapshot.minHR,
                maxHR: snapshot.maxHR,
                activeKcal: snapshot.activeKcal,
                totalKcal: snapshot.totalKcal,
              },
            ],
          };
        }),
      onSetRecords: (records) => set({ records }),
      onResetRecords: () => set({ records: [] }),
    }),
    {
      name: "heart-rate",
      storage: createJSONStorage(() => storage),
      partialize: (state) => ({ records: state.records }),
    },
  ),
);

// 하루에 여러 번 쟀으면 칼로리·시간은 더하고 심박은 전체 최소·최대를 잡는다
export const summarizeDay = (records: HeartRateRecordTypes[], date: string) => {
  const day = records.filter((record) => record.date === date);
  if (day.length === 0) return null;
  const heart = day
    .flatMap((record) => [record.minHR, record.maxHR])
    .filter((value): value is number => value != null);
  const sum = (key: "activeKcal" | "totalKcal" | "durationSec") =>
    day.reduce((acc, record) => acc + record[key], 0);
  return {
    activeKcal: sum("activeKcal"),
    totalKcal: sum("totalKcal"),
    durationSec: sum("durationSec"),
    minHR: heart.length ? Math.min(...heart) : undefined,
    maxHR: heart.length ? Math.max(...heart) : undefined,
  };
};

// 네이티브 이벤트 구독. 측정 박스는 가상 리스트의 행이라 스크롤하면 언마운트되므로
// 항상 살아 있는 루트 레이아웃에서 한 번만 건다.
export const useHeartRateSync = () => {
  useEffect(() => {
    const native = HeartRate;
    if (!native || !isHeartRateSupported) return;
    const { setLive, setDeviceAvailable } = useHeartRateStore.getState();
    const checkDevice = () => setDeviceAvailable(native.hasHeartRateDevice());

    checkDevice();
    // 앱이 죽었다 다시 뜬 경우 진행 중이던 세션을 되찾는다
    native
      .getActive()
      .then(setLive)
      .catch(() => {});

    const update = native.addListener("onUpdate", (body) =>
      setLive(body.state === "ended" ? null : body),
    );
    const device = native.addListener("onDeviceChange", ({ available }) => {
      setDeviceAvailable(available);
      // 에어팟을 빼면 심박이 끊긴다 — 빈 심박으로 시간·칼로리만 쌓이지 않게 멈춘다.
      // 다시 껴도 자동 재개는 하지 않는다(사용자가 재개를 누른다)
      if (
        !available &&
        useHeartRateStore.getState().live?.state === "running"
      ) {
        native.pause().catch(() => {});
        toast(translate(getLanguage(), "heartRate.autoPaused"));
      }
    });
    // 백그라운드에 있는 동안 놓친 오디오 출력 변경을 돌아올 때 다시 본다
    const app = AppState.addEventListener("change", (state) => {
      if (state === "active") checkDevice();
    });
    return () => {
      update.remove();
      device.remove();
      app.remove();
    };
  }, []);
};
