import {
  ComponentProps,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
// component
import { WorkoutPlan } from "@/components/workout-plan/workout-plan";
import { YearGrass } from "@/components/grass";
import { Text, View } from "@/components/themed";
import {
  StyleProp,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
  ViewToken,
} from "react-native";
import { FlashList, FlashListRef } from "@shopify/flash-list";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { EmptyList } from "@/components/workout-plan/empty-list";
// zustand
import {
  useWorkoutPlanStore,
  WorkoutPlanTypes,
} from "@/hooks/use-workout-plan-store";
import { useSelectDateStore } from "@/hooks/use-select-date-store";
import { useWorkoutScrollStore } from "@/hooks/use-workout-scroll-store";
// lib
import { convertChartDate, formatDate, groupByDate } from "@/lib/function";
import { useLanguage } from "@/hooks/use-user-store";
// expo
import { useRouter } from "expo-router";

// navigation
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
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

// 재활용 풀을 "구조가 같은 것끼리" 나눈다. 전부 "plan" 하나로 두면 세트 5개짜리
// 셀을 세트 1개짜리로 재활용할 때 React가 SetListItem 4개(=네이티브 뷰 수십 개)를
// 언마운트했다 다시 마운트한다. 플릭 중엔 이게 매 프레임 반복돼 렌더가 스크롤을
// 못 따라간다. 다만 세트 수를 그대로 키로 쓰면 풀이 사용자 데이터만큼 쪼개져
// 재활용이 아예 안 되므로 버킷으로 묶어 종류 수를 상수로 고정한다.
const SET_COUNT_BUCKETS = 3;
const getItemType = (item: Row) =>
  item.kind === "plan"
    ? `plan${Math.min(item.plan.setWithCount?.length ?? 0, SET_COUNT_BUCKETS)}`
    : item.kind;

// 떠 있는 원형 버튼. 크기는 "맨 위로"를 가로 중앙에 맞출 때(marginLeft) 쓰므로
// 한곳에서 계산한다.
// 숏츠 탭의 촬영 버튼(shorts.tsx의 addVideo)과 크기를 맞춘다
const FAB_SIZE = 50;
const FAB_SIZE_SMALL = 36;
// 탭바 위로 띄우는 간격 — 숏츠 탭의 촬영 버튼과 같은 값을 쓴다(shorts.tsx).
// 기기마다 탭바 높이(+홈 인디케이터)가 달라 고정값을 쓰면 위치가 어긋난다.
const FAB_TAB_GAP = 15;
const FAB_GAP = 8;

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
              style={[styles.dateHeader, { backgroundColor: themeColor.tint }]}
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
            style={styles.circleButtonSmall}
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

  if (workoutPlanList.length === 0) {
    return (
      <View style={{ flex: 1, position: "relative" }}>
        <EmptyList />
        <CircleButton
          onPress={openCalculate}
          label={t("workout.openCalculator")}
          icon="calculate"
          style={[
            styles.calculateButton,
            { bottom: tabBarHeight + FAB_TAB_GAP },
          ]}
        />
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
      <CircleButton
        onPress={openCalculate}
        label={t("workout.openCalculator")}
        icon="calculate"
        style={[styles.calculateButton, { bottom: tabBarHeight + FAB_TAB_GAP }]}
      />
    </View>
  );
}

interface CircleButtonProps {
  onPress: () => void;
  // 전부 아이콘만 있는 버튼이라 읽어줄 이름을 따로 준다
  label: string;
  icon: ComponentProps<typeof MaterialIcons>["name"];
  iconSize?: number;
  style?: StyleProp<ViewStyle>;
}

const CircleButton = ({
  onPress,
  label,
  icon,
  iconSize = 30,
  style,
}: CircleButtonProps) => {
  const themeColor = useCurrentThemeColor();

  return (
    <TouchableOpacity
      onPress={onPress}
      accessibilityLabel={label}
      style={[
        styles.circleButton,
        style,
        {
          backgroundColor: themeColor.background,
          borderColor: themeColor.tint,
        },
      ]}
    >
      <MaterialIcons name={icon} size={iconSize} color={themeColor.tintText} />
    </TouchableOpacity>
  );
};

// 스크롤 여부 구독을 이 버튼에 가둔다 — 화면 상태로 두면 최상단 경계를 넘나들
// 때마다 리스트를 든 화면 전체가 리렌더된다
const ScrollTopButton = ({ onPress }: { onPress: () => void }) => {
  const scrolled = useWorkoutScrollStore((state) => state.scrolled);
  const headerHeight = useHeaderHeight();
  const t = useT();

  if (!scrolled) return null;

  return (
    <Animated.View
      entering={FadeIn.duration(220)}
      exiting={FadeOut.duration(160)}
      style={[styles.scrollTopButton, { top: headerHeight + FAB_GAP }]}
    >
      <CircleButton
        onPress={onPress}
        label={t("workout.scrollToTop")}
        icon="keyboard-double-arrow-up"
        iconSize={26}
        style={[styles.circleButtonSmall, { borderWidth: 0 }]}
      />
    </Animated.View>
  );
};

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
    alignItems: "center",
    marginTop: 24,
  },

  circleButton: {
    width: FAB_SIZE,
    height: FAB_SIZE,
    opacity: 0.8,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderRadius: 50,
  },
  // 리스트 안에 들어가는 버튼은 떠 있는 FAB보다 작게
  circleButtonSmall: {
    width: FAB_SIZE_SMALL,
    height: FAB_SIZE_SMALL,
  },
  calculateButton: {
    position: "absolute",
    right: 20,
    zIndex: 1000,
  },
  // 헤더 바로 아래 가로 중앙 — top은 헤더 높이라 런타임에 넣는다.
  // left:0/right:0으로 펼치면 투명한 띠가 리스트 터치를 먹으므로 버튼 폭만 잡는다.
  // fade는 Animated 래퍼가 맡는다.
  scrollTopButton: {
    position: "absolute",
    left: "50%",
    marginLeft: -FAB_SIZE_SMALL / 2,
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
