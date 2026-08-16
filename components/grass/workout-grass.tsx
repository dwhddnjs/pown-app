import { useCallback, useEffect, useMemo, useRef, useState } from "react";
// component
import { ScrollView, StyleSheet, View as RNView } from "react-native";
import { Text, View } from "@/components/themed";
import {
  CELL,
  cellColor,
  COL,
  GAP,
  GrassCell,
  MONTH_LABEL_H,
  MONTH_LABEL_LINE,
  SelectedCell,
} from "./grass-cell";
import { GrassTooltip, TOOLTIP_BOX } from "./grass-tooltip";
import { YearSelect } from "./year-select";
// zustand
import { useWorkoutPlanStore } from "@/hooks/use-workout-plan-store";
// hooks
import useCurrentThemeColor from "@/hooks/use-current-theme-color";
import { useT } from "@/hooks/use-t";
import { useLanguage } from "@/hooks/use-user-store";
// lib
import {
  eachDayOfInterval,
  endOfWeek,
  endOfYear,
  format,
  isAfter,
  parse,
  startOfDay,
  startOfWeek,
  startOfYear,
} from "date-fns";
import { enUS, ko } from "date-fns/locale";
import { Lang } from "@/lib/i18n";

// 요일 축과 그리드 사이 간격 (라벨을 오른쪽 정렬해 ko/en 모두 같은 간격이 되게)
const AXIS_GAP = 6;

const WEEKDAY_LABEL: Record<Lang, string[]> = {
  ko: ["", "월", "", "수", "", "금", ""],
  en: ["", "Mon", "", "Wed", "", "Fri", ""],
};

const dayKey = (date: Date) => format(date, "yyyy.MM.dd");

