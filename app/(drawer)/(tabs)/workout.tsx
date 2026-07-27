import { useCallback, useEffect, useRef } from "react";
// component
import { WorkoutPlan } from "@/components/workout-plan/workout-plan";
import { YearGrass } from "@/components/grass";
import { Text, View } from "@/components/themed";
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { EmptyList } from "@/components/workout-plan/empty-list";
// zustand
import { useWorkoutPlanStore } from "@/hooks/use-workout-plan-store";
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

export default function TabOneScreen() {
  const { workoutPlanList } = useWorkoutPlanStore();
  const { date: selectedDate } = useSelectDateStore();
  const sortWorkList = groupByDate(workoutPlanList);
  const headerHeight = useHeaderHeight();
  const themeColor = useCurrentThemeColor();
  const t = useT();
  const lang = useLanguage();
  const navigation = useNavigation();
  const { open } = useIsModalOpenStore();

  const router = useRouter();
  // 날짜 그룹의 y 오프셋을 onLayout에서 한 번만 기록해두고, 스크롤 시에는
  // 숫자 비교만 한다 (매 프레임 네이티브 measure 호출 제거)
  const sectionOffsets = useRef(new Map<string, number>());
  const scrollRef = useRef<ScrollView | null>(null);

  const scrollToSelectedDate = useCallback(() => {
    if (!selectedDate) return;
    const y = sectionOffsets.current.get(selectedDate);
    if (y != null) {
      scrollRef.current?.scrollTo({ y: y + 4, animated: true });
    }
  }, [selectedDate]);

  // setOptions는 매번 새 옵션 객체를 만들어 네비게이터 전체를 리렌더한다 —
  // 스크롤 프레임마다 부르지 않도록 값이 실제로 바뀔 때만 통과시킨다
  const lastTitle = useRef<string | null>(null);
  const setTitle = useCallback(
    (title: string) => {
      if (lastTitle.current === title) return;
      lastTitle.current = title;
      navigation.setOptions({ title });
    },
    [navigation],
  );

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    // 헤더 밑으로 지나간 마지막 날짜 그룹이 현재 타이틀
    let currentDate: string | undefined;
    for (const date of Object.keys(sortWorkList)) {
      const y = sectionOffsets.current.get(date);
      if (y != null && y < offsetY - 30) {
        currentDate = date;
      }
    }
    // 아직 첫 날짜 그룹 위(잔디 영역)를 보고 있는 중이면 타이틀 자리에 로고
    if (!currentDate) {
      setTitle("");
      return;
    }
    const splitData = currentDate.split(".");
    setTitle(convertChartDate(`${splitData[0]}${splitData[1]}`, lang));
  };

  useEffect(() => {
    setTitle("");
  }, [setTitle]);

  useEffect(() => {
    setTimeout(scrollToSelectedDate, 200);
  }, [selectedDate, scrollToSelectedDate]);

  useEffect(() => {
    if (open) {
      scrollRef.current?.scrollTo({
        y: 0,
      });
    }
  }, [open]);

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
    <View style={{ flex: 1, position: "relative" }}>
      <ScrollView
        ref={scrollRef}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        style={[
          styles.container,
          {
            paddingTop: headerHeight,
            backgroundColor: themeColor.background,
          },
        ]}
        contentContainerStyle={{
          position: "relative",
        }}
      >
        <View style={styles.grass}>
          <YearGrass />
        </View>
        {Object.entries(sortWorkList).map(([date, plans]) => (
          <View
            style={styles.list}
            key={date}
            onLayout={(e) =>
              sectionOffsets.current.set(date, e.nativeEvent.layout.y)
            }
          >
            <View
              style={[
                styles.planContainer,
                {
                  backgroundColor: themeColor.tint,
                },
              ]}
            >
              <Text
                style={[styles.dateText, { color: themeColor.onTint }]}
              >{`🗓️  ${formatDate(date, lang)}`}</Text>
            </View>
            <View
              style={[
                styles.workoutList,
                { backgroundColor: themeColor.itemColor },
              ]}
            >
              {plans.map((data, idx) => (
                <WorkoutPlan
                  key={data.id}
                  item={data}
                  index={idx}
                  totalLength={plans.length}
                />
              ))}
            </View>
          </View>
        ))}
        <View
          style={{
            height: 240,
            alignItems: "center",
            paddingTop: 48,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <InfoIcon name="circle-info" size={16} color={themeColor.subText} />
            <Text style={{ color: themeColor.subText }}>
              {t("workout.lastPlan")}
            </Text>
          </View>
        </View>
      </ScrollView>
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
  container: {
    flex: 1,
  },
  workoutList: {
    borderBottomRightRadius: 12,
    borderBottomLeftRadius: 12,
    paddingTop: 2,

    overflow: "hidden",
  },

  grass: {
    // 아래 날짜 그룹(list)과 같은 좌우 여백. 세로는 list의 paddingVertical과 합쳐
    // 24 간격이 되도록 위만 준다.
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  list: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    flex: 1,
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
  planContainer: {
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
});
