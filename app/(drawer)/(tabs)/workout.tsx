import { useCallback, useEffect, useMemo, useRef, useState } from "react";
// component
import { StyleSheet, ViewToken } from "react-native";
import { Text, View } from "@/components/themed";
import { FlashList, FlashListRef } from "@shopify/flash-list";
import { EmptyList } from "@/components/workout-plan/empty-list";
import {
  DateHeaderRow,
  GrassRow,
  PlanRow,
} from "@/components/workout-plan/plan-list-row";
import { ScrollTopButton } from "@/components/workout-plan/scroll-top-button";
import {
  CircleButton,
  circleButtonSmall,
  FAB_TAB_GAP,
} from "@/components/circle-button";
// zustand
import { useWorkoutPlanStore } from "@/hooks/use-workout-plan-store";
import { useSelectDateStore } from "@/hooks/use-select-date-store";
import { useWorkoutScrollStore } from "@/hooks/use-workout-scroll-store";
import { useIsModalOpenStore } from "@/hooks/use-is-modal-open-store";
// hooks
import {
  getRowKey,
  getRowType,
  GRASS_ROW,
  Row,
  usePlanRows,
} from "@/hooks/use-plan-rows";
import useCurrentThemeColor from "@/hooks/use-current-theme-color";
import { useT } from "@/hooks/use-t";
import { useLanguage } from "@/hooks/use-user-store";
// lib
import { convertChartDate } from "@/lib/date";
// expo
import { useRouter } from "expo-router";
// navigation
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
// icon
import InfoIcon from "@expo/vector-icons/FontAwesome6";

// 1px이라도 보이면 viewable — 잔디가 완전히 지나가야 날짜 타이틀로 바뀐다.
// minimumViewTime을 빼면 FlashList가 250ms를 기본으로 넣는데(RN 기본은 0), 그러면
// 보고가 250ms짜리 타이머로 밀리고 타이머가 도는 시점에 "아직도 보이는" 행만
// 남기고 걸러낸다 — 빠르게 스크롤하는 동안엔 전부 걸러져서 손을 떼야 날짜가 바뀐다.
// 0으로 두면 반대로 매 스크롤 프레임마다 O(n²) 필터가 동기로 돌아 프레임 예산을
// 깎으므로(라이브러리가 명시적으로 경고하는 값), 체감 지연이 없는 선까지만 낮춘다.
const VIEWABILITY_CONFIG = {
  itemVisiblePercentThreshold: 0,
  minimumViewTime: 50,
};

// 화면 밖으로 미리 그려둘 거리(px) — 한 화면 반쯤. 버퍼는 살아있는 셀 수를 늘려
// 프레임당 viewability·레이아웃 비용과 메모리를 같이 키우므로, 플릭이 앞지른다고
// 계속 올릴 값이 아니다. 남는 빈 화면은 셀 하나의 렌더 비용에서 줄인다.
const DRAW_DISTANCE = 1500;

