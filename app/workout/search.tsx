import { useLayoutEffect, useState } from "react";
// component
import { StyleSheet } from "react-native";
import { Text, View } from "@/components/themed";
import { WorkoutPlan } from "@/components/workout-plan/workout-plan";
import { FlashList } from "@shopify/flash-list";
// hook
import useCurrentThemeColor from "@/hooks/use-current-theme-color";
import { useT } from "@/hooks/use-t";
import { useWorkoutPlanStore } from "@/hooks/use-workout-plan-store";
import { useLanguage } from "@/hooks/use-user-store";
import { tEquipment, tWorkout } from "@/lib/i18n";
// lib
import { formatDate, groupByDate, setColor } from "@/lib/function";
// expo
import { useNavigation } from "expo-router";

export default function Search() {
  const { workoutPlanList } = useWorkoutPlanStore();
  const navigation = useNavigation();
  const [inputValue, setInputValue] = useState("");
  const themeColor = useCurrentThemeColor();
  const t = useT();
  const lang = useLanguage();

  // 부위는 한/영 어느 쪽으로 입력해도 type 키로 변환한다
  const PART_KEYWORDS: Record<string, string> = {
    등: "back",
    back: "back",
    어깨: "shoulder",
    shoulder: "shoulder",
    shoulders: "shoulder",
    하체: "leg",
    leg: "leg",
    legs: "leg",
    팔: "arm",
    arm: "arm",
    arms: "arm",
    가슴: "chest",
    chest: "chest",
  };

  const filterWorkoutList = (value: string) => {
    const convertValue = PART_KEYWORDS[value.trim().toLowerCase()] ?? value;
    const lower = convertValue.toLowerCase();

    const result = workoutPlanList.filter((workout) => {
      return (
        workout.equipment.includes(convertValue) ||
        workout.type.includes(convertValue) ||
        workout.workout.includes(convertValue) ||
        workout.content.includes(convertValue) ||
        workout.title.includes(convertValue) ||
        workout.weight.includes(convertValue) ||
        // 표시 라벨(영어)로도 매칭 — 영어 사용자가 "Bench"로 찾을 수 있게
        tWorkout(workout.workout, lang).toLowerCase().includes(lower) ||
        tEquipment(workout.equipment, lang).toLowerCase().includes(lower)
      );
    });
    return groupByDate(result);
  };
  useLayoutEffect(() => {
    navigation.setOptions({
      headerSearchBarOptions: {
        visible: true,
        placeholder: "Search",
        autoFocus: true,
        tintColor: themeColor.tint,
        cancelButtonText: t("search.cancel"),

        onChangeText: (e: { nativeEvent: { text: string } }) => {
          setInputValue(e.nativeEvent.text);
        },
        hideWhenScrolling: false,
      },
    });
  }, [navigation, t, themeColor.tint]);

  const searchResult = inputValue
    ? Object.entries(filterWorkoutList(inputValue))
    : [];

  return (
    <View
      style={[
        styles.container,
        setColor(themeColor.background, "backgroundColor"),
      ]}
    >
      <FlashList
        data={searchResult}
        estimatedItemSize={200}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item[0]}
        keyboardDismissMode="on-drag"
        contentContainerStyle={{ paddingTop: 110 }}
        renderItem={({ item }) => {
          return (
            <View style={styles.list}>
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
                >{`🗓️  ${formatDate(item[0], lang)}`}</Text>
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
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: themeColor.subText }]}>
              {!inputValue
                ? t("search.hint")
                : t("search.noResult")}
            </Text>
          </View>
        }
        ListFooterComponent={
          searchResult.length > 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, { color: themeColor.subText }]}>
                {t("workout.lastPlan")}
              </Text>
            </View>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  emptyContainer: {
    alignItems: "center",
    paddingTop: 80,
    paddingBottom: 220,
  },
  emptyText: {
    textAlign: "center",
    lineHeight: 24,
    fontSize: 16,
  },
  workoutList: {
    borderBottomRightRadius: 12,
    borderBottomLeftRadius: 12,
    paddingTop: 2,
    overflow: "hidden",
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
  list: {
    paddingHorizontal: 20,
    paddingVertical: 24,
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
