import React, { useEffect, useMemo, useState } from "react";
// component
import {
  View as RNView,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
} from "react-native";
import { Text, View } from "@/components/themed";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Stat } from "@/components/heart-rate/heart-rate-row";
import Svg, { Line, Rect } from "react-native-svg";
// zustand
import {
  deleteRecord,
  HeartRateRecordTypes,
  toMinutes,
  useHeartRateStore,
} from "@/hooks/use-heart-rate-store";
// hooks
import useCurrentThemeColor from "@/hooks/use-current-theme-color";
import { useLanguage } from "@/hooks/use-user-store";
import { useT } from "@/hooks/use-t";
// lib
import { formatDate, formatTime, PLAN_DATE_FORMAT } from "@/lib/date";
import { addMinutes, format, parse } from "date-fns";
// expo
import { useLocalSearchParams, useRouter } from "expo-router";
// icon
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

// 애플 피트니스 심박 그래프 모양 — 가는 막대 하나가 한 칸(1분)의 최소~최대다
const GRAPH_HEIGHT = 56;
// 막대 간격이 이보다 좁아지면(약 110분 넘는 운동) 이웃한 분을 묶는다. 애플은 약 3.8pt
const MIN_SLOT = 3;
const MAX_BAR_WIDTH = 3;

// 날짜 헤더의 심박 요약을 누르면 뜨는 그날의 측정 목록. 요약은 합친 값이라 잘못 잰
// 한 번을 골라 지울 곳이 여기뿐이다
export default function HeartRateRecords() {
  const t = useT();
  const lang = useLanguage();
  const themeColor = useCurrentThemeColor();
  const { back } = useRouter();
  const { date } = useLocalSearchParams<{ date: string }>();
  const records = useHeartRateStore((state) => state.records);
  // 카드 콘텐츠 폭 = 목록 폭 - (카드 패딩 12*2 + 칸 들여쓰기 4*2). 아이패드 모달은 화면보다
  // 좁게 떠서 목록 폭을 잰다 — 재기 전 첫 그림은 화면폭 기준(아이폰에선 둘이 같다)
  const windowWidth = useWindowDimensions().width;
  const [listWidth, setListWidth] = useState<number | null>(null);
  const graphWidth = (listWidth ?? windowWidth - 40) - 32;
  const [target, setTarget] = useState<HeartRateRecordTypes | null>(null);

  // startedAt은 "yyyy.MM.dd HH:mm:ss"라 문자열 순서가 곧 시간 순서다
  const day = useMemo(
    () =>
      records
        .filter((record) => record.date === date)
        .sort((a, b) => a.startedAt.localeCompare(b.startedAt)),
    [records, date],
  );

  // 마지막 기록을 지우면 볼 게 없다
  useEffect(() => {
    if (day.length === 0) back();
  }, [day.length, back]);

  return (
    <View style={styles.container}>
      <RNView style={styles.header}>
        <Text style={styles.title}>{t("heartRate.recordsTitle")}</Text>
        <Text style={[styles.date, { color: themeColor.subText }]}>
          {formatDate(date, lang)}
        </Text>
      </RNView>
      <ScrollView
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        onLayout={(event) => setListWidth(event.nativeEvent.layout.width)}
      >
        {day.map((record) => (
          <RNView
            key={record.id}
            style={[styles.card, { backgroundColor: themeColor.itemColor }]}
          >
            <RNView style={styles.cardHeader}>
              <Text style={styles.time}>{formatTime(record.startedAt)}</Text>
              <Text style={[styles.duration, { color: themeColor.subText }]}>
                {t("heartRate.minutes", { n: toMinutes(record.durationSec) })}
              </Text>
              <TouchableOpacity
                hitSlop={12}
                activeOpacity={0.6}
                onPress={() => setTarget(record)}
                style={styles.delete}
              >
                <MaterialCommunityIcons
                  name="trash-can-outline"
                  size={20}
                  color={themeColor.subText}
                />
              </TouchableOpacity>
            </RNView>
            <RNView
              style={[styles.divider, { backgroundColor: themeColor.divider }]}
            />
            <RNView style={styles.stats}>
              {record.avgHR != null && (
                <Stat
                  compact
                  label={t("heartRate.avg")}
                  value={String(record.avgHR)}
                  unit="bpm"
                />
              )}
              {record.minHR != null && record.maxHR != null && (
                <Stat
                  compact
                  label={t("heartRate.range")}
                  value={`${record.minHR}-${record.maxHR}`}
                  unit="bpm"
                />
              )}
              <Stat
                compact
                label={t("heartRate.activeKcal")}
                value={String(record.activeKcal)}
                unit="kcal"
              />
              <Stat
                compact
                label={t("heartRate.totalKcal")}
                value={String(record.totalKcal)}
                unit="kcal"
              />
            </RNView>
            {record.heartRates && (
              <HeartRateGraph
                ranges={record.heartRates}
                startedAt={record.startedAt}
                width={graphWidth}
              />
            )}
          </RNView>
        ))}
        <Text style={[styles.note, { color: themeColor.subText }]}>
          {t("heartRate.recordsNote")}
        </Text>
      </ScrollView>
      <ConfirmDialog
        isOpen={!!target}
        onClose={() => setTarget(null)}
        title={t("heartRate.deleteTitle")}
        desc={t("heartRate.deleteDesc")}
        actionLabel={t("common.delete")}
        actionColor={themeColor.fail}
        onConfirm={() => {
          if (target) deleteRecord(target);
          setTarget(null);
        }}
      />
    </View>
  );
}

