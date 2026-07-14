import { useLayoutEffect, useState } from "react";
// component
import { StyleSheet } from "react-native";
import { Text, View } from "@/components/themed";
import { WorkoutPlan } from "@/components/workout-plan/workout-plan";
import { FlashList } from "@shopify/flash-list";
// hook
import useCurrentThemeColor from "@/hooks/use-current-theme-color";
import { useWorkoutPlanStore } from "@/hooks/use-workout-plan-store";
// lib
import { formatDate, groupByDate, setColor } from "@/lib/function";
// expo
import { useNavigation } from "expo-router";

export default function Search() {
  const { workoutPlanList } = useWorkoutPlanStore();
  const navigation = useNavigation();
  const [inputValue, setInputValue] = useState("");
  const themeColor = useCurrentThemeColor();

  const filterWorkoutList = (value: string) => {
    const result = workoutPlanList.filter((workout) => {
      let convertValue = value;

      if (value == "등") convertValue = "back";
      if (value == "어깨") convertValue = "shoulder";
      if (value == "하체") convertValue = "leg";
      if (value == "팔") convertValue = "arm";
      if (value == "가슴") convertValue = "chest";

      return (
        workout.equipment.includes(convertValue) ||
        workout.type.includes(convertValue) ||
        workout.workout.includes(convertValue) ||
        workout.content.includes(convertValue) ||
        workout.title.includes(convertValue) ||
        workout.weight.includes(convertValue)
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
        cancelButtonText: "취소",

        onChangeText: (e: { nativeEvent: { text: string } }) => {
          setInputValue(e.nativeEvent.text);
        },
        hideWhenScrolling: false,
      },
    });
  }, [navigation]);

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
                ? `🔍  키워드를 입력해주세요.${"\n"}예:) 바벨, 등, 프레스`
                : "검색 결과가 없습니다."}
            </Text>
          </View>
        }
        ListFooterComponent={
          searchResult.length > 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, { color: themeColor.subText }]}>
                마지막 운동계획입니다.
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
