import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
// component
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  View as RNView,
} from "react-native";
import { Text, View } from "@/components/themed";
// zustand
import { useWorkoutPlanStore } from "@/hooks/use-workout-plan-store";
// hooks
import useCurrentThemeColor from "@/hooks/use-current-theme-color";
import { usePopover } from "@/hooks/use-popover";
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
import Animated from "react-native-reanimated";
import { ThemeColorType } from "@/constants/Colors";
import { Lang } from "@/lib/i18n";
// icon
import AntDesign from "@expo/vector-icons/AntDesign";

// 깃허브 잔디와 같은 5단계 — 0(없음)은 empty 배경이라 여기 없고, 1~4단계만.
// 하루 4개 이상은 모두 최고 단계.
const LEVEL_OPACITY = [0.3, 0.5, 0.75, 1] as const;

// 열=주, 행=요일 (깃허브와 동일). 메인이 아닌 보조 카드라 셀은 작게 잡고 가로 스크롤.
const CELL = 10;
const GAP = 3;
const COL = CELL + GAP;
// 월 라벨 줄의 높이 = 라벨 line box(11) + 그리드와 띄우는 여백(4).
// 라벨은 이 영역 안에 absolute로 얹히므로 이 값이 곧 그리드의 paddingTop이다.
const MONTH_LABEL_H = 15;
const MONTH_LABEL_LINE = 11;
// 요일 축과 그리드 사이 간격 (라벨을 오른쪽 정렬해 ko/en 모두 같은 간격이 되게)
const AXIS_GAP = 6;

const WEEKDAY_LABEL: Record<Lang, string[]> = {
  ko: ["", "월", "", "수", "", "금", ""],
  en: ["", "Mon", "", "Wed", "", "Fri", ""],
};

const dayKey = (date: Date) => format(date, "yyyy.MM.dd");

const yearLabel = (year: string, lang: Lang) =>
  lang === "ko" ? `${year}년` : year;

const levelOf = (count: number) => (count > 4 ? 4 : count);

// opacity는 0단계에도 명시한다 — 셀이 뷰 하나뿐이라 눌렀을 때의 activeOpacity를
// 이 값에서 계산해야 한다 (아래 GrassCell 주석)
const cellColor = (count: number, themeColor: ThemeColorType) =>
  count === 0
    ? { backgroundColor: themeColor.empty, opacity: 1 }
    : {
        backgroundColor: themeColor.tint,
        opacity: LEVEL_OPACITY[levelOf(count) - 1],
      };

// left는 툴팁 상자의 x — 셀 중앙에 걸치되 가로 스크롤 뷰포트 밖으로 나가면 잘리므로
// 탭 시점에 뷰포트 안으로 가둬서 담아둔다.
type SelectedCell = {
  key: string;
  count: number;
  x: number;
  y: number;
  left: number;
};

type GrassCellProps = {
  dateKey: string;
  count: number;
  themeColor: ThemeColorType;
  // 해당 연도 밖의 날짜와 미래는 자리만 차지하고 그리지 않는다 (깃허브와 동일)
  hidden: boolean;
  onPress: (cell: Omit<SelectedCell, "left">) => void;
  x: number;
  y: number;
};

// 셀이 371개라 memo가 없으면 툴팁을 한 번 열고 닫을 때마다 전부 리렌더된다
const GrassCell = React.memo(
  ({ dateKey, count, themeColor, hidden, onPress, x, y }: GrassCellProps) => {
    if (hidden) {
      return <RNView style={styles.cell} />;
    }

    const fill = cellColor(count, themeColor);

    return (
      <TouchableOpacity
        // activeOpacity는 절대값이라 그냥 0.6을 주면 옅은 셀이 눌렸을 때 오히려
        // 밝아진다. 예전엔 단계 불투명도를 안쪽 뷰에 줘서 피했는데, 셀이 371개라
        // 뷰가 두 배로 늘어난다 — 셀 자기 단계에 비례시키면 뷰 하나로 끝난다.
        activeOpacity={fill.opacity * 0.6}
        // 10pt 셀은 손가락으로 겨냥하기 어렵다 — 탭 영역만 사방 4pt 넓힌다.
        // 이웃과 겹치는 만큼 가장자리는 옆 날짜가 잡힐 수 있지만 아예 안 눌리는 편보다 낫다.
        hitSlop={4}
        onPress={() => onPress({ key: dateKey, count, x, y })}
        style={[styles.cell, fill]}
      />
    );
  },
);
GrassCell.displayName = "GrassCell";

// 셀 좌표를 알고 있으므로 measure 없이 절대 배치한다.
// 폭을 재지 않고 가운데 정렬하려고 고정폭 상자를 셀 중앙에 걸쳐 놓고 그 안에서 center 정렬.
const TOOLTIP_BOX = 160;
// 툴팁 상자 높이(패딩 3*2 + 줄 높이) + 셀과의 간격
const TOOLTIP_OFFSET = 26;

type TooltipProps = {
  cell: SelectedCell;
  themeColor: ThemeColorType;
  lang: Lang;
  t: ReturnType<typeof useT>;
};