/** 운동계획 화면 최상단 — 연도별 잔디 (연도가 여러 해면 드롭다운으로 전환) */
export const YearGrass = () => {
  const themeColor = useCurrentThemeColor();
  const t = useT();
  const lang = useLanguage();
  const { workoutPlanList } = useWorkoutPlanStore();
  const scrollRef = useRef<ScrollView>(null);

  // 탭한 셀은 2초 뒤 자동으로 닫는다 (다시 탭하면 토글)
  const [selected, setSelected] = useState<SelectedCell | null>(null);
  useEffect(() => {
    if (!selected) return;
    const timer = setTimeout(() => setSelected(null), 2000);
    return () => clearTimeout(timer);
  }, [selected]);

  // 스크롤 위치는 툴팁을 가둘 때만 필요하다 — state로 두면 셀 수백 개가 매 프레임 리렌더된다
  const scrollX = useRef(0);
  const [viewWidth, setViewWidth] = useState(0);

  // "yyyy.MM.dd" → 그 날 작성한 운동계획 수
  const counts = useMemo(() => {
    const map: Record<string, number> = {};
    for (const plan of workoutPlanList) {
      const key = plan.createdAt.slice(0, 10);
      map[key] = (map[key] ?? 0) + 1;
    }
    return map;
  }, [workoutPlanList]);

  const thisYear = format(new Date(), "yyyy");
  const years = useMemo(() => {
    const set = new Set(
      workoutPlanList.map((plan) => plan.createdAt.slice(0, 4)),
    );
    set.add(thisYear);
    return [...set].sort().reverse();
  }, [workoutPlanList, thisYear]);

  const [year, setYear] = useState(thisYear);

  // 셀에 필요한 값(키·좌표·숨김)은 여기서 한 번만 만든다 — 렌더마다 371번 format 하지 않도록.
  // counts는 여기 들어오지 않아야 기록이 바뀌어도 날짜 계산을 다시 하지 않는다.
  const { weeks, monthLabels } = useMemo(() => {
    const today = startOfDay(new Date());
    const base = parse(year, "yyyy", new Date());
    const days = eachDayOfInterval({
      start: startOfWeek(startOfYear(base)),
      end: endOfWeek(endOfYear(base)),
    });
    const allWeeks = Array.from({ length: days.length / 7 }, (_, i) =>
      days.slice(i * 7, i * 7 + 7),
    );
    // 올해는 오늘이 든 주에서 끊는다 — 남은 달을 그려봤자 오른쪽에 빈 여백만 남는다.
    // 지난 해는 findIndex가 -1이라 12월까지 그대로 간다.
    const todayIndex = allWeeks.findIndex((week) =>
      week.some((day) => dayKey(day) === dayKey(new Date())),
    );
    const weekList =
      todayIndex < 0 ? allWeeks : allWeeks.slice(0, todayIndex + 1);
    // 월 이름은 그 달이 처음 등장하는 열 위에 (깃허브와 동일)
    const labels: { label: string; x: number }[] = [];
    weekList.forEach((week, index) => {
      const first = week[0];
      if (format(first, "yyyy") !== year) return;
      const prev = weekList[index - 1]?.[0];
      if (prev && prev.getMonth() === first.getMonth()) return;
      labels.push({
        label: format(first, lang === "ko" ? "M월" : "MMM", {
          locale: lang === "ko" ? ko : enUS,
        }),
        x: index * COL,
      });
    });

    const cells = weekList.map((week, weekIndex) =>
      week.map((day, dayIndex) => ({
        key: dayKey(day),
        hidden: format(day, "yyyy") !== year || isAfter(startOfDay(day), today),
        x: weekIndex * COL,
        y: MONTH_LABEL_H + dayIndex * COL,
      })),
    );

    return { weeks: cells, monthLabels: labels };
  }, [year, lang]);

  const total = useMemo(
    () =>
      Object.entries(counts).reduce(
        (acc, [key, count]) => (key.slice(0, 4) === year ? acc + count : acc),
        0,
      ),
    [counts, year],
  );

  // memo된 셀에 넘기므로 참조가 유지돼야 한다
  const onPressCell = useCallback(
    (cell: Omit<SelectedCell, "left">) => {
      setSelected((prev) =>
        prev?.key === cell.key
          ? null
          : {
              ...cell,
              // 뷰포트가 툴팁보다 좁으면 상한이 하한보다 작아진다 — 그땐 왼쪽 끝에 붙인다
              left: Math.max(
                scrollX.current + 2,
                Math.min(
                  cell.x + CELL / 2 - TOOLTIP_BOX / 2,
                  scrollX.current + viewWidth - TOOLTIP_BOX - 2,
                ),
              ),
            },
      );
    },
    [viewWidth],
  );

  // 올해는 마지막 열(오늘)이 오른쪽 끝에 오도록, 지난 해는 1월부터 보여준다
  useEffect(() => {
    if (!viewWidth) return;
    const contentWidth = weeks.length * COL - GAP;
    const x = year === thisYear ? Math.max(0, contentWidth - viewWidth) : 0;
    scrollX.current = x;
    scrollRef.current?.scrollTo({ x, animated: false });
  }, [year, thisYear, weeks.length, viewWidth]);

  return (
    <View style={[styles.card, { backgroundColor: themeColor.itemColor }]}>
      <RNView style={styles.row}>
        <Text style={{ fontSize: 16 }}>{t("grass.title")}</Text>
        <Text style={[styles.total, { color: themeColor.tintText }]}>
          {t("grass.count", { n: total })}
        </Text>
        <YearSelect years={years} year={year} lang={lang} onChange={setYear} />
      </RNView>
      <RNView style={{ height: 1, backgroundColor: themeColor.divider }} />

      <RNView style={{ flexDirection: "row" }}>
        <RNView style={styles.axis}>
          {WEEKDAY_LABEL[lang].map((label, index) => (
            <Text
              key={index}
              style={[styles.axisText, { color: themeColor.subText }]}
            >
              {label}
            </Text>
          ))}
        </RNView>
        <ScrollView
          ref={scrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          onLayout={(e) => setViewWidth(e.nativeEvent.layout.width)}
          scrollEventThrottle={32}
          onScroll={(e) => {
            scrollX.current = e.nativeEvent.contentOffset.x;
          }}
        >
          <RNView style={{ paddingTop: MONTH_LABEL_H }}>
            {monthLabels.map((item) => (
              <Text
                key={item.x}
                style={[
                  styles.monthLabel,
                  { color: themeColor.subText, left: item.x },
                ]}
              >
                {item.label}
              </Text>
            ))}
            <RNView style={{ flexDirection: "row", gap: GAP }}>
              {weeks.map((week, weekIndex) => (
                <RNView key={weekIndex} style={{ gap: GAP }}>
                  {week.map((cell) => (
                    <GrassCell
                      key={cell.key}
                      dateKey={cell.key}
                      count={counts[cell.key] ?? 0}
                      themeColor={themeColor}
                      hidden={cell.hidden}
                      onPress={onPressCell}
                      x={cell.x}
                      y={cell.y}
                    />
                  ))}
                </RNView>
              ))}
            </RNView>
            {selected && (
              <GrassTooltip
                cell={selected}
                themeColor={themeColor}
                lang={lang}
                t={t}
              />
            )}
          </RNView>
        </ScrollView>
      </RNView>

      <RNView style={styles.legend}>
        <Text style={[styles.legendText, { color: themeColor.subText }]}>
          {t("grass.less")}
        </Text>
        {[0, 1, 2, 3, 4].map((level) => (
          <RNView
            key={level}
            style={[styles.legendCell, cellColor(level, themeColor)]}
          />
        ))}
        <Text style={[styles.legendText, { color: themeColor.subText }]}>
          {t("grass.more")}
        </Text>
      </RNView>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 6,
  },
  total: {
    // 개수는 타이틀 바로 옆, 연도 필터는 오른쪽 끝으로 밀어낸다
    marginRight: "auto",
    fontFamily: "sb-l",
    fontSize: 13,
  },
  axis: {
    marginRight: AXIS_GAP,
    paddingTop: MONTH_LABEL_H,
    gap: GAP,
  },
  axisText: {
    fontFamily: "sb-l",
    fontSize: 9,
    lineHeight: CELL,
    height: CELL,
    textAlign: "right",
  },
  monthLabel: {
    position: "absolute",
    top: 0,
    fontFamily: "sb-l",
    fontSize: 9,
    lineHeight: MONTH_LABEL_LINE,
  },
  legend: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-end",
    gap: 4,
  },
  legendCell: {
    width: 9,
    height: 9,
    borderRadius: 2,
  },
  legendText: {
    fontFamily: "sb-l",
    fontSize: 10,
  },
});
