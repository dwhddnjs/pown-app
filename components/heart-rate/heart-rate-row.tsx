import React, { useEffect, useState } from "react";
// component
import {
  ActivityIndicator,
  View as RNView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { Text, View } from "@/components/themed";
import { Button } from "@/components/button";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { toast } from "sonner-native";
import Animated, { FadeInDown } from "react-native-reanimated";
// zustand
import {
  HeartRateLiveTypes,
  useHeartRateStore,
} from "@/hooks/use-heart-rate-store";
import { useWorkoutPlanStore } from "@/hooks/use-workout-plan-store";
// hooks
import useCurrentThemeColor from "@/hooks/use-current-theme-color";
import { useT } from "@/hooks/use-t";
// lib
import { format } from "date-fns";
// native
import { HeartRate } from "@/modules/heart-rate";
// icon
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

// 애플 권장: prepare 뒤 센서가 붙을 때까지 3초 (네이티브가 기다린다, 여기선 표시만)
const PREPARE_SEC = 3;
// 이만큼 지나도 심박이 없으면 미지원 기기·설정 꺼짐·권한 거부로 보고 안내한다
const NO_SIGNAL_SEC = 20;

// 1초마다 다시 그린다 — 켜져 있을 때만
const useSecondTick = (enabled: boolean) => {
  const [, setTick] = useState(0);
  useEffect(() => {
    if (!enabled) return;
    const id = setInterval(() => setTick((n) => n + 1), 1000);
    return () => clearInterval(id);
  }, [enabled]);
};

// 버튼 자리에서 살짝 내려오며 나타난다. 마운트 때만 돌아서 일시정지·재개엔 다시 안 돈다
const BOX_ENTERING = FadeInDown.duration(260).withInitialValues({
  transform: [{ translateY: -8 }],
});

const secondsSince = (at: number) => Math.floor((Date.now() - at) / 1000);

export const formatElapsed = (seconds: number) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor(seconds / 60) % 60;
  const s = String(seconds % 60).padStart(2, "0");
  return h > 0 ? `${h}:${String(m).padStart(2, "0")}:${s}` : `${m}:${s}`;
};

// 운동 탭 최상단 행. 대기 중엔 얇은 시작 버튼, 측정 중엔 같은 자리에서 박스로 펼쳐진다.
export const HeartRateRow = () => {
  const live = useHeartRateStore((state) => state.live);
  const [preparingAt, setPreparingAt] = useState<number | null>(null);
  const [isEnding, setIsEnding] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const themeColor = useCurrentThemeColor();
  const t = useT();

  useSecondTick(preparingAt !== null || live?.state === "running");

  const onStart = async () => {
    if (!HeartRate || preparingAt !== null) return;
    // 기록은 그날 날짜 헤더 밑에 붙는다 — 오늘 계획이 없으면 남겨도 안 보인다
    const today = format(new Date(), "yyyy.MM.dd");
    const hasTodayPlan = useWorkoutPlanStore
      .getState()
      .workoutPlanList.some((plan) => plan.createdAt.startsWith(today));
    if (!hasTodayPlan) {
      toast(t("heartRate.needPlan"));
      return;
    }
    try {
      if (!(await HeartRate.requestAuthorization())) {
        toast.error(t("heartRate.permissionDenied"));
        return;
      }
      setPreparingAt(Date.now());
      // 시작이 끝나기 전에 네이티브가 첫 스냅샷을 보내 박스가 먼저 뜬다
      await HeartRate.start();
    } catch {
      toast.error(t("heartRate.startFailed"));
    } finally {
      setPreparingAt(null);
    }
  };

  const onEnd = async () => {
    setIsConfirmOpen(false);
    if (!HeartRate || isEnding) return;
    setIsEnding(true);
    try {
      const summary = await HeartRate.end();
      const { setLive, addRecord } = useHeartRateStore.getState();
      setLive(null);
      if (summary) {
        addRecord(summary);
        toast.success(t("heartRate.saved"));
      } else {
        toast(t("heartRate.tooShort"));
      }
    } catch {
      // 세션이 살아 있으면 박스가 그대로 남아 다시 누를 수 있다
    } finally {
      setIsEnding(false);
    }
  };

  if (!live) {
    const countdown =
      preparingAt === null
        ? null
        : Math.max(1, PREPARE_SEC - secondsSince(preparingAt));
    return (
      <View style={styles.row}>
        <TouchableOpacity
          activeOpacity={0.7}
          disabled={countdown !== null}
          onPress={onStart}
          style={[styles.start, { backgroundColor: themeColor.itemColor }]}
        >
          <MaterialCommunityIcons
            name="heart-pulse"
            size={20}
            color={themeColor.fail}
          />
          <Text style={styles.startLabel}>
            {countdown === null
              ? t("heartRate.start")
              : t("heartRate.preparing", { n: countdown })}
          </Text>
          {countdown === null ? (
            <>
              <Text style={[styles.startHint, { color: themeColor.subText }]}>
                {t("heartRate.connected")}
              </Text>
              <MaterialCommunityIcons
                name="chevron-right"
                size={20}
                color={themeColor.subText}
              />
            </>
          ) : (
            <ActivityIndicator
              style={styles.startHintSpace}
              color={themeColor.subText}
            />
          )}
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.row}>
      <LiveBox
        live={live}
        isEnding={isEnding}
        onEnd={() => setIsConfirmOpen(true)}
      />
      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        title={t("heartRate.endTitle")}
        desc={t("heartRate.endDesc")}
        actionLabel={t("heartRate.end")}
        actionColor={themeColor.fail}
        onConfirm={onEnd}
      />
    </View>
  );
};

