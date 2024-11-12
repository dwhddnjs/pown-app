import { Text, View } from "@/components/Themed"
import { WorkoutPlan } from "@/components/workout-plan/workout-plan"
import Colors from "@/constants/Colors"
import { usePlanStore } from "@/hooks/use-plan-store"
import { useSearchInputStore } from "@/hooks/use-search-input-store"
import { userWorkoutPlanStore } from "@/hooks/use-workout-plan-store"
import { formatDate, groupByDate, setColor } from "@/lib/function"
import { FlashList } from "@shopify/flash-list"
import { useFocusEffect, useNavigation } from "expo-router"
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react"
import { ScrollView, StyleSheet, useColorScheme } from "react-native"

export default function Search() {
  const colorScheme = useColorScheme()
  const { workoutPlanList, onResetPlanList } = userWorkoutPlanStore()
  const navigation = useNavigation()
  const [inputValue, setInputValue] = useState("")
  const { onReset, setPrevPlanValue, ...result } = usePlanStore()

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
        tintColor: Colors[colorScheme ?? "light"].tint,
        cancelButtonText: "취소",

        onChangeText: (e: any) => {
          setInputValue(e.nativeEvent.text)
        },
        hideWhenScrolling: false,
      },
    })
  }, [navigation])

  //   useFocusEffect(
  //     useCallback(() => {
  //       const unsubscribe = navigation.addListener("beforeRemove", (e) => {
  //         setInputValue("")
  //       })

  //       return unsubscribe
  //     }, [navigation])
  //   )

  return (
    <ScrollView
      style={[
        styles.container,
        setColor(Colors[colorScheme ?? "light"].background, "backgroundColor"),
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
                <Text
                  style={[
                    styles.date,
                    setColor(
                      Colors[colorScheme ?? "light"].subText,
                      "borderColor"
                    ),
                  ]}
                >{`🗓️  ${formatDate(item[0])}`}</Text>

                <View style={styles.workoutList}>
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
            color: Colors[colorScheme ?? "light"].subText,
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
    borderRadius: 14,
    overflow: "hidden",
  },

  date: {
    fontSize: 14,
    textAlign: "center",
    fontFamily: "sb-l",
    borderWidth: 2,

    alignSelf: "center",
    paddingHorizontal: 10,
    // paddingTop: 1,
    paddingBottom: 4,
    borderRadius: 16,
  },
  list: {
    paddingHorizontal: 24,
    gap: 18,
    paddingTop: 18,
    // paddingBottom: 12,
  },
})
