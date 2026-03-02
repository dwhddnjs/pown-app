import { useLayoutEffect, useState } from "react"
// component
import { ScrollView, StyleSheet, useColorScheme } from "react-native"
import { Text, View } from "@/components/Themed"
import { WorkoutPlan } from "@/components/workout-plan/workout-plan"
import { FlashList } from "@shopify/flash-list"
// hook
import useCurrentThemeColor from "@/hooks/use-current-theme-color"
import { usePlanStore } from "@/hooks/use-plan-store"
import { userWorkoutPlanStore } from "@/hooks/use-workout-plan-store"
// lib
import { formatDate, groupByDate, setColor } from "@/lib/function"
// expo
import { useNavigation } from "expo-router"

export default function Search() {
  const { workoutPlanList } = userWorkoutPlanStore()
  const navigation = useNavigation()
  const [inputValue, setInputValue] = useState("")
  const { onReset, setPrevPlanValue, ...result } = usePlanStore()
  const themeColor = useCurrentThemeColor()

  const filterWorkoutList = (value: string) => {
    const result = workoutPlanList.filter((workout) => {
      let convertValue = value

      if (value == "등") convertValue = "back"
      if (value == "어깨") convertValue = "shoulder"
      if (value == "하체") convertValue = "leg"
      if (value == "팔") convertValue = "arm"
      if (value == "가슴") convertValue = "chest"

      return (
        workout.equipment.includes(convertValue) ||
        workout.type.includes(convertValue) ||
        workout.workout.includes(convertValue) ||
        workout.content.includes(convertValue) ||
        workout.title.includes(convertValue) ||
        workout.weight.includes(convertValue)
      )
    })
    return groupByDate(result)
  }
  useLayoutEffect(() => {
    navigation.setOptions({
      headerSearchBarOptions: {
        visable: true,
        placeHolder: "Search",
        autoFocus: true,
        tintColor: themeColor.tint,
        cancelButtonText: "취소",

        onChangeText: (e: any) => {
          setInputValue(e.nativeEvent.text)
        },
        hideWhenScrolling: false,
      },
    })
  }, [navigation])

  return (
    <ScrollView
      style={[
        styles.container,
        setColor(themeColor.background, "backgroundColor"),
      ]}
      keyboardDismissMode="on-drag"
    >
      {inputValue && (
        <FlashList
          data={Object.entries(filterWorkoutList(inputValue))}
          estimatedItemSize={50}
          keyExtractor={(item) => item[0]}
          renderItem={({ item, index }) => {
            return (
              <View style={styles.list} key={index}>
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
            )
          }}
        />
      )}
      <View
        style={{
          height: 300,
          alignItems: "center",
          paddingTop: 80,
        }}
      >
        <Text
          style={{
            color: themeColor.subText,
            textAlign: "center",
            lineHeight: 24,
            fontSize: 16,
          }}
        >
          {!inputValue
            ? `🔍  키워드를 입력해주세요.${"\n"}예:) 바벨, 등, 프레스`
            : "마지막 운동계획입니다."}
        </Text>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 110,
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
})
