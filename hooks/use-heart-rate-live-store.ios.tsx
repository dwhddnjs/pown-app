import { useEffect } from "react";
import { AppState, Linking } from "react-native";
import { toast } from "sonner-native";
// zustand
import { create } from "zustand";
import {
  HeartRateRecordTypes,
  isBeforeReset,
  useHeartRateStore,
} from "@/hooks/use-heart-rate-store";
import { useWorkoutPlanStore } from "@/hooks/use-workout-plan-store";
import { useUserStore } from "@/hooks/use-user-store";
// hooks
import { tt, useT } from "@/hooks/use-t";
// lib
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

// 심박 측정 — iOS 전용(HealthKit·애플워치·에어팟). 측정 중 상태와 네이티브 세션 제어를 둔다.
// 저장된 기록 데이터는 플랫폼 공통인 use-heart-rate-store.tsx에 있다.

export type HeartRateLiveTypes = HeartRateSnapshot & {
  // 경과 시간을 JS에서 매초 이어 세기 위한 기준 시각
  receivedAt: number;
};

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

// 기록은 그날 날짜 헤더 밑에 붙는다 — 그날 계획이 없으면 남겨도 안 보인다
export const hasPlanOn = (date: string) =>
  useWorkoutPlanStore
    .getState()
    .workoutPlanList.some((plan) => plan.createdAt.startsWith(date));

// 종료 요약을 기록으로 남기고 상황에 맞는 토스트를 띄운다. 같은 날 두 번째부터는
// 요약에 더해진다(summarizeDay). 측정 중에 그날 계획을 지웠으면 어디서 보이는지 알려준다
export const saveRecord = (snapshot: HeartRateSnapshot) => {
  if (isBeforeReset(snapshot.startedAt)) return;
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

const REST_ALERT_KEYS = [
  "heartRate.restAlertMsg1",
  "heartRate.restAlertMsg2",
  "heartRate.restAlertMsg3",
  "heartRate.restAlertMsg4",
  "heartRate.restAlertMsg5",
  "heartRate.restAlertMsg6",
  "heartRate.restAlertMsg7",
  "heartRate.restAlertMsg8",
  "heartRate.restAlertMsg9",
  "heartRate.restAlertMsg10",
] as const;

// 네이티브 이벤트 구독. 측정 박스가 없는 화면에서도 받아야 하므로(시스템 종료 저장,
// 이어폰 빠짐) 항상 살아 있는 루트 레이아웃에서 한 번만 건다.
export const useHeartRateSync = () => {
  const restAlert = useUserStore((state) => state.restAlert);
  const restAlertSec = useUserStore((state) => state.restAlertSec);
  const t = useT();
  // 휴식 알림은 앱이 뒤에 있어도 네이티브가 판정해 띄운다 — 켜짐 여부·멘트(앱 언어)·휴식 시간만 넘겨 둔다
  useEffect(() => {
    HeartRate?.setRestAlert(
      restAlert ? REST_ALERT_KEYS.map((key) => t(key)) : null,
      restAlertSec,
    );
  }, [restAlert, restAlertSec, t]);
  // 켜 둔 뒤 설정에서 알림을 끄면 네이티브 알림이 조용히 실패한다 — 앱이 앞으로 올 때마다 보고 토글을 끈다.
  // 다시 켜면 거절 안내(설정 열기)가 뜬다
  useEffect(() => {
    if (!restAlert) return;
    const check = () =>
      HeartRate?.hasNotificationPermission()
        .then((granted) => {
          if (!granted) useUserStore.getState().setUser("restAlert", false);
        })
        .catch(() => {});
    check();
    const app = AppState.addEventListener("change", (state) => {
      if (state === "active") check();
    });
    return () => app.remove();
  }, [restAlert]);

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
