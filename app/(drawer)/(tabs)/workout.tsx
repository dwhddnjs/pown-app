import { useCallback, useEffect, useRef } from "react"
// component
import { WorkoutPlan } from "@/components/workout-plan/workout-plan"
import { Text, View } from "@/components/Themed"
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
} from "react-native"
import { FlashList } from "@shopify/flash-list"
import { EmptyList } from "@/components/workout-plan/empty-list"
import { RefView } from "@/components/RefView"
// zustand
import { userWorkoutPlanStore } from "@/hooks/use-workout-plan-store"
import { useSelectDateStore } from "@/hooks/use-select-date-store"
// lib
import { formatDate, groupByDate } from "@/lib/function"
// expo
import { useNavigation } from "expo-router"
// navigation
import { useHeaderHeight } from "@react-navigation/elements"
// hooks
import useCurrneThemeColor from "@/hooks/use-current-theme-color"

export default function TabOneScreen() {
  const { workoutPlanList, onResetPlanList } = userWorkoutPlanStore()
  const { date: selectedDate } = useSelectDateStore()
  const sortWorkList = groupByDate(workoutPlanList)
  const headerHeight = useHeaderHeight()
  const themeColor = useCurrneThemeColor()
  const navigation = useNavigation()

  const itemRef = useRef(new Map())
  const scrollRef = useRef<ScrollView | null>(null)
  const scrollY = useRef(0)

  const measureView = (ref: any, date: string) => {
    ref.measureLayout(
      scrollRef.current,
      (x: number, y: number, width: number, height: number) => {
        if (scrollY.current === 0) {
          const splitData = date.split(".")
          navigation.setOptions({
            title: `${splitData[0]}년  ${splitData[1]}월`,
          })
        }
        if (y - scrollY.current < headerHeight - 30) {
          const splitData = date.split(".")
          navigation.setOptions({
            title: `${splitData[0]}년  ${splitData[1]}월`,
          })
        }
      }
    )
  }

  const scrollToSelectedDate = useCallback(() => {
    if (!selectedDate) return
    const targetRef = itemRef.current.get(selectedDate)
    if (targetRef) {
      targetRef.measureLayout(
        scrollRef.current,
        (x: number, y: number) => {
          scrollRef.current?.scrollTo({
            y: y - headerHeight - 20,
            animated: true,
          })
        },
        (error: Error) => console.log("Scroll error:", error)
      )
    }
  }, [selectedDate, headerHeight])

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetY = event.nativeEvent.contentOffset.y
    scrollY.current = offsetY
    itemRef.current.forEach((ref, date: string) => {
      measureView(ref, date)
    })
  }

  if (workoutPlanList.length === 0) {
    return <EmptyList />
  }

  useEffect(() => {
    setTimeout(scrollToSelectedDate, 200)
  }, [selectedDate, scrollToSelectedDate])

  return (
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
                  itemRef.current.set(item[0], ref)
                  if (ref && index === 0) {
                    measureView(ref, item[0])
                  }
                }}
              >
                <Text
                  style={[styles.date, { borderColor: themeColor.subText }]}
                >{`🗓️  ${formatDate(item[0])}`}</Text>
              </RefView>

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
      <View
        style={{
          height: 300,
          alignItems: "center",
          paddingTop: 80,
        }}
      >
        <Text style={{ color: themeColor.subText }}>
          마지막 운동계획입니다.
        </Text>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  workoutList: {
    borderRadius: 14,
    overflow: "hidden",
  },

  list: {
    paddingHorizontal: 24,
    gap: 18,
    paddingTop: 18,
    // paddingBottom: 12,
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
})
