import { useCallback, useEffect, useRef } from "react";
// component
import { WorkoutPlan } from "@/components/workout-plan/workout-plan";
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
import { formatDate, groupByDate } from "@/lib/function";
// expo
import { useNavigation, useRouter } from "expo-router";

// navigation
import { useHeaderHeight } from "@react-navigation/elements";
// hooks
import useCurrentThemeColor from "@/hooks/use-current-theme-color";
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

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    if (offsetY <= 0) {
      navigation.setOptions({ title: "🔥오늘도 화이팅!" });
      return;
    }
    // 헤더 밑으로 지나간 마지막 날짜 그룹이 현재 타이틀
    let currentDate: string | undefined;
    for (const date of Object.keys(sortWorkList)) {
      const y = sectionOffsets.current.get(date);
      if (y != null && y < offsetY - 30) {
        currentDate = date;
      }
    }
    if (currentDate) {
      const splitData = currentDate.split(".");
      navigation.setOptions({
        title: `${splitData[0]}년  ${splitData[1]}월`,
      });
    }
  };

  useEffect(() => {
    navigation.setOptions({ title: "🔥오늘도 화이팅!" });
  }, [navigation]);

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
          <MaterialIcons name="calculate" size={36} color={themeColor.tint} />
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
                style={[styles.dateText, { color: themeColor.background }]}
              >{`🗓️  ${formatDate(date)}`}</Text>

              <View
                style={[
                  styles.dot,
                  {
                    backgroundColor: themeColor.background,
                  },
                ]}
              />
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
            height: 200,
            alignItems: "center",
            paddingTop: 64,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <InfoIcon name="circle-info" size={16} color={themeColor.subText} />
            <Text style={{ color: themeColor.subText }}>
              마지막 운동계획입니다.
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
        <MaterialIcons name="calculate" size={36} color={themeColor.tint} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  date: {
    fontSize: 14,
    fontFamily: "sb-l",
    borderTopRightRadius: 12,
    borderTopLeftRadius: 12,
    paddingTop: 2,
    paddingBottom: 4,
    paddingHorizontal: 12,
  },
  workoutList: {
    borderBottomRightRadius: 12,
    borderBottomLeftRadius: 12,
    paddingTop: 2,

    overflow: "hidden",
  },

  list: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    flex: 1,
  },

  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: "80%",
  },
  empty: {
    width: 100,
    height: 150,
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
  dot: {
    width: 12,
    height: 12,
    borderRadius: 50,
    marginTop: 4,
  },
});
