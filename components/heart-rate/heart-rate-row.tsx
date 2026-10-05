import React, { useEffect, useRef, useState } from "react";
// component
import {
  ActivityIndicator,
  Linking,
  View as RNView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { Text } from "@/components/themed";
import { Button } from "@/components/button";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { AnimatedHeight } from "@/components/animated-height";
import { HeartRateGuideSheet } from "@/components/heart-rate/heart-rate-guide-sheet";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { toast } from "sonner-native";
import Animated, {
  Easing,
  FadeIn,
  LayoutAnimationConfig,
  useAnimatedProps,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import Svg, { Circle, G } from "react-native-svg";
// zustand
import {
  hasPlanOn,
  HeartRateLiveTypes,
  resumeMeasurement,
  saveRecord,
  summarizeDay,
  toMinutes,
  useHeartRateLiveStore,
  useHeartRateStore,
} from "@/hooks/use-heart-rate-store";
// hooks
import useCurrentThemeColor from "@/hooks/use-current-theme-color";
import { useT } from "@/hooks/use-t";
// lib
import { dateKey, formatElapsed } from "@/lib/date";
import { TKey } from "@/lib/i18n";
import { mmkv } from "@/lib/storage";
// native
import {
  HeartRate,
  isHeartRateSupported,
  WATCH_APP_MISSING,
  WATCH_UNAVAILABLE,
} from "@/modules/heart-rate";
// icon
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

// 애플 권장: prepare 뒤 센서가 붙을 때까지 3초 (네이티브가 기다린다, 여기선 표시만)
const PREPARE_SEC = 3;
// 이만큼 지나도 심박이 없으면 미지원 기기·설정 꺼짐·권한 거부로 보고 안내한다
const NO_SIGNAL_SEC = 20;
// 워치를 이만큼 기다려도 첫 값이 없으면 워치 화면을 보라고 안내한다 — 처음이면 워치에 건강 권한 창이 떠 있다
const WATCH_CHECK_SEC = 4;
// 처음 시작할 때 한 번만 안내 시트를 띄운다
const GUIDE_SEEN_KEY = "heartRateGuideSeen";
// 카드 안 내용이 바뀔 때(버튼 ↔ 박스)만 페이드 — 카드 높이는 AnimatedHeight가 옮긴다
const CONTENT_FADE = FadeIn.duration(200);

// 1초마다 다시 그린다 — 켜져 있을 때만
const useSecondTick = (enabled: boolean) => {
  const [, setTick] = useState(0);
  useEffect(() => {
    if (!enabled) return;
    const id = setInterval(() => setTick((n) => n + 1), 1000);
    return () => clearInterval(id);
  }, [enabled]);
};

const secondsSince = (at: number) => Math.floor((Date.now() - at) / 1000);

// 박스 아래 안내 한 줄 — 워치 끊김 > 일시정지 사유 > 신호 없음 > 기기 전환·대기 순
const liveHint = (
  live: HeartRateLiveTypes | null,
  noSignal: boolean,
): TKey | null => {
  if (!live) return null;
  if (live.watchLost) return "heartRate.watchLost";
  if (live.state === "paused") {
    if (live.pauseReason === "watchRemoved")
      return "heartRate.pausedWatchRemoved";
    if (live.pauseReason === "earphonesRemoved")
      return "heartRate.pausedEarphonesRemoved";
    return null;
  }
  if (noSignal)
    return live.source === "watch"
      ? "heartRate.noSignalWatch"
      : "heartRate.noSignal";
  if (live.watchOff && live.hrSource === "earphones")
    return "heartRate.switchedToEarphones";
  if (live.standby) return "heartRate.standby";
  return null;
};

// 준비 카운트다운 링 — 상태 글자(13pt) 자리에 들어가는 크기
const RING_SIZE = 28;
const RING_STROKE = 3;
const RING_RADIUS = (RING_SIZE - RING_STROKE) / 2;
const RING_LENGTH = 2 * Math.PI * RING_RADIUS;
const AnimatedCircle = Animated.createAnimatedComponent(Circle);
// sb-m 숫자는 모양이 칸 안에서 왼쪽으로 쏠려 있어 가운데 정렬해도 비껴 보인다 —
// 링 중심에서 잉크 중심까지 잰 만큼(시뮬레이터 @3x) 오른쪽으로 민다. 3은 정중앙이다
const DIGIT_NUDGE: Record<number, number> = { 1: 0.67, 2: 0.33 };

// 운동 탭 리스트 헤더 맨 위. 대기 중엔 얇은 시작 버튼, 누르면 같은 카드가 아래로
// 펼쳐져 측정 박스가 된다. 리스트 헤더라 재활용되진 않지만 날짜를 고르면 리스트 key가
// 바뀌어 다시 마운트된다 — 로컬 상태(isEnding 등)가 풀려도 네이티브가 중복 종료를 막는다.
// isLatest: 최신부터 보고 있을 때만 시작 버튼을 보인다. 측정 중이면 과거 날짜를 보고
// 있어도 박스를 둔다 — 일시정지·종료가 여기에만 있다
export const HeartRateRow = ({ isLatest }: { isLatest: boolean }) => {
  // 샘플마다 바뀌는 live 전체는 LiveBox만 구독한다 — 여기서 구독하면 몇 초마다 확인창·안내
  // 시트까지 다시 그린다. 세션이 있는지와 어느 세션인지(시작 시각)만 본다
  const liveStartedAt = useHeartRateLiveStore(
    (state) => state.live?.startedAt ?? null,
  );
  const preparingAt = useHeartRateLiveStore((state) => state.preparingAt);
  const device = useHeartRateLiveStore((state) => state.device);
  const [isEnding, setIsEnding] = useState(false);
  // 확인창은 연 세션에 묶는다 — 불리언이면 시스템이 세션을 닫았을 때 true로 남아
  // 다음 측정을 시작하자마자 저절로 떴다
  const [confirmFor, setConfirmFor] = useState<number | null>(null);
  // 권한 창이 뜨기 전 연타로 시작이 두 번 불리지 않게
  const starting = useRef(false);
  const guideRef = useRef<BottomSheetModal>(null);
  const themeColor = useCurrentThemeColor();
  const t = useT();

  const isMeasuring = liveStartedAt !== null || preparingAt !== null;
  if (!isHeartRateSupported || (!isMeasuring && !(isLatest && device)))
    return null;

  const onStart = async () => {
    if (!HeartRate || starting.current) return;
    if (!hasPlanOn(dateKey(new Date()))) {
      toast(t("heartRate.needPlan"));
      return;
    }
    // 처음 한 번은 무엇을 재는지·어떤 이어폰이 되는지부터 — 건강 권한 창보다 앞에 둬야
    // 왜 권한이 필요한지 알고 허용한다. 그냥 닫아도 본 것으로 친다
    if (!mmkv.getBoolean(GUIDE_SEEN_KEY)) {
      mmkv.set(GUIDE_SEEN_KEY, true);
      guideRef.current?.present();
      return;
    }
    starting.current = true;
    const { setLive, setPreparingAt } = useHeartRateLiveStore.getState();
    let preparedAt: number | null = null;
    try {
      if (!(await HeartRate.requestAuthorization())) {
        // 한 번 거부하면 권한 창이 다시 안 뜬다 — 켜는 곳으로 바로 보낸다. 설정 앱의
        // Pown 화면엔 건강 항목이 없어(iOS 26 확인) 문구의 경로대로 건강 앱을 연다
        toast.error(t("heartRate.permissionDenied"), {
          duration: 6000,
          action: {
            label: t("heartRate.openHealth"),
            onClick: () => Linking.openURL("x-apple-health://"),
          },
        });
        return;
      }
      // 여기서 바로 박스로 펼친다 — 센서가 붙는 3초를 버튼에서 기다리지 않는다
      preparedAt = Date.now();
      // 네이티브도 이 기기로 시작한다 — 따로 고르면 그 사이 바뀌어 준비 표시와 어긋난다
      const startDevice = HeartRate.heartRateDevice();
      setPreparingAt(preparedAt, startDevice);
      // 시작 결과를 이벤트보다 먼저 받아 넣는다 — 준비 표시를 끄는 순간 live가 비어
      // 있으면 박스가 한 프레임 버튼으로 되돌아간다
      const snapshot = await HeartRate.start(startDevice);
      // 시작이 끝나는 사이 취소·전체 초기화로 버렸으면(준비 표시를 지운다) 박스를 다시 펴지 않는다
      if (useHeartRateLiveStore.getState().preparingAt === preparedAt)
        setLive(snapshot);
    } catch (error) {
      // 준비 중에 전체 초기화가 세션을 버렸으면(준비 표시도 이미 지웠다) 실패가 아니다
      const discarded =
        preparedAt !== null &&
        useHeartRateLiveStore.getState().preparingAt === null;
      // 워치가 응답하지 않았거나 안 찼고 이어폰도 없다 — 워치를 차고 잠금을 풀면 된다. 워치 앱이
      // 없어 보이면 설치 방법을 알려준다
      const code = (error as { code?: string } | null)?.code;
      if (!discarded)
        toast.error(
          t(
            code === WATCH_UNAVAILABLE
              ? "heartRate.watchUnavailable"
              : code === WATCH_APP_MISSING
                ? "heartRate.watchAppMissing"
                : "heartRate.startFailed",
          ),
        );
    } finally {
      setPreparingAt(null);
      starting.current = false;
    }
  };

  // 워치를 기다리는 중 취소. 준비 표시를 먼저 지워야 onStart가 실패 안내 없이 접는다. 버린 뒤
  // 네이티브에 다시 맞춘다 — 취소와 거의 같이 시작이 끝났으면 그때 보낸 값이 박스를 다시 편다
  const onCancel = () => {
    const native = HeartRate;
    if (!native) return;
    const { setLive, setPreparingAt } = useHeartRateLiveStore.getState();
    setPreparingAt(null);
    native
      .discard()
      .catch(() => {})
      .then(() => native.getActive())
      .then(setLive)
      .catch(() => {});
  };

  const onEnd = async () => {
    setConfirmFor(null);
    if (!HeartRate || isEnding) return;
    setIsEnding(true);
    try {
      const summary = await HeartRate.end();
      useHeartRateLiveStore.getState().setLive(null);
      if (summary) saveRecord(summary);
      else toast(t("heartRate.tooShort"));
    } catch {
      // 이미 끝나는 중이면 그쪽 ended 이벤트가 저장한다 — 박스만 네이티브에 맞춘다.
      // 세션이 살아 있으면 박스가 그대로 남아 다시 누를 수 있다
      HeartRate.getActive()
        .then(useHeartRateLiveStore.getState().setLive)
        .catch(() => {});
    } finally {
      setIsEnding(false);
    }
  };

  return (
    <RNView style={styles.row}>
      {/* 처음 나타날 땐 페이드 없이 — 바뀔 때만 */}
      <LayoutAnimationConfig skipEntering>
        <AnimatedHeight
          style={[styles.card, { backgroundColor: themeColor.itemColor }]}
        >
          {isMeasuring ? (
            <LiveBox
              key="box"
              preparingAt={preparingAt}
              isEnding={isEnding}
              onEnd={() => setConfirmFor(liveStartedAt)}
              onCancel={onCancel}
            />
          ) : (
            <StartButton key="button" onPress={onStart} />
          )}
        </AnimatedHeight>
      </LayoutAnimationConfig>
      <ConfirmDialog
        isOpen={liveStartedAt !== null && confirmFor === liveStartedAt}
        onClose={() => setConfirmFor(null)}
        title={t("heartRate.endTitle")}
        desc={t("heartRate.endDesc")}
        actionLabel={t("heartRate.end")}
        actionColor={themeColor.fail}
        onConfirm={onEnd}
      />
      <HeartRateGuideSheet
        ref={guideRef}
        onStart={() => {
          guideRef.current?.dismiss();
          onStart();
        }}
      />
    </RNView>
  );
};

const StartButton = ({ onPress }: { onPress: () => void }) => {
  const themeColor = useCurrentThemeColor();
  const t = useT();
  // 오늘 이미 잰 게 있으면 "추가 측정" — 다시 재도 덮어쓰지 않고 오늘 요약에 더해진다
  const todaySec = useHeartRateStore(
    (state) => summarizeDay(state.records, dateKey(new Date()))?.durationSec,
  );
  const device = useHeartRateLiveStore((state) => state.device);

  return (
    <Animated.View entering={CONTENT_FADE}>
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={onPress}
        style={styles.start}
      >
        <MaterialCommunityIcons
          name="heart-pulse"
          size={20}
          color={themeColor.fail}
        />
        <Text style={styles.startLabel}>
          {todaySec ? t("heartRate.startMore") : t("heartRate.start")}
        </Text>
        {/* 워치는 페어링·앱 설치만 알 수 있다(꺼졌거나 충전 중인지는 시작해 봐야
            안다) — "연결됨"이라고 하지 않는다 */}
        <Text style={[styles.startHint, { color: themeColor.subText }]}>
          {todaySec
            ? t("heartRate.todayRecorded", { n: toMinutes(todaySec) })
            : t(
                device === "watch"
                  ? "heartRate.viaWatch"
                  : "heartRate.connected",
              )}
        </Text>
        {/* 누르면 이 자리에서 아래로 펼쳐져 측정 박스가 된다 */}
        <MaterialCommunityIcons
          name="chevron-down"
          size={20}
          color={themeColor.subText}
        />
      </TouchableOpacity>
    </Animated.View>
  );
};

// live가 없으면 준비 중(센서 연결 대기) — 같은 박스에 카운트다운만 띄우고 조작은 막는다
const LiveBox = ({
  preparingAt,
  isEnding,
  onEnd,
  onCancel,
}: {
  preparingAt: number | null;
  isEnding: boolean;
  onEnd: () => void;
  onCancel: () => void;
}) => {
  const live = useHeartRateLiveStore((state) => state.live);
  const preparingDevice = useHeartRateLiveStore(
    (state) => state.preparingDevice,
  );
  const resuming = useHeartRateLiveStore((state) => state.resuming);
  const themeColor = useCurrentThemeColor();
  const t = useT();
  const isRunning = live?.state === "running";
  const isPaused = live?.state === "paused";
  // 매초 다시 그리는 건 이 박스뿐 — 부모·확인창까지 같이 돌지 않게 여기서 센다
  useSecondTick(!isPaused);
  // 네이티브 갱신은 몇 초 간격이라, 사이 시간은 받은 시각부터 여기서 이어 센다
  const elapsed = !live
    ? 0
    : isPaused
      ? live.elapsedSec
      : live.elapsedSec + secondsSince(live.receivedAt);
  const noSignal =
    isRunning && live.heartRate == null && elapsed >= NO_SIGNAL_SEC;
  const waitingWatch =
    !live &&
    preparingDevice === "watch" &&
    preparingAt !== null &&
    secondsSince(preparingAt) >= WATCH_CHECK_SEC;
  const hint: TKey | null = waitingWatch
    ? "heartRate.watchCheck"
    : liveHint(live, noSignal);
  // 지금 보이는 심박을 잰 기기 — 워치로 재다 워치를 풀면 이어폰 값을 쓴다
  const onWatch = live?.source === "watch" && live.hrSource !== "earphones";
  // 준비 중·일시정지면 실시간 숫자를 전부 흐린다 — 라벨·상태 글자는 그대로
  const dim = isRunning ? undefined : themeColor.disabled;
  // 준비 중(센서 대기)·종료 처리 중·이어 재기 연결 중엔 누를 수 없다 — Button엔 비활성 모양이 없어
  // 여기서 흐린다
  const locked = !live || isEnding || resuming;
  // 워치와 끊긴 동안엔 일시정지·재개가 워치에 닿지 않는다 — 종료는 된다(다시 붙으면 그때 워치도 끝난다)
  const pauseLocked = locked || !!live?.watchLost;
  // 워치는 첫 값이 오기까지 길게는 1분이다(처음엔 워치에서 권한까지 허용) — 그동안 종료 자리를 취소로 쓴다.
  // 이어폰은 3초면 끝난다
  const canCancel = !live && preparingDevice === "watch";
  const endLocked = locked && !canCancel;

  return (
    <Animated.View entering={CONTENT_FADE} style={styles.box}>
      <RNView style={styles.boxHeader}>
        <RNView style={styles.bpmRow}>
          <MaterialCommunityIcons
            name="heart"
            size={26}
            color={dim ?? themeColor.fail}
          />
          <Text style={[styles.bpm, dim && { color: dim }]}>
            {live?.heartRate ?? "--"}
          </Text>
          <Text style={[styles.unit, { color: dim ?? themeColor.subText }]}>
            bpm
          </Text>
        </RNView>
        {live ? (
          <RNView style={styles.status}>
            <RNView
              style={[
                styles.dot,
                {
                  backgroundColor: isRunning
                    ? themeColor.fail
                    : themeColor.subText,
                },
              ]}
            />
            <Text style={[styles.statusText, { color: themeColor.subText }]}>
              {resuming
                ? t("heartRate.resuming")
                : isPaused
                  ? t("heartRate.paused")
                  : t(
                      onWatch
                        ? "heartRate.measuringWatch"
                        : "heartRate.measuringEarphones",
                    )}
            </Text>
          </RNView>
        ) : preparingDevice === "watch" ? (
          // 워치 앱을 깨워 첫 값이 오기까지는 길이가 정해져 있지 않다(첫 사용 땐 워치에서
          // 권한까지 허용한다) — 3초 링이 "1"에 멈춰 보이지 않게 끝없이 도는 표시를 쓴다
          <ActivityIndicator
            color={themeColor.tint}
            accessibilityLabel={t("heartRate.watchPreparing")}
          />
        ) : (
          <CountdownRing startedAt={preparingAt ?? Date.now()} />
        )}
      </RNView>

      <RNView
        style={[styles.divider, { backgroundColor: themeColor.divider }]}
      />

      <RNView style={styles.stats}>
        <Stat
          label={t("heartRate.activeKcal")}
          value={String(live?.activeKcal ?? 0)}
          unit="kcal"
          color={dim}
        />
        <Stat
          label={t("heartRate.totalKcal")}
          value={String(live?.totalKcal ?? 0)}
          unit="kcal"
          color={dim}
        />
        <Stat
          label={t("heartRate.duration")}
          value={formatElapsed(elapsed)}
          color={dim}
        />
      </RNView>

      {hint && (
        <Text style={[styles.hint, { color: themeColor.subText }]}>
          {t(hint)}
        </Text>
      )}

      <RNView style={styles.actions}>
        {/* 보조 동작은 회색 면으로 한 톤 낮춘다 — 민트 테두리는 빨간 종료와 시선을 다퉜다 */}
        <Button
          type="solid"
          disabled={pauseLocked}
          style={{
            ...styles.action,
            backgroundColor: themeColor.background,
            opacity: pauseLocked ? 0.4 : 1,
          }}
          onPress={() => (isPaused ? resumeMeasurement() : HeartRate?.pause())}
        >
          {isPaused ? t("heartRate.resume") : t("heartRate.pause")}
        </Button>
        <Button
          type="solid"
          disabled={endLocked}
          style={{
            ...styles.action,
            backgroundColor: themeColor.fail,
            opacity: endLocked ? 0.4 : 1,
          }}
          onPress={canCancel ? onCancel : onEnd}
        >
          {canCancel ? t("common.cancel") : t("heartRate.end")}
        </Button>
      </RNView>
    </Animated.View>
  );
};

// 센서가 붙기를 기다리는 3초 — 링이 차오르고 가운데 숫자가 3·2·1로 준다. 링은 UI
// 스레드에서 끊김 없이 차고, 숫자는 시작 시각 기준 1초 경계마다 바꾼다(박스의 1초 틱은
// 마운트 시각 기준이라 링이 2/3를 넘고도 "2"가 남는 프레임이 있었다)
const CountdownRing = ({ startedAt }: { startedAt: number }) => {
  const themeColor = useCurrentThemeColor();
  const t = useT();
  const total = PREPARE_SEC * 1000;
  const progress = useSharedValue(
    Math.min(1, (Date.now() - startedAt) / total),
  );

  useEffect(() => {
    progress.value = withTiming(1, {
      duration: Math.max(0, total - (Date.now() - startedAt)),
      easing: Easing.linear,
    });
  }, [progress, startedAt, total]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: RING_LENGTH * (1 - progress.value),
  }));
  const [n, setN] = useState(() =>
    Math.max(1, PREPARE_SEC - secondsSince(startedAt)),
  );
  useEffect(() => {
    const timers = Array.from({ length: PREPARE_SEC - 1 }, (_, index) => {
      const at = startedAt + (index + 1) * 1000;
      return setTimeout(
        () => setN(PREPARE_SEC - index - 1),
        Math.max(0, at - Date.now()),
      );
    });
    return () => timers.forEach(clearTimeout);
  }, [startedAt]);
  const center = RING_SIZE / 2;

  return (
    <RNView
      style={styles.ring}
      accessible
      accessibilityLabel={t("heartRate.preparing", { n })}
    >
      <Svg width={RING_SIZE} height={RING_SIZE} style={StyleSheet.absoluteFill}>
        {/* 12시 방향에서 시작해 시계방향으로 찬다 */}
        <G rotation={-90} origin={`${center}, ${center}`}>
          <Circle
            cx={center}
            cy={center}
            r={RING_RADIUS}
            stroke={themeColor.divider}
            strokeWidth={RING_STROKE}
            fill="none"
          />
          <AnimatedCircle
            cx={center}
            cy={center}
            r={RING_RADIUS}
            stroke={themeColor.tint}
            strokeWidth={RING_STROKE}
            strokeLinecap="round"
            strokeDasharray={RING_LENGTH}
            animatedProps={animatedProps}
            fill="none"
          />
        </G>
      </Svg>
      <Text
        style={[
          styles.ringNumber,
          {
            // 글자는 tintText — 채운 링(tint)과 같은 색이고, 글자용 토큰이라 대비 규칙을 따른다
            color: themeColor.tintText,
            transform: [{ translateX: DIGIT_NUDGE[n] ?? 0 }],
          },
        ]}
      >
        {n}
      </Text>
    </RNView>
  );
};

