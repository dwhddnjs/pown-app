import { useCallback, useEffect, useRef, useState } from "react"
// component
import { WorkoutPlan } from "@/components/workout-plan/workout-plan"
import { Text, View } from "@/components/Themed"
import {
  ScrollView,
  StyleSheet,
  useColorScheme,
  View as RefView,
  findNodeHandle,
} from "react-native"
import Colors from "@/constants/Colors"
import { FlashList } from "@shopify/flash-list"
import { EmptyList } from "@/components/workout-plan/empty-list"
// zustand
import { userWorkoutPlanStore } from "@/hooks/use-workout-plan-store"
import { useSelectDateStore } from "@/hooks/use-select-date-store"
// lib
import { formatDate, groupByDate } from "@/lib/function"
// expo
import { useNavigation } from "expo-router"
// navigation
import { useHeaderHeight } from "@react-navigation/elements"
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

  const measureView = useCallback((date: string, ref: any) => {
    if (!ref || !scrollRef.current) return

    const handle = findNodeHandle(scrollRef.current)
    if (!handle) return

    ref.measureLayout(
      handle,
      (x: number, y: number, width: number, height: number) => {
        const actualY = y - scrollY.current
        if (actualY <= headerHeight + 20 && actualY >= -height) {
          const splitData = date.split(".")
          navigation.setOptions({
            title: `${splitData[0]}년  ${splitData[1]}월`,
          })
        }
      },
      (error: Error) => {
        console.log("에러", error)
      }
    )
  }, [])

  const scrollToSelectedDate = useCallback(() => {
    if (!selectedDate) return

    const targetRef = itemRef.current.get(selectedDate)

    if (targetRef) {
      targetRef.measureLayout(
        findNodeHandle(scrollRef.current) as number,
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

  const handleScroll = useCallback(
    (event: any) => {
      const offsetY = event.nativeEvent.contentOffset.y
      scrollY.current = offsetY

      // 약간의 디바운스 효과를 주기 위해 setTimeout 사용
      setTimeout(() => {
        itemRef.current.forEach((ref, date) => {
          measureView(date, ref)
        })
      }, 10)
    },
    [measureView]
  )

  useEffect(() => {
    setTimeout(() => {
      itemRef.current.forEach((ref, date) => {
        measureView(date, ref)
      })
    }, 100)
  }, [])

  useEffect(() => {
    setTimeout(scrollToSelectedDate, 200)
  }, [selectedDate, scrollToSelectedDate])

  if (workoutPlanList.length === 0) {
    return <EmptyList />
  }

  return (
    <ScrollView
      ref={scrollRef}
      //   contentInsetAdjustmentBehavior="automatic"
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
                  if (ref) {
                    itemRef.current.set(item[0], ref)
                    // ref가 설정된 직후 측정
                    setTimeout(() => measureView(item[0], ref), 0)
                  } else {
                    itemRef.current.delete(item[0])
                  }
                }}
                onLayout={() => {
                  const ref = itemRef.current.get(item[0])
                  if (ref) {
                    measureView(item[0], ref)
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
    // alignItems: "center",
    // justifyContent: "center",
    // paddingHorizontal: 24,
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
