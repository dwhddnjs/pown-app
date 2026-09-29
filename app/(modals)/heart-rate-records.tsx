import React, { useEffect, useMemo, useState } from "react";
// component
import {
  View as RNView,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { Text, View } from "@/components/themed";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Stat } from "@/components/heart-rate/heart-rate-row";
// zustand
import {
  deleteRecord,
  HeartRateRecordTypes,
  useHeartRateStore,
} from "@/hooks/use-heart-rate-store";
// hooks
import useCurrentThemeColor from "@/hooks/use-current-theme-color";
import { useLanguage } from "@/hooks/use-user-store";
import { useT } from "@/hooks/use-t";
// lib
import { formatDate } from "@/lib/date";
// expo
import { useLocalSearchParams, useRouter } from "expo-router";
// icon
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

// 날짜 헤더의 심박 요약을 누르면 뜨는 그날의 측정 목록. 요약은 합친 값이라 잘못 잰
// 한 번을 골라 지울 곳이 여기뿐이다
export default function HeartRateRecords() {
  const t = useT();
  const lang = useLanguage();
  const themeColor = useCurrentThemeColor();
  const { back } = useRouter();
  const { date } = useLocalSearchParams<{ date: string }>();
  const records = useHeartRateStore((state) => state.records);
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
      >
        {day.map((record) => (
          <RNView
            key={record.id}
            style={[styles.card, { backgroundColor: themeColor.itemColor }]}
          >
            <RNView style={styles.cardHeader}>
              <Text style={styles.time}>{record.startedAt.slice(11, 16)}</Text>
              <Text style={[styles.duration, { color: themeColor.subText }]}>
                {t("heartRate.minutes", {
                  n: Math.max(1, Math.round(record.durationSec / 60)),
                })}
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
  note: {
    marginTop: 4,
    fontSize: 12,
    fontFamily: "sb-l",
    textAlign: "center",
  },
});
