import { useEffect } from "react";
import { AppState, Linking } from "react-native";
import { toast } from "sonner-native";
// zustand
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { useWorkoutPlanStore } from "@/hooks/use-workout-plan-store";
// hooks
import { tt } from "@/hooks/use-t";
// lib
import { storage } from "@/lib/storage";
import { dateKey, PLAN_DATE_FORMAT } from "@/lib/date";
import { format, parse } from "date-fns";
// native
import {
  HeartRate,
  HeartRateDevice,
  HeartRateSnapshot,
  isHeartRateSupported,
  NO_DEVICE,
  WATCH_APP_MISSING,
  WATCH_UNAVAILABLE,
} from "@/modules/heart-rate";

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
};

export type HeartRateLiveTypes = HeartRateSnapshot & {
  // 경과 시간을 JS에서 매초 이어 세기 위한 기준 시각
  receivedAt: number;
};

// 전체 초기화한 시각. 그 전에 시작해 초기화 뒤에 끝난 측정(이미 끝나는 중이라 버리지 못한 것)의
// 요약은 남기지 않는다 — 방금 비운 기록에 옛 측정이 다시 생긴다
let resetAt = 0;

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
          return {
            records: [
              ...prev.records,
              {
                id: Date.now(),
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

// 측정 중 상태 — 영속하지 않는다. 위 스토어에 같이 두면 persist가 set마다 기록 전체를
// 직렬화해 MMKV에 다시 쓴다(측정 중엔 샘플이 수 초마다 온다).
type HeartRateLiveStoreTypes = {
  live: HeartRateLiveTypes | null;
  // 시작을 누르고 센서가 붙기를 기다리는 동안(3초)의 시작 시각. 박스는 이때 이미 펼쳐지고
  // 잔디도 같이 접혀야 해서 컴포넌트 상태가 아니라 여기 둔다
  preparingAt: number | null;
  // 준비 중인 기기 — 시작할 때 고른 것. 기다리는 사이 device가 바뀌어도 준비 표시는 이걸 따른다
  preparingDevice: HeartRateDevice | null;
  // 지금 잴 수 있는 기기 — 없으면 시작 버튼을 숨긴다
  device: HeartRateDevice | null;
  // 일시정지로 남은 측정을 새 세션으로 잇는 중(워치를 깨우면 수십 초) — 박스가 "연결 중"을 보인다
  resuming: boolean;
  setLive: (snapshot: HeartRateSnapshot | null) => void;
  setPreparingAt: (at: number | null, device?: HeartRateDevice | null) => void;
  setDevice: (device: HeartRateDevice | null) => void;
  setResuming: (resuming: boolean) => void;
};

export const useHeartRateLiveStore = create<HeartRateLiveStoreTypes>()(
  (set) => ({
    live: null,
    preparingAt: null,
    preparingDevice: null,
    device: null,
    resuming: false,
    setLive: (snapshot) =>
      set({
        live: snapshot ? { ...snapshot, receivedAt: Date.now() } : null,
      }),
    setPreparingAt: (preparingAt, preparingDevice = null) =>
      set({ preparingAt, preparingDevice }),
    setDevice: (device) => set({ device }),
    setResuming: (resuming) => set({ resuming }),
  }),
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

// 기록은 그날 날짜 헤더 밑에 붙는다 — 그날 계획이 없으면 남겨도 안 보인다
export const hasPlanOn = (date: string) =>
  useWorkoutPlanStore
    .getState()
    .workoutPlanList.some((plan) => plan.createdAt.startsWith(date));

// 종료 요약을 기록으로 남기고 상황에 맞는 토스트를 띄운다. 같은 날 두 번째부터는
// 요약에 더해진다(summarizeDay). 측정 중에 그날 계획을 지웠으면 어디서 보이는지 알려준다
export const saveRecord = (snapshot: HeartRateSnapshot) => {
  if (snapshot.startedAt < resetAt) return;
  const start = new Date(snapshot.startedAt);
  const date = dateKey(start);
  const { records, addRecord } = useHeartRateStore.getState();
  // 같은 세션 요약이 두 번 올 수 있다(이미 끝난 세션이 복구돼 다시 닫히는 등) — 준비에 3초가
  // 걸려 같은 초에 시작한 세션은 둘일 수 없으니 이미 남긴 것이다
  const startedAt = format(start, PLAN_DATE_FORMAT);
  if (records.some((record) => record.startedAt === startedAt)) return;
  const isFirst = !records.some((record) => record.date === date);
  addRecord(snapshot);
  if (!hasPlanOn(date)) toast(tt("heartRate.savedNoPlan"));
  else toast.success(tt(isFirst ? "heartRate.saved" : "heartRate.added"));
};

// 기록 하나를 지우고 건강 앱에 저장된 같은 운동도 지운다 — 거기 남으면 잘못 잰 기록이 활동 링과
// 운동 목록에 계속 보인다. 건강 앱 쪽이 실패해도(권한 해제 등) 앱 기록은 지운다
export const deleteRecord = (record: HeartRateRecordTypes) => {
  useHeartRateStore.getState().onDeleteRecord(record.id);
  const native = HeartRate;
  if (!native) return;
  // 이어 잰 측정은 건강 앱에 구간마다 운동이 있다
  const starts = record.healthStarts ?? [
    record.startedAtMs ??
      parse(record.startedAt, PLAN_DATE_FORMAT, new Date()).getTime(),
  ];
  // 네이티브는 [시작, 시작+1초) 창으로 찾는다 — 초 단위로 내려야 실제 시작이 창 안에 든다
  Promise.all(
    starts.map((start) =>
      native.deleteWorkout(Math.floor(start / 1000) * 1000),
    ),
  )
    .then((results) => {
      // 찾았는데 못 지웠다(워치 앱이 저장한 운동 등) — "함께 지워져요"라고 했으니 남은 걸 알리고
      // 직접 지우는 곳으로 보낸다
      if (!results.includes("failed")) return;
      toast.error(tt("heartRate.deleteHealthFailed"), {
        duration: 6000,
        action: {
          label: tt("heartRate.openHealth"),
          onClick: () => Linking.openURL("x-apple-health://"),
        },
      });
    })
    .catch(() => {});
};

// 재개. 세션 없이 일시정지로 남은 측정(suspended)은 네이티브가 새 세션을 열어 잇는다 — 그동안 박스는
// "연결 중"이고, 이을 기기가 없으면 알려준다. 섬의 재개 링크(myapp://workout?resume=1)도 이걸 부른다.
// toWatch: 이어폰으로 재는데 심박이 안 들어와 워치로 바꿔 잇는다 — 같은 측정으로 이어지고, 워치가 안 되면 일시정지로 남는다
export const resumeMeasurement = async (toWatch = false) => {
  const native = HeartRate;
  const { resuming, setResuming, setLive } = useHeartRateLiveStore.getState();
  if (!native || resuming) return;
  setResuming(true);
  try {
    const snapshot = await (toWatch ? native.switchToWatch() : native.resume());
    if (snapshot) setLive(snapshot);
  } catch (error) {
    const code = (error as { code?: string } | null)?.code;
    toast.error(
      tt(
        code === NO_DEVICE
          ? "heartRate.resumeNoDevice"
          : code === WATCH_APP_MISSING
            ? "heartRate.watchAppMissing"
            : code === WATCH_UNAVAILABLE
              ? "heartRate.watchUnavailable"
              : "heartRate.resumeFailed",
      ),
    );
  } finally {
    setResuming(false);
  }
};

// 네이티브 이벤트 구독. 측정 박스가 없는 화면에서도 받아야 하므로(시스템 종료 저장,
// 이어폰 빠짐) 항상 살아 있는 루트 레이아웃에서 한 번만 건다.
export const useHeartRateSync = () => {
  useEffect(() => {
    const native = HeartRate;
    if (!native || !isHeartRateSupported) return;
    const { setLive, setDevice } = useHeartRateLiveStore.getState();
    const syncLive = () =>
      native
        .getActive()
        .then(setLive)
        .catch(() => {});

    const update = native.addListener("onUpdate", (body) => {
      if (body.state !== "ended") return setLive(body);
      setLive(null);
      // 시스템이 세션을 닫았거나 아일랜드 버튼으로 끝낸 경우만 요약이 온다 — 앱의 종료
      // 버튼으로 끝낸 건 그쪽이 저장한다
      if (body.summary) saveRecord(body.summary);
    });
    // 에어팟을 빼면 멈추는 건 네이티브가 한다 — 앱이 뒤에 있으면 여기 live가 낡아 판단을 놓친다
    const deviceChange = native.addListener("onDeviceChange", ({ device }) =>
      setDevice(device ?? null),
    );
    // 섬·잠금화면의 재개 링크 — 세션 없이 일시정지로 남은 측정은 뒤에서 새 세션을 못 열어 앱을 연다
    const onURL = (url: string | null) => {
      if (url?.includes("resume=1")) resumeMeasurement();
    };
    const link = Linking.addEventListener("url", ({ url }) => onURL(url));
    Linking.getInitialURL()
      .then(onURL)
      .catch(() => {});
    // 백그라운드에선 네이티브가 JS로 샘플을 안 보낸다 — 돌아오면 최신 값으로 맞추고,
    // 그동안 놓친 오디오 출력 변경도 다시 본다. 여기 측정이 없어도 맞춘다 — 뒤에 있는 사이 네이티브에만 측정이
    // 남았을 수 있다(섬에서 종료를 누른 사이 시스템이 세션을 닫아 일시정지로 남은 경우 등)
    const app = AppState.addEventListener("change", (state) => {
      if (state !== "active") return;
      setDevice(native.heartRateDevice());
      syncLive();
    });
    // 리스너를 먼저 걸고 읽는다 — 읽은 뒤 걸면 그 사이 끝난 워치 연결(WCSession 활성화) 소식을
    // 놓쳐, 앱을 한 번 내렸다 올릴 때까지 시작 버튼이 안 보인다
    setDevice(native.heartRateDevice());
    // 앱이 죽었다 다시 뜬 경우 진행 중이던 세션을 되찾는다
    syncLive();
    return () => {
      update.remove();
      deviceChange.remove();
      link.remove();
      app.remove();
    };
  }, []);
};