// 라벨 위·숫자 아래 한 칸. 측정 박스와 날짜 헤더의 기록 요약 띠(compact)가 같이 쓴다
export const Stat = ({
  label,
  value,
  unit,
  color,
  compact,
}: {
  label: string;
  value: string;
  unit?: string;
  // 값·단위 색 (일시정지 때 흐리게)
  color?: string;
  compact?: boolean;
}) => {
  const themeColor = useCurrentThemeColor();
  return (
    <RNView style={[styles.stat, compact && styles.statCompact]}>
      <Text style={[styles.statLabel, { color: themeColor.subText }]}>
        {label}
      </Text>
      <Text
        numberOfLines={1}
        style={[
          styles.statValue,
          compact && styles.statValueCompact,
          color !== undefined && { color },
        ]}
      >
        {value}
        {unit ? (
          <Text
            style={[styles.statUnit, { color: color ?? themeColor.subText }]}
          >
            {` ${unit}`}
          </Text>
        ) : null}
      </Text>
    </RNView>
  );
};

const styles = StyleSheet.create({
  // 잔디 행과 같은 좌우 여백. 리스트 최상단이라 위도 같은 24를 준다
  row: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  // 버튼과 박스가 같은 카드다 — 배경·모서리를 여기 둬야 펼쳐지는 동안에도 둥근 카드가 자란다.
  // 연속 곡률은 곡선이 반경의 약 1.53배에 걸쳐 퍼진다 — 얇은 시작 버튼(높이 약 44)에서
  // 위아래 곡선이 맞닿지 않는 최대가 14다(16부터 알약처럼 보였다)
  card: {
    borderRadius: 14,
    borderCurve: "continuous",
  },
  start: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  startLabel: {
    fontSize: 15,
  },
  startHint: {
    marginLeft: "auto",
    fontFamily: "sb-l",
    fontSize: 12,
  },
  box: {
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 12,
  },
  boxHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  bpmRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 6,
  },
  bpm: {
    fontSize: 40,
    fontFamily: "sb-b",
    fontVariant: ["tabular-nums"],
  },
  unit: {
    fontSize: 14,
    fontFamily: "sb-l",
  },
  status: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 13,
    fontFamily: "sb-l",
  },
  ring: {
    width: RING_SIZE,
    height: RING_SIZE,
    alignItems: "center",
    justifyContent: "center",
  },
  // sb-m 숫자는 줄 박스 위쪽에 앉아 가운데 정렬해도 1pt 뜬다(실측) — 그만큼 내린다
  ringNumber: {
    fontSize: 12,
    fontFamily: "sb-m",
    paddingTop: 2,
  },
  // 위아래 간격을 눈으로 같게 — 40pt 심박 숫자의 줄 상자는 숫자 바닥(기준선) 아래로 11pt쯤 비어 있어(실측)
  // 같은 gap(12)이어도 위가 넓어 보인다. 그만큼 끌어올려 숫자 바닥 → 선을 선 → 아래 라벨 글자(12.3pt)에 맞춘다
  divider: {
    height: 1,
    marginTop: -11,
  },
  // 날짜 헤더 요약 띠와 같은 규칙 — 구분선은 박스 여백(16)에 두고 칸만 4 더 들인다
  stats: {
    flexDirection: "row",
    paddingHorizontal: 4,
  },
  stat: {
    flex: 1,
    gap: 2,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: "sb-l",
  },
  statValue: {
    fontSize: 20,
    fontFamily: "sb-m",
    fontVariant: ["tabular-nums"],
  },
  // 요약 띠: 4칸을 똑같이 나누면 "96-168 bpm"이 줄바꿈된다 — 글자 폭만큼만
  // 차지하고 사이 간격을 부모(space-between)가 나눈다.
  // flexGrow/flexBasis로 덮으면 안 된다: flex:1이 남아 있으면 Yoga가 basis를 0으로
  // 풀어 칸 폭이 0이 된다(글자가 통째로 사라졌다). flex 자체를 0으로 바꾼다
  statCompact: {
    flex: 0,
    flexShrink: 1,
  },
  statValueCompact: {
    fontSize: 15,
  },
  statUnit: {
    fontSize: 12,
    fontFamily: "sb-l",
  },
  hint: {
    fontSize: 12,
    fontFamily: "sb-l",
  },
  // 숫자와 버튼 사이는 박스 gap(12)보다 조금 더 띄운다
  actions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 6,
  },
  // Button은 marginHorizontal 20·paddingVertical 14를 기본으로 주므로 지우고
  // 높이를 못 박는다 — 두 버튼 높이가 글자에 따라 갈리지 않고 글자는 가운데에 온다
  action: {
    flex: 1,
    marginHorizontal: 0,
    paddingVertical: 0,
    height: 44,
    // 알약 모양 — 높이보다 크게 주면 RN이 절반으로 깎아 높이가 바뀌어도 끝이 둥글다
    borderRadius: 999,
    justifyContent: "center",
    // sb-m 한글은 줄 박스 위쪽에 앉아 가운데 정렬해도 1.3pt쯤 떠 보인다(실측) — 그만큼 내린다
    paddingTop: 3,
  },
});