const LiveBox = ({
  live,
  isEnding,
  onEnd,
}: {
  live: HeartRateLiveTypes;
  isEnding: boolean;
  onEnd: () => void;
}) => {
  const themeColor = useCurrentThemeColor();
  const t = useT();
  const isPaused = live.state === "paused";
  // 네이티브 갱신은 몇 초 간격이라, 사이 시간은 받은 시각부터 여기서 이어 센다
  const elapsed = isPaused
    ? live.elapsedSec
    : live.elapsedSec + secondsSince(live.receivedAt);
  const noSignal =
    !isPaused && live.heartRate == null && elapsed >= NO_SIGNAL_SEC;
  // 일시정지면 실시간 숫자를 전부 흐린다 — 라벨·상태 글자는 그대로
  const dim = isPaused ? themeColor.disabled : undefined;

  return (
    <Animated.View
      entering={BOX_ENTERING}
      style={[styles.box, { backgroundColor: themeColor.itemColor }]}
    >
      <RNView style={styles.boxHeader}>
        <RNView style={styles.bpmRow}>
          <MaterialCommunityIcons
            name="heart"
            size={26}
            color={dim ?? themeColor.fail}
          />
          <Text style={[styles.bpm, dim && { color: dim }]}>
            {live.heartRate ?? "--"}
          </Text>
          <Text style={[styles.unit, { color: dim ?? themeColor.subText }]}>
            bpm
          </Text>
        </RNView>
        <RNView style={styles.status}>
          <RNView
            style={[
              styles.dot,
              {
                backgroundColor: isPaused
                  ? themeColor.subText
                  : themeColor.fail,
              },
            ]}
          />
          <Text style={[styles.statusText, { color: themeColor.subText }]}>
            {isPaused ? t("heartRate.paused") : t("heartRate.measuring")}
          </Text>
        </RNView>
      </RNView>

      <RNView
        style={[styles.divider, { backgroundColor: themeColor.divider }]}
      />

      <RNView style={styles.stats}>
        <Stat
          label={t("heartRate.activeKcal")}
          value={String(live.activeKcal)}
          unit="kcal"
          color={dim}
        />
        <Stat
          label={t("heartRate.totalKcal")}
          value={String(live.totalKcal)}
          unit="kcal"
          color={dim}
        />
        <Stat
          label={t("heartRate.duration")}
          value={formatElapsed(elapsed)}
          color={dim}
        />
      </RNView>

      {noSignal && (
        <Text style={[styles.hint, { color: themeColor.subText }]}>
          {t("heartRate.noSignal")}
        </Text>
      )}

      <RNView style={styles.actions}>
        {/* 보조 동작은 회색 면으로 한 톤 낮춘다 — 민트 테두리는 빨간 종료와 시선을 다퉜다 */}
        <Button
          type="solid"
          disabled={isEnding}
          style={{ ...styles.action, backgroundColor: themeColor.background }}
          onPress={() => (isPaused ? HeartRate?.resume() : HeartRate?.pause())}
        >
          {isPaused ? t("heartRate.resume") : t("heartRate.pause")}
        </Button>
        <Button
          type="solid"
          disabled={isEnding}
          style={{ ...styles.action, backgroundColor: themeColor.fail }}
          onPress={onEnd}
        >
          {t("heartRate.end")}
        </Button>
      </RNView>
    </Animated.View>
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
  start: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
  },
  startLabel: {
    fontSize: 15,
  },
  startHint: {
    marginLeft: "auto",
    fontFamily: "sb-l",
    fontSize: 12,
  },
  startHintSpace: {
    marginLeft: "auto",
  },
  box: {
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderRadius: 12,
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
  divider: {
    height: 1,
  },
  stats: {
    flexDirection: "row",
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
  // 요약 띠: 4칸을 똑같이 나누면 "96–168 bpm"이 줄바꿈된다 — 글자 폭만큼만
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
    justifyContent: "center",
    // sb-m 한글은 줄 박스 위쪽에 앉아 가운데 정렬해도 1.3pt쯤 떠 보인다(실측) — 그만큼 내린다
    paddingTop: 3,
  },
});