// 세로 격자(시작·1/3·2/3) 아래에 그 시각을, 오른쪽 위·아래에 전체 최대·최소를 단다
const HeartRateGraph = ({
  ranges,
  startedAt,
  width,
}: {
  ranges: ([number, number] | null)[];
  startedAt: string;
  width: number;
}) => {
  const themeColor = useCurrentThemeColor();
  // 막대 하나로는 흐름이 안 보인다
  if (ranges.filter(Boolean).length < 2) return null;
  const values = ranges.flatMap((range) => range ?? []);

  const group = Math.ceil(ranges.length / Math.floor(width / MIN_SLOT));
  const bars = Array.from(
    { length: Math.ceil(ranges.length / group) },
    (_, index) => {
      const chunk = ranges
        .slice(index * group, (index + 1) * group)
        .filter((range) => range !== null);
      return chunk.length
        ? [
            Math.min(...chunk.map((range) => range[0])),
            Math.max(...chunk.map((range) => range[1])),
          ]
        : null;
    },
  );
  const low = Math.min(...values);
  const high = Math.max(...values);
  const slot = width / bars.length;
  const barWidth = Math.min(MAX_BAR_WIDTH, slot * 0.6);
  // 둥근 끝이 위아래에서 잘리지 않게 막대 폭 절반만큼 띄운다
  const inner = GRAPH_HEIGHT - barWidth;
  const toY = (bpm: number) =>
    barWidth / 2 +
    (high === low ? inner / 2 : ((high - bpm) / (high - low)) * inner);
  const start = parse(startedAt, PLAN_DATE_FORMAT, new Date());

  return (
    <RNView style={styles.graph}>
      <Text
        style={[
          styles.graphValue,
          styles.graphMax,
          { color: themeColor.subText },
        ]}
      >
        {high}
      </Text>
      <Svg width={width} height={GRAPH_HEIGHT}>
        {[0, 1, 2].map((k) => (
          <Line
            key={k}
            x1={(width * k) / 3 + 0.5}
            x2={(width * k) / 3 + 0.5}
            y1={0}
            y2={GRAPH_HEIGHT}
            stroke={themeColor.divider}
            strokeWidth={1}
          />
        ))}
        <Line
          x1={0}
          x2={width}
          y1={GRAPH_HEIGHT - 0.5}
          y2={GRAPH_HEIGHT - 0.5}
          stroke={themeColor.divider}
          strokeWidth={1}
        />
        {bars.map((bar, index) => {
          if (!bar) return null;
          // 최소=최대인 칸도 막대 폭만큼은 그려 점 캡슐로 보인다
          const top = toY(bar[1]);
          const bottom = toY(bar[0]);
          const height = Math.max(barWidth, bottom - top);
          return (
            <Rect
              key={index}
              x={index * slot + (slot - barWidth) / 2}
              y={(top + bottom - height) / 2}
              width={barWidth}
              height={height}
              rx={barWidth / 2}
              fill={themeColor.fail}
            />
          );
        })}
      </Svg>
      <RNView style={styles.graphLabels}>
        {[0, 1, 2].map((k) => (
          <Text
            key={k}
            style={[
              styles.graphValue,
              styles.graphTime,
              { color: themeColor.subText },
            ]}
          >
            {format(
              addMinutes(start, Math.round((ranges.length * k) / 3)),
              "HH:mm",
            )}
          </Text>
        ))}
        <Text
          style={[
            styles.graphValue,
            styles.graphMin,
            { color: themeColor.subText },
          ]}
        >
          {low}
        </Text>
      </RNView>
    </RNView>
  );
};

const styles = StyleSheet.create({
  // 달력 히스토리 모달과 같은 제목 자리
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  // 목록은 이 아래에서 잘린다 — 여백을 목록 안(paddingTop)에만 두면 스크롤할 때 카드가
  // 날짜 글자 바로 밑까지 붙어 올라온다. 쉴 때 간격(12+8)은 전과 같은 20이다
  header: {
    paddingBottom: 12,
  },
  title: {
    fontSize: 24,
  },
  date: {
    marginTop: 4,
    fontSize: 14,
    fontFamily: "sb-l",
  },
  list: {
    paddingTop: 8,
    paddingBottom: 120,
    gap: 12,
  },
  card: {
    borderRadius: 12,
    borderCurve: "continuous",
    paddingHorizontal: 12,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 12,
  },
  time: {
    fontSize: 16,
    fontFamily: "sb-m",
    fontVariant: ["tabular-nums"],
  },
  duration: {
    fontSize: 13,
    fontFamily: "sb-l",
  },
  delete: {
    marginLeft: "auto",
  },
  divider: {
    height: StyleSheet.hairlineWidth,
  },
  // 날짜 헤더 요약 띠와 같은 칸·여백 (근거는 plan-date-header.tsx)
  stats: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 13.67,
    paddingBottom: 10,
    paddingHorizontal: 4,
  },
  // 칸은 stats와 같이 카드 안쪽에서 4 더 들인다
  graph: {
    paddingHorizontal: 4,
    paddingBottom: 12,
  },
  graphValue: {
    fontSize: 12,
    fontFamily: "sb-l",
    fontVariant: ["tabular-nums"],
  },
  graphMax: {
    alignSelf: "flex-end",
    marginBottom: 4,
  },
  graphLabels: {
    flexDirection: "row",
    marginTop: 4,
  },
  graphTime: {
    flex: 1,
  },
  graphMin: {
    position: "absolute",
    right: 0,
  },
  note: {
    marginTop: 4,
    fontSize: 12,
    fontFamily: "sb-l",
    textAlign: "center",
  },
});
