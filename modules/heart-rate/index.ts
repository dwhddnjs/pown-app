import { requireOptionalNativeModule } from "expo";

type Subscription = { remove(): void };

// 심박을 잴 기기. 워치(포운 워치 앱이 깔린 애플워치)를 먼저 쓴다 — 응답이 없으면 시작할 때
// 이어폰으로 넘어간다
export type HeartRateDevice = "watch" | "earphones";

// 시작이 워치 쪽에서 실패하고 이어폰도 없을 때 start()·resume()이 던지는 에러 코드
export const WATCH_UNAVAILABLE = "ERR_WATCH_UNAVAILABLE";
// 워치가 답이 없는데 워치에 포운 앱이 없다고 나올 때
export const WATCH_APP_MISSING = "ERR_WATCH_APP_MISSING";
// 일시정지로 남은 측정을 이을 기기(워치·이어폰)가 없을 때 resume()이 던진다
export const NO_DEVICE = "ERR_NO_DEVICE";

// 네이티브 스냅샷. 심박은 최근 30초 안에 들어온 값이 없으면 빠진다.
export type HeartRateSnapshot = {
  // 어디서 재고 있는지 — phone: 아이폰 세션(이어폰 센서), watch: 애플워치 미러링
  source?: "phone" | "watch";
  // 지금 보이는 심박을 잰 기기. 워치로 재다 워치를 풀면 같이 돌던 이어폰 세션 값("earphones")을 쓴다
  hrSource?: "watch" | "earphones";
  // 워치로 재는 동안 이어폰도 심박을 재고 있다 — 워치를 풀면 이어서 쓴다
  standby?: boolean;
  // 워치가 손목에서 풀렸다고 알려왔다(워치 앱이 손목 감지로 확인)
  watchOff?: boolean;
  // 워치와 연결이 끊겼다 — 워치는 계속 재고, 다시 붙으면 이어진다. 그동안 일시정지·재개는 워치에 닿지 않는다
  watchLost?: boolean;
  // 자동 일시정지 사유 — 일시정지 중에만 온다
  pauseReason?: "watchRemoved" | "earphonesRemoved";
  // 시스템이 세션을 끝내(에어팟을 빼면 iOS가 끝낸다) 세션 없이 일시정지로 남은 측정. 재개하면 새
  // 세션으로 이어 재고, 종료하면 앞 구간과 합쳐 한 기록이 된다
  suspended?: boolean;
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
  // 종료 요약에만 온다 — 측정 중 받은 심박 [시작 후 초, bpm]
  samples?: [number, number][];
  // 종료 요약에만 온다 — 건강 앱에 저장된 운동(구간)들의 시작 시각(ms). 기록을 지울 때 찾는다
  healthStarts?: number[];
};

type HeartRateModule = {
  isSupported(): boolean;
  heartRateDevice(): HeartRateDevice | null;
  requestAuthorization(): Promise<boolean>;
  // 시작을 마친 시점의 첫 스냅샷 (기다리는 사이 세션이 닫혔으면 null). device는 준비 표시에 쓴
  // heartRateDevice() 값 — 네이티브가 다시 고르지 않는다. 없거나 그 사이 이어폰을 뺐으면 reject.
  // 워치가 응답하지 않거나 안 찼으면 이어폰으로 넘어가고, 이어폰도 없으면 WATCH_UNAVAILABLE
  // (워치 앱이 없어 보이면 WATCH_APP_MISSING) 코드로 reject
  start(device: HeartRateDevice | null): Promise<HeartRateSnapshot | null>;
  pause(): Promise<void>;
  // 세션 없이 일시정지로 남은 측정(suspended)이면 새 세션을 열어 잇고 그 스냅샷을 준다(워치를 깨우면
  // 수십 초 걸릴 수 있다). 이을 기기가 없으면 NO_DEVICE로 reject. 그 밖엔 null
  resume(): Promise<HeartRateSnapshot | null>;
  // 합계 1분 미만이면 저장하지 않고 null. 이미 끝나는 중(아일랜드·시스템 종료)이거나 세션이
  // 없으면 reject — 저장은 먼저 끝내던 쪽의 ended 이벤트가 한다
  end(): Promise<HeartRateSnapshot | null>;
  // 길이와 상관없이 저장 없이 버린다(건강 앱에도 안 남는다) — 전체 초기화용
  discard(): Promise<void>;
  getActive(): Promise<HeartRateSnapshot | null>;
  // 이 앱이 건강 앱에 저장한 운동을 시작 시각(ms)으로 찾아 지운다. failed: 찾았는데 못 지웠다
  // (워치 앱이 저장한 운동·쓰기 권한 해제 — 앱은 자기가 저장한 것만 지울 수 있다)
  deleteWorkout(startedAt: number): Promise<"deleted" | "notFound" | "failed">;
  addListener(
    event: "onUpdate",
    // 시스템이 세션을 닫거나(다른 운동 앱·워치에서 종료) 아일랜드 버튼으로 끝내면 ended에 저장할
    // 요약이 붙는다 (1분 미만이면 없다). 에어팟을 빼 시스템이 닫은 건 끝내지 않고 suspended로 온다
    listener: (
      body: HeartRateSnapshot | { state: "ended"; summary?: HeartRateSnapshot },
    ) => void,
  ): Subscription;
  addListener(
    event: "onDeviceChange",
    // device: 지금 쓸 수 있는 기기(없으면 빠진다). removed: 이어폰이 하나도 안 남게 뺀 경우만
    // true (마이크 등으로 출력이 바뀐 건 false)
    listener: (body: { device?: HeartRateDevice; removed: boolean }) => void,
  ): Subscription;
};

// 모듈이 없는 바이너리(구버전·안드로이드)에서는 null — 기능을 통째로 숨긴다
export const HeartRate =
  requireOptionalNativeModule<HeartRateModule>("HeartRate");

export const isHeartRateSupported = HeartRate?.isSupported() ?? false;
