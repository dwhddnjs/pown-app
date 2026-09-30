import React, { useMemo, useState } from "react";
// component
import {
  View as RNView,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
} from "react-native";
import { Text } from "../themed";
import { BarChart } from "react-native-gifted-charts";
import { Stat } from "@/components/heart-rate/heart-rate-row";
import { ChartBody, ChartCard } from "./chart-card";
// zustand
import { summarize, useHeartRateStore } from "@/hooks/use-heart-rate-store";
// hook
import useCurrentThemeColor from "@/hooks/use-current-theme-color";
import { useT } from "@/hooks/use-t";
import { useChartStore } from "@/hooks/use-chart-store";
// lib
import { getDaysInMonth, parse } from "date-fns";
// native
import { isHeartRateSupported } from "@/modules/heart-rate";

type Metric = "kcal" | "time";

const NO_OF_SECTIONS = 4;
// 눈금 한 칸 — 이 배수로 올림해야 라벨이 25·50·75… / 15·30·45…처럼 읽힌다
const STEP: Record<Metric, number> = { kcal: 25, time: 15 };
const Y_AXIS_LABEL_WIDTH = 32;
// 마지막 날 라벨("30")이 칸보다 넓어 카드 끝에서 잘린다 — 오른쪽에 이만큼 비운다
const END_SPACE = 12;
// 한 달(최대 31칸)을 다 깔면 칸이 9pt 남짓이라 날짜 라벨은 이 날들에만 단다
const LABELED_DAYS = new Set([1, 5, 10, 15, 20, 25, 30]);

// 기록 탭의 심박수 측정 카드 — 그 달 합계와 날짜별 활동 칼로리·운동 시간 막대.
// 날짜 축을 1일~말일로 고정해 쉰 날이 빈칸으로 보여야 "추이"가 읽힌다
export const HeartRateChart = () => {
  const themeColor = useCurrentThemeColor();
  const t = useT();
  const { width } = useWindowDimensions();
  const { date } = useChartStore();
  const records = useHeartRateStore((state) => state.records);
  const [metric, setMetric] = useState<Metric>("kcal");

  // 차트 스토어는 yyyyMM, 기록 날짜는 "yyyy.MM.dd"
  const prefix = `${date.slice(0, 4)}.${date.slice(4, 6)}`;
  const month = useMemo(
    () => records.filter((record) => record.date.startsWith(prefix)),
    [records, prefix],
  );
  const total = summarize(month);

  const bars = useMemo(() => {
    const days = getDaysInMonth(parse(date, "yyyyMM", new Date()));
    return Array.from({ length: days }, (_, index) => {
      const day = index + 1;
      const key = `${prefix}.${String(day).padStart(2, "0")}`;
      const summary = summarize(month.filter((record) => record.date === key));
      return {
        value: !summary
          ? 0
          : metric === "kcal"
            ? summary.activeKcal
            : Math.round(summary.durationSec / 60),
        label: LABELED_DAYS.has(day) ? String(day) : "",
      };
    });
  }, [month, metric, prefix, date]);

  // 측정할 수 없는 기기에서 빈 카드를 보여줄 이유가 없다 (다른 폰 백업을 복원했으면 보인다)
  if (!isHeartRateSupported && records.length === 0) return null;

  // 카드 콘텐츠 폭 = 화면폭 - (기록 탭 패딩 20*2 + 카드 패딩 12*2)
  const chartWidth = width - 64 - Y_AXIS_LABEL_WIDTH;
  const slot = (chartWidth - END_SPACE) / bars.length;
  const unit = STEP[metric] * NO_OF_SECTIONS;
  const maxValue = Math.max(
    unit,
    Math.ceil((Math.max(...bars.map((bar) => bar.value)) * 1.1) / unit) * unit,
  );
  // 분으로 먼저 반올림해야 "1시간 60분"이 안 나온다
  const totalMinutes = total ? Math.round(total.durationSec / 60) : 0;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return (
    <ChartCard
      title={t("chart.heartTitle")}
      isEmpty={!total}
      emptyMessage={t("chart.heartEmpty")}
      style={styles.card}
    >
      <RNView style={styles.stats}>
        <Stat
          label={t("chart.heartTotalKcal")}
          value={String(total?.activeKcal ?? 0)}
          unit="kcal"
        />
        <Stat
          label={t("chart.heartTotalTime")}
          value={
            hours
              ? t("heartRate.hoursMinutes", { h: hours, m: minutes })
              : t("heartRate.minutes", { n: minutes })
          }
        />
        <Stat
          label={t("heartRate.avg")}
          value={String(total?.avgHR ?? "--")}
          unit="bpm"
        />
      </RNView>
      <RNView style={styles.chips}>
        {(["kcal", "time"] as const).map((key) => {
          const selected = metric === key;
          return (
            <TouchableOpacity
              key={key}
              activeOpacity={0.7}
              onPress={() => setMetric(key)}
              style={[
                styles.chip,
                {
                  backgroundColor: selected
                    ? themeColor.tint
                    : themeColor.background,
                },
              ]}
            >
              <Text
                style={[
                  styles.chipText,
                  { color: selected ? themeColor.onTint : themeColor.subText },
                ]}
              >
                {key === "kcal" ? t("chart.heartKcal") : t("chart.heartTime")}
              </Text>
            </TouchableOpacity>
          );
        })}
      </RNView>
      <ChartBody>
        <BarChart
          data={bars}
          width={chartWidth}
          barWidth={slot * 0.6}
          spacing={slot * 0.4}
          initialSpacing={slot * 0.2}
          endSpacing={0}
          barBorderRadius={2}
          frontColor={themeColor.tint}
          disableScroll
          maxValue={maxValue}
          noOfSections={NO_OF_SECTIONS}
          yAxisLabelWidth={Y_AXIS_LABEL_WIDTH}
          // 눈금이 정수 배수라 소수점("100.0")은 군더더기다
          formatYLabel={(label) => String(Math.round(Number(label)))}
          yAxisThickness={1}
          xAxisThickness={1}
          yAxisColor={themeColor.subText}
          xAxisColor={themeColor.subText}
          rulesColor={themeColor.divider}
          rulesType="dashed"
          yAxisTextStyle={{
            color: themeColor.text,
            fontFamily: "sb-l",
            fontSize: 10,
          }}
          labelWidth={20}
          xAxisLabelTextStyle={{
            color: themeColor.text,
            fontFamily: "sb-l",
            fontSize: 10,
            textAlign: "center",
          }}
        />
      </ChartBody>
    </ChartCard>
  );
};

const styles = StyleSheet.create({
  // 막대 차트가 카드 모서리를 넘어 그려지지 않도록 카드에서도 한 번 자른다
  card: {
    overflow: "hidden",
  },
  stats: {
    flexDirection: "row",
    paddingHorizontal: 4,
  },
  chips: {
    flexDirection: "row",
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  chipText: {
    fontSize: 12,
    fontFamily: "sb-m",
  },
});