const GrassTooltip = ({ cell, themeColor, lang, t }: TooltipProps) => {
  const date = parse(cell.key, "yyyy.MM.dd", new Date());
  // 위로 띄웠을 때 월 라벨 줄을 덮지 않는 행만 위로 (일·월요일은 아래로)
  const above = cell.y - TOOLTIP_OFFSET >= MONTH_LABEL_H;

  return (
    <RNView
      pointerEvents="none"
      style={[
        styles.tooltipWrap,
        {
          left: cell.left,
          top: above ? cell.y - TOOLTIP_OFFSET : cell.y + CELL + 6,
        },
      ]}
    >
      <RNView style={[styles.tooltip, { backgroundColor: themeColor.tint }]}>
        <Text style={[styles.tooltipText, { color: themeColor.onTint }]}>
          {`${format(date, lang === "ko" ? "M월 d일" : "MMM d", {
            locale: lang === "ko" ? ko : enUS,
          })} · ${
            cell.count === 0
              ? t("grass.none")
              : t("grass.plans", { n: cell.count })
          }`}
        </Text>
      </RNView>
    </RNView>
  );
};

/** 운동계획 화면 최상단 — 연도별 잔디 (연도가 여러 해면 탭으로 전환) */
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
  const [viewWidth, setViewWidth] = useState(0);
  const {
    visible: yearMenuVisible,
    open: openYearMenu,
    close: closeYearMenu,
    style: yearMenuStyle,
  } = usePopover();
  // 드롭다운은 Modal 안에 있어서 버튼 좌표를 재서 붙인다
  const { width: windowWidth } = useWindowDimensions();
  const yearButtonRef = useRef<RNView>(null);
  const [yearAnchor, setYearAnchor] = useState<{
    top: number;
    right: number;
  } | null>(null);

  const onPressYear = () => {
    if (yearMenuVisible) {
      closeYearMenu();
      return;
    }
    yearButtonRef.current?.measureInWindow((x, y, width, height) => {
      setYearAnchor({ top: y + height + 4, right: windowWidth - (x + width) });
      openYearMenu();
    });
  };

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
      closeYearMenu();
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
    [viewWidth, closeYearMenu],
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
        <TouchableOpacity
          ref={yearButtonRef}
          style={[styles.yearButton, { borderColor: themeColor.tint }]}
          onPress={onPressYear}
        >
          <Text style={[styles.yearButtonText, { color: themeColor.tintText }]}>
            {yearLabel(year, lang)}
          </Text>
          <AntDesign
            name={yearMenuVisible ? "up" : "down"}
            size={10}
            color={themeColor.tintText}
          />
        </TouchableOpacity>
      </RNView>
      {/* 카드 밖을 눌러도 닫히도록 Modal로 띄운다 — 카드와 같은 itemColor면
          구분이 안 돼 background를 쓴다 */}
      <Modal
        visible={yearMenuVisible}
        transparent
        animationType="none"
        statusBarTranslucent
        navigationBarTranslucent
        onRequestClose={closeYearMenu}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={closeYearMenu} />
        {yearAnchor && (
          <Animated.View
            // 버튼에서 아래로 펼쳐졌다가 다시 접히는 느낌
            style={[
              styles.dropdown,
              {
                top: yearAnchor.top,
                right: yearAnchor.right,
                backgroundColor: themeColor.background,
              },
              yearMenuStyle,
            ]}
          >
            {years.map((item) => (
              <TouchableOpacity
                key={item}
                style={styles.dropdownItem}
                onPress={() => {
                  setYear(item);
                  closeYearMenu();
                }}
              >
                <Text
                  style={[
                    styles.yearButtonText,
                    {
                      color:
                        item === year ? themeColor.tintText : themeColor.text,
                    },
                  ]}
                >
                  {yearLabel(item, lang)}
                </Text>
              </TouchableOpacity>
            ))}
          </Animated.View>
        )}
      </Modal>
      <RNView style={{ height: 1, backgroundColor: themeColor.divider }} />

      <RNView style={{ flexDirection: "row" }}>
        <RNView
          style={{
            marginRight: AXIS_GAP,
            paddingTop: MONTH_LABEL_H,
            gap: GAP,
          }}
        >
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
  yearButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderWidth: 1.5,
    borderRadius: 50,
  },
  yearButtonText: {
    fontFamily: "sb-l",
    fontSize: 12,
    // sb 폰트는 ascender 여백이 커서 lineHeight를 안 주면 글자가 박스 위쪽에 붙는다
    lineHeight: 16,
  },
  dropdown: {
    position: "absolute",
    // 버튼(위쪽 모서리)에서 펼쳐지도록
    transformOrigin: "top right",
    minWidth: 72,
    paddingVertical: 2,

    borderRadius: 8,
  },
  dropdownItem: {
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  cell: {
    width: CELL,
    height: CELL,
    borderRadius: 2,
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
  tooltipWrap: {
    position: "absolute",
    width: TOOLTIP_BOX,
    alignItems: "center",
    zIndex: 10,
  },
  tooltip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  tooltipText: {
    fontFamily: "sb-l",
    fontSize: 11,
  },
});
