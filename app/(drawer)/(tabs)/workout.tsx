import { useCallback, useEffect, useRef } from "react";
// component
import { WorkoutPlan } from "@/components/workout-plan/workout-plan";
import { Text, View } from "@/components/Themed";
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { EmptyList } from "@/components/workout-plan/empty-list";
import { RefView } from "@/components/RefView";
import { FlashList } from "@shopify/flash-list";
// zustand
import { userWorkoutPlanStore } from "@/hooks/use-workout-plan-store";
import { useSelectDateStore } from "@/hooks/use-select-date-store";
// lib
import { formatDate, groupByDate } from "@/lib/function";
// expo
import { useNavigation, useRouter } from "expo-router";

// navigation
import { useHeaderHeight } from "@react-navigation/elements";
// hooks
import useCurrneThemeColor from "@/hooks/use-current-theme-color";
// icon
import InfoIcon from "@expo/vector-icons/FontAwesome6";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

export default function TabOneScreen() {
  const { workoutPlanList, onResetPlanList } = userWorkoutPlanStore();

  const { date: selectedDate } = useSelectDateStore();

  const sortWorkList = groupByDate(workoutPlanList);
  const headerHeight = useHeaderHeight();
  const themeColor = useCurrneThemeColor();
  const navigation = useNavigation();
  const router = useRouter();

  const itemRef = useRef(new Map());

  const scrollRef = useRef<ScrollView | null>(null);
  const scrollY = useRef(0);

  const measureView = (ref: any, date: string) => {
    ref?.measureLayout(
      scrollRef?.current,
      (x: number, y: number, width: number, height: number) => {
        if (scrollY.current === 0) {
          const splitData = date.split(".");
          navigation.setOptions({
            title: `🔥오늘도 화이팅!`,
          });
        }
        if (y - scrollY.current < headerHeight - 30) {
          const splitData = date.split(".");
          navigation.setOptions({
            title: `${splitData[0]}년  ${splitData[1]}월`,
          });
        }
      }
    );
  };

  const scrollToSelectedDate = useCallback(() => {
    if (!selectedDate) return;
    const targetRef = itemRef.current.get(selectedDate);
    if (targetRef) {
      targetRef.measureLayout(
        scrollRef.current,
        (x: number, y: number) => {
          scrollRef.current?.scrollTo({
            y: y - headerHeight - 20,
            animated: true,
          });
        },
        (error: Error) => console.log("Scroll error:", error)
      );
    }
  }, [selectedDate, headerHeight]);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    scrollY.current = offsetY;
    itemRef.current.forEach((ref, date: string) => {
      measureView(ref, date);
    });
  };

  useEffect(() => {
    setTimeout(scrollToSelectedDate, 200);
  }, [selectedDate, scrollToSelectedDate]);

  if (workoutPlanList.length === 0) {
    return <EmptyList />;
  }

  return (
    <View style={{ flex: 1, position: "relative" }}>
      <ScrollView
        ref={scrollRef}
        onScroll={handleScroll}
        scrollEventThrottle={16}
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
        <FlashList
          data={Object.entries(sortWorkList)}
          estimatedItemSize={50}
          keyExtractor={(item) => item[0]}
          renderItem={({ item, index }) => {
            return (
              <View style={styles.list} key={index}>
                <RefView
                  ref={(ref) => {
                    itemRef.current.set(item[0], ref);
                    if (ref && index === 0) {
                      measureView(ref, item[0]);
                    }
                  }}
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
                      style={[
                        styles.dateText,
                        { color: themeColor.background },
                      ]}
                    >{`🗓️  ${formatDate(item[0])}`}</Text>

                    <View
                      style={[
                        styles.dot,
                        {
                          backgroundColor: themeColor.background,
                        },
                      ]}
                    />
                  </View>
                </RefView>
                <View
                  style={[
                    styles.workoutList,
                    { backgroundColor: themeColor.itemColor },
                  ]}
                >
                  {item[1].map((data, index) => (
                    <WorkoutPlan
                      key={data.id}
                      item={data}
                      index={index}
                      totalLength={item[1].length}
                    />
                  ))}
                </View>
              </View>
            );
          }}
        />
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
        onPress={() => router.push("/(modals)/calculate")}
        style={[
          styles.calculateButton,
          {
            backgroundColor: themeColor.background,
            borderColor: themeColor.subText,
          },
        ]}
      >
        <MaterialIcons name="calculate" size={40} color={themeColor.tint} />
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
    width: 64,
    height: 64,
    opacity: 0.8,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderRadius: 50,
    position: "absolute",
    bottom: 20,
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