export default function TabOneScreen() {
  // 전체 구독이면 세트 완료 토글 같은 무관한 변경에도 이 화면이 통째로 리렌더된다
  const workoutPlanList = useWorkoutPlanStore((state) => state.workoutPlanList);
  const { date: selectedDate } = useSelectDateStore();
  const setWorkoutTitle = useWorkoutScrollStore(
    (state) => state.setWorkoutTitle,
  );
  const setScrolled = useWorkoutScrollStore((state) => state.setScrolled);
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const themeColor = useCurrentThemeColor();
  const t = useT();
  const lang = useLanguage();
  const { open } = useIsModalOpenStore();

  const router = useRouter();

  const { allRows, dates, starts } = usePlanRows(workoutPlanList);

  // 리스트의 시작 날짜. 기본은 최신(0), 날짜를 고르면 그 날짜부터 과거로.
  const [startDateIndex, setStartDateIndex] = useState(0);
  // 시작점이 바뀔 때 스크롤을 맨 위로 되돌리려면 리마운트가 가장 확실하다
  const [listKey, setListKey] = useState(0);

  const rows = useMemo<Row[]>(() => {
    // 잔디는 진짜 최상단일 때만 — 중간부터 볼 때 얹히면 안 된다
    if (startDateIndex === 0) return [GRASS_ROW, ...allRows];
    return allRows.slice(starts[startDateIndex] ?? 0);
  }, [allRows, starts, startDateIndex]);

  const listRef = useRef<FlashListRef<Row>>(null);

  // 맨 위로 버튼은 최상단이 아닐 때만 뜬다. 스크롤 이벤트를 따로 받지 않고 이미
  // 도는 viewability 결과를 쓴다 — 스크롤 중 JS 스레드에 일을 더 얹지 않는다.
  // 노출 여부는 화면 상태가 아니라 스토어에 둔다: 화면 상태로 두면 경계를 넘을
  // 때마다 이 화면 전체가 리렌더돼 타이틀을 스토어로 뺀 이유와 같은 비용이 든다.
  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      // 빠른 스크롤 중엔 셀이 잠깐 비어 viewableItems가 빈 배열로 온다 —
      // 여기서 ""로 지우면 헤더가 로고로 되돌아간다. 직전 타이틀을 유지한다.
      const top = viewableItems[0];
      if (!top) return;

      setScrolled((top.index ?? 0) > 0);

      const row = top.item as Row | undefined;
      if (!row) return;
      if (row.kind === "grass") {
        setWorkoutTitle("");
        return;
      }
      const [year, month] = row.date.split(".");
      setWorkoutTitle(convertChartDate(`${year}${month}`, lang));
    },
    [setScrolled, setWorkoutTitle, lang],
  );

  useEffect(() => {
    setWorkoutTitle("");
  }, [setWorkoutTitle]);

  const scrollToTop = useCallback(() => {
    // scrollToTop/scrollToOffset은 네이티브 scrollTo를 그냥 부른다 — 스크롤 위치만
    // 튀고 셀은 아직 옛 위치에 있어서 "내용이 사라졌다 다시 나오는" 것처럼 보인다.
    // scrollToIndex는 렌더 윈도를 목표까지 단계적으로 옮겨 도착 지점을 먼저 그려준다.
    // 다만 정확히 0에서 멈추지 않으므로(첫 행 오프셋만큼 남는다) 남은 거리는 직접
    // 스크롤한다 — 이미 그려둔 구간이라 애니메이션을 켜도 빈 화면이 없다.
    // animated: true를 scrollToIndex에 주면 안 된다: 내부에서 scrollTo를 연달아
    // 두 번 불러 마지막 애니메이션이 취소된다.
    listRef.current
      ?.scrollToIndex({ index: 0, animated: false })
      .then(() =>
        listRef.current?.scrollToOffset({ offset: 0, animated: true }),
      );
  }, []);

  // 리마운트하면 리스트가 통째로 사라졌다 다시 그려져 깜빡인다 — 1만 행이면 더 심하다.
  // 데이터만 최신 기준으로 되돌리면 보고 있던 행 위로 더 최신 기록이 붙고,
  // 거기서 맨 위까지 스크롤해 "올라가는" 것처럼 보이게 한다.
  // nonce는 startDateIndex가 이미 0이어도 스크롤이 돌게 하려고 둔다.
  const [scrollTopNonce, setScrollTopNonce] = useState(0);
  const resetToLatest = useCallback(() => {
    setStartDateIndex(0);
    setScrollTopNonce((prev) => prev + 1);
  }, []);

  useEffect(() => {
    if (scrollTopNonce === 0) return;
    // 앞에 붙은 수천 행은 아직 추정 높이다 — 같은 커밋에서 바로 스크롤하면
    // 실측 높이가 확정될 때 들어오는 maintainVisibleContentPosition 보정과 싸워
    // 최상단이 아닌 중간에 멈춘다. 레이아웃이 한 번 돈 뒤에 스크롤한다.
    const frame = requestAnimationFrame(scrollToTop);
    return () => cancelAnimationFrame(frame);
  }, [scrollTopNonce, scrollToTop]);

  // 가상화된 리스트는 아직 렌더하지 않은 구간을 스크롤로 건너뛸 수 없다 —
  // 고른 날짜를 리스트의 첫 행으로 만들어 거기서부터 과거를 보여준다.
  // 그 위(더 최신)는 데이터에서 빼야 렌더되지 않은 빈 공간이 노출되지 않는다.
  const datesRef = useRef(dates);
  datesRef.current = dates;
  useEffect(() => {
    if (!selectedDate) return;
    const index = datesRef.current.indexOf(selectedDate);
    if (index < 0) return;
    // 여기만 리마운트를 쓴다 — 데이터가 완전히 다른 구간으로 갈리므로 스크롤
    // 오프셋을 그대로 두면 엉뚱한 위치에서 시작한다
    setStartDateIndex(index);
    setListKey((prev) => prev + 1);
    // 리마운트로 스크롤이 0으로 돌아가지만 viewability는 그다음 프레임에나 온다
    setScrolled(false);
  }, [selectedDate, setScrolled]);

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
      if (item.kind === "grass") return <GrassRow />;
      if (item.kind === "header") {
        return (
          <DateHeaderRow date={item.date} themeColor={themeColor} lang={lang} />
        );
      }
      return <PlanRow item={item} themeColor={themeColor} />;
    },
    [themeColor, lang],
  );

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
        <View style={styles.backToLatest}>
          {/* 하단 "맨 위로"(⇈)와 겹치지 않게 방향 화살표를 쓰지 않는다 —
              이 버튼은 스크롤이 아니라 보고 있는 기간을 최신으로 되돌린다 */}
          <CircleButton
            onPress={resetToLatest}
            label={t("workout.backToLatest")}
            icon="update"
            iconSize={22}
            style={circleButtonSmall}
          />
        </View>
      ) : null,
    [startDateIndex, resetToLatest, t],
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

  const openCalculate = () => router.push("/(modals)/calculate");

  const calculateButton = (
    <CircleButton
      onPress={openCalculate}
      label={t("workout.openCalculator")}
      icon="calculate"
      style={[styles.calculateButton, { bottom: tabBarHeight + FAB_TAB_GAP }]}
    />
  );

  if (workoutPlanList.length === 0) {
    return (
      <View style={{ flex: 1, position: "relative" }}>
        <EmptyList />
        {calculateButton}
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
        ref={listRef}
        data={rows}
        // 셀이 재사용되므로 renderItem 참조만으로는 테마·언어 변경이 반영되지 않는다
        extraData={renderItem}
        renderItem={renderItem}
        keyExtractor={getRowKey}
        // 종류마다 재활용 풀을 나눈다 — 안 나누면 날짜 헤더 자리에 계획 셀이
        // 들어가면서 잠깐 헤더만 남은 것처럼 보인다
        getItemType={getRowType}
        drawDistance={DRAW_DISTANCE}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={VIEWABILITY_CONFIG}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={listPadding}
        ListHeaderComponent={listHeader}
        ListFooterComponent={listFooter}
      />
      <ScrollTopButton onPress={scrollToTop} />
      {calculateButton}
    </View>
  );
}

const styles = StyleSheet.create({
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
  backToLatest: {
    alignItems: "center",
    marginTop: 24,
  },
  calculateButton: {
    position: "absolute",
    right: 20,
    zIndex: 1000,
  },
});
