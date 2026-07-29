import { useCallback, useEffect, useMemo, useRef, useState } from "react";
// component
import { WorkoutPlan } from "@/components/workout-plan/workout-plan";
import { YearGrass } from "@/components/grass";
import { Text, View } from "@/components/themed";
import { StyleSheet, TouchableOpacity, ViewToken } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { EmptyList } from "@/components/workout-plan/empty-list";
// zustand
import {
  useWorkoutPlanStore,
  WorkoutPlanTypes,
} from "@/hooks/use-workout-plan-store";
import { useSelectDateStore } from "@/hooks/use-select-date-store";
// lib
import { convertChartDate, formatDate, groupByDate } from "@/lib/function";
import { useLanguage } from "@/hooks/use-user-store";
// expo
import { useNavigation, useRouter } from "expo-router";

// navigation
import { useHeaderHeight } from "@react-navigation/elements";
// hooks
import useCurrentThemeColor from "@/hooks/use-current-theme-color";
import { useT } from "@/hooks/use-t";
// icon
import InfoIcon from "@expo/vector-icons/FontAwesome6";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useIsModalOpenStore } from "@/hooks/use-is-modal-open-store";

// 날짜 그룹을 통째로 한 행에 넣으면 행 하나가 화면 몇 개 높이가 되어 가상화가
// 무의미해진다 — 빠른 플릭으로 창을 벗어나면 그 거대한 행들을 처음부터 다시
// 그리는 동안 화면이 비어 보인다. 그래서 운동 하나가 한 행이다.
// 잔디도 행으로 두면 헤더 타이틀을 "맨 위에 걸친 행" 하나로만 판정할 수 있다.
type Row =
  | { kind: "grass" }
  | { kind: "header"; date: string }
  | {
      kind: "plan";
      date: string;
      plan: WorkoutPlanTypes;
      index: number;
      total: number;
    };

const GRASS_ROW: Row = { kind: "grass" };

// 1px이라도 보이면 viewable — 잔디가 완전히 지나가야 날짜 타이틀로 바뀐다
const VIEWABILITY_CONFIG = { itemVisiblePercentThreshold: 0 };

// 화면 밖으로 미리 그려둘 거리(px) — 한 화면 반쯤. 빠른 플릭이 도달하기 전에
// 셀이 준비돼 있게 한다. (기본 250은 강한 플릭을 못 따라간다)
const DRAW_DISTANCE = 1200;

const getItemType = (item: Row) => item.kind;

export default function TabOneScreen() {
  const { workoutPlanList } = useWorkoutPlanStore();
  const { date: selectedDate } = useSelectDateStore();
  const headerHeight = useHeaderHeight();
  const themeColor = useCurrentThemeColor();
  const t = useT();
  const lang = useLanguage();
  const navigation = useNavigation();
  const { open } = useIsModalOpenStore();

  const router = useRouter();

  // 전체를 한 번만 펼쳐둔다 — 화면에 그리는 양은 가상화가 알아서 줄이므로
  // 스크롤 도중 데이터를 덧붙일(=리렌더할) 이유가 없다.
  // dates/starts는 날짜 단위(점프)를 행 인덱스로 옮기는 색인이다.
  const { allRows, dates, starts } = useMemo(() => {
    const allRows: Row[] = [];
    const dates: string[] = [];
    const starts: number[] = [];
    Object.entries(groupByDate(workoutPlanList)).forEach(([date, plans]) => {
      dates.push(date);
      starts.push(allRows.length);
      allRows.push({ kind: "header", date });
      plans.forEach((plan, index) =>
        allRows.push({
          kind: "plan",
          date,
          plan,
          index,
          total: plans.length,
        }),
      );
    });
    return { allRows, dates, starts };
  }, [workoutPlanList]);

  // 리스트의 시작 날짜. 기본은 최신(0), 날짜를 고르면 그 날짜부터 과거로.
  const [startDateIndex, setStartDateIndex] = useState(0);
  // 시작점이 바뀔 때 스크롤을 맨 위로 되돌리려면 리마운트가 가장 확실하다
  const [listKey, setListKey] = useState(0);

  const rows = useMemo<Row[]>(() => {
    // 잔디는 진짜 최상단일 때만 — 중간부터 볼 때 얹히면 안 된다
    if (startDateIndex === 0) return [GRASS_ROW, ...allRows];
    return allRows.slice(starts[startDateIndex] ?? 0);
  }, [allRows, starts, startDateIndex]);

  // setOptions는 매번 새 옵션 객체를 만들어 네비게이터 전체를 리렌더한다 —
  // 값이 실제로 바뀔 때만 통과시킨다
  const lastTitle = useRef<string | null>(null);
  const setTitle = useCallback(
    (title: string) => {
      if (lastTitle.current === title) return;
      lastTitle.current = title;
      navigation.setOptions({ title });
    },
    [navigation],
  );

  // onViewableItemsChanged는 리스트 생성 후 교체할 수 없다 — 핸들러 참조는 고정하고
  // 안에서 쓰는 값만 ref로 최신화한다
  const latest = useRef({ setTitle, lang });
  latest.current = { setTitle, lang };
  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      // 빠른 스크롤 중엔 셀이 잠깐 비어 viewableItems가 빈 배열로 온다 —
      // 여기서 ""로 지우면 헤더가 로고로 되돌아간다. 직전 타이틀을 유지한다.
      const top = viewableItems[0]?.item as Row | undefined;
      if (!top) return;
      if (top.kind === "grass") {
        latest.current.setTitle("");
        return;
      }
      const [year, month] = top.date.split(".");
      latest.current.setTitle(
        convertChartDate(`${year}${month}`, latest.current.lang),
      );
    },
  ).current;

  useEffect(() => {
    setTitle("");
  }, [setTitle]);

  const resetToLatest = useCallback(() => {
    setStartDateIndex(0);
    setListKey((prev) => prev + 1);
  }, []);

  // 가상화된 리스트는 아직 렌더하지 않은 구간을 스크롤로 건너뛸 수 없다 —
  // 고른 날짜를 리스트의 첫 행으로 만들어 거기서부터 과거를 보여준다.
  // 그 위(더 최신)는 데이터에서 빼야 렌더되지 않은 빈 공간이 노출되지 않는다.
  const datesRef = useRef(dates);
  datesRef.current = dates;
  useEffect(() => {
    if (!selectedDate) return;
    const index = datesRef.current.indexOf(selectedDate);
    if (index < 0) return;
    setStartDateIndex(index);
    setListKey((prev) => prev + 1);
  }, [selectedDate]);

  // 계획이 추가되면 새 기록은 맨 위에 쌓인다 — 과거를 보던 중이었어도 최신으로 되돌린다
  const planCount = useRef(workoutPlanList.length);
  useEffect(() => {
    if (workoutPlanList.length > planCount.current) resetToLatest();
    planCount.current = workoutPlanList.length;
  }, [workoutPlanList.length, resetToLatest]);

  useEffect(() => {
    if (open) resetToLatest();
  }, [open, resetToLatest]);

  const renderItem = useCallback(
    ({ item }: { item: Row }) => {
      if (item.kind === "grass") {
        return (
          <View style={styles.grass}>
            <YearGrass />
          </View>
        );
      }

      if (item.kind === "header") {
        return (
          <View style={[styles.row, styles.headerRow]}>
            <View
              style={[
                styles.dateHeader,
                { backgroundColor: themeColor.tint },
              ]}
            >
              <Text
                style={[styles.dateText, { color: themeColor.onTint }]}
              >{`🗓️  ${formatDate(item.date, lang)}`}</Text>
              {/* 점은 배경을 뚫은 구멍처럼 보여야 하므로 onTint가 아니라 background */}
              <View
                style={[styles.dot, { backgroundColor: themeColor.background }]}
              />
            </View>
          </View>
        );
      }

      // 한 그룹의 첫/마지막 행이 카드의 위아래를 맡는다 (예전엔 그룹 컨테이너가 했다)
      const isLast = item.index === item.total - 1;
      return (
        <View style={[styles.row, isLast && styles.groupBottomSpace]}>
          <View
            style={[
              { backgroundColor: themeColor.itemColor },
              item.index === 0 && styles.groupTop,
              isLast && styles.groupBottom,
            ]}
          >
            <WorkoutPlan
              item={item.plan}
              index={item.index}
              totalLength={item.total}
            />
          </View>
        </View>
      );
    },
    [themeColor, lang],
  );

  // 스크롤 중 타이틀이 바뀔 때마다 setOptions가 이 화면을 리렌더한다 —
  // 리스트에 넘기는 객체/엘리먼트가 매번 새로 만들어지면 그때마다 레이아웃을
  // 다시 잡느라 빠른 플릭 도중 화면이 통째로 비어버린다. 전부 고정해서 넘긴다.
  const listPadding = useMemo(
    () => ({ paddingTop: headerHeight }),
    [headerHeight],
  );

  const listHeader = useMemo(
    () =>
      // 날짜를 골라 과거로 온 상태에서는 위쪽에 더 최신 기록이 없다 —
      // 돌아갈 길을 리스트 맨 위에 둔다
      startDateIndex > 0 ? (
        <TouchableOpacity
          onPress={resetToLatest}
          style={[
            styles.backToLatest,
            {
              backgroundColor: themeColor.itemColor,
              borderColor: themeColor.tint,
            },
          ]}
        >
          <MaterialIcons
            name="arrow-upward"
            size={16}
            color={themeColor.tintText}
          />
          <Text style={{ color: themeColor.tintText, fontFamily: "sb-m" }}>
            {t("workout.backToLatest")}
          </Text>
        </TouchableOpacity>
      ) : null,
    [startDateIndex, resetToLatest, themeColor, t],
  );

  const listFooter = useMemo(
    () => (
      <View style={styles.footer}>
        <View style={styles.footerRow}>
          <InfoIcon name="circle-info" size={16} color={themeColor.subText} />
          <Text style={{ color: themeColor.subText }}>
            {t("workout.lastPlan")}
          </Text>
        </View>
      </View>
    ),
    [themeColor, t],
  );

  if (workoutPlanList.length === 0) {
    return (
      <View style={{ flex: 1, position: "relative" }}>
        <EmptyList />
        <TouchableOpacity
          onPress={() => {
            router.push("/(modals)/calculate");
          }}
          style={[
            styles.calculateButton,
            {
              backgroundColor: themeColor.background,
              borderColor: themeColor.tint,
            },
          ]}
        >
          <MaterialIcons name="calculate" size={36} color={themeColor.tintText} />
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View
      style={{
        flex: 1,
        position: "relative",
        backgroundColor: themeColor.background,
      }}
    >
      {/* FlatList는 스크롤하면서 셀을 마운트/언마운트한다 — 계획 카드 하나가
          네이티브 뷰 수십 개라 느린 기기에서는 플릭을 못 따라가고 화면이 빈다.
          FlashList는 셀을 재활용해 프롭만 갈아끼우므로 그 비용이 사라진다. */}
      <FlashList
        key={listKey}
        data={rows}
        // 셀이 재사용되므로 renderItem 참조만으로는 테마·언어 변경이 반영되지 않는다
        extraData={renderItem}
        renderItem={renderItem}
        keyExtractor={(item) =>
          item.kind === "grass"
            ? "grass"
            : item.kind === "header"
              ? `h${item.date}`
              : `p${item.plan.id}`
        }
        // 종류마다 재활용 풀을 나눈다 — 안 나누면 날짜 헤더 자리에 계획 셀이
        // 들어가면서 잠깐 헤더만 남은 것처럼 보인다
        getItemType={getItemType}
        // 화면 밖으로 미리 그려둘 거리(px). 재활용이라 넉넉히 잡아도 싸다.
        drawDistance={DRAW_DISTANCE}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={VIEWABILITY_CONFIG}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={listPadding}
        ListHeaderComponent={listHeader}
        ListFooterComponent={listFooter}
      />
      <TouchableOpacity
        onPress={() => {
          router.push("/(modals)/calculate");
        }}
        style={[
          styles.calculateButton,
          {
            backgroundColor: themeColor.background,
            borderColor: themeColor.tint,
          },
        ]}
      >
        <MaterialIcons name="calculate" size={36} color={themeColor.tintText} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  grass: {
    // 아래 행과 같은 좌우 여백. 날짜 헤더가 paddingTop 24를 가지므로 위만 준다.
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  footer: {
    height: 240,
    alignItems: "center",
    paddingTop: 48,
  },
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  row: {
    paddingHorizontal: 20,
  },
  // 그룹 사이 간격은 셀 루트의 padding으로 준다 — margin은 셀 프레임 밖이라
  // 가상화 리스트가 재는 행 높이에서 빠질 수 있다
  headerRow: {
    paddingTop: 24,
  },
  groupTop: {
    paddingTop: 2,
  },
  groupBottom: {
    borderBottomRightRadius: 12,
    borderBottomLeftRadius: 12,
    overflow: "hidden",
  },
  // 그룹 사이 간격 — 날짜 헤더의 paddingTop 24와 합쳐 예전 paddingVertical: 24와 같다
  groupBottomSpace: {
    paddingBottom: 24,
  },
  backToLatest: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "center",
    gap: 6,
    marginTop: 24,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderWidth: 1.5,
    borderRadius: 50,
  },

  calculateButton: {
    width: 56,
    height: 56,
    opacity: 0.8,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderRadius: 50,
    position: "absolute",
    bottom: 100,
    right: 20,
    zIndex: 1000,
  },
  dateHeader: {
    borderTopRightRadius: 12,
    borderTopLeftRadius: 12,
    paddingTop: 2,
    paddingBottom: 4,
    paddingHorizontal: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dateText: {
    fontSize: 14,
    fontFamily: "sb-l",
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 50,
    marginTop: 4,
  },
});
