import { WorkoutPlan } from "@/components/workout-plan/workout-plan"
import { Text, View } from "@/components/Themed"
import {
  Image,
  PlatformColor,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  View as RefView,
  FlatList,
  Animated,
} from "react-native"
import Colors from "@/constants/Colors"
import { supabase } from "@/lib/supabase"
import { forwardRef, useCallback, useEffect, useRef, useState } from "react"
import { userWorkoutPlanStore } from "@/hooks/use-workout-plan-store"
import { Button } from "@/components/Button"
import { formatDate, groupByDate } from "@/lib/function"
import { format } from "date-fns"
import { Stack } from "expo-router"
import { useHeaderHeight } from "@react-navigation/elements"
import { BlurView } from "expo-blur"
import { FlashList } from "@shopify/flash-list"
import useAnimatedHeaderTitle from "@/hooks/use-animated-header-title"
import { EmptyList } from "@/components/workout-plan/empty-list"

export default function TabOneScreen() {
  const { workoutPlanList, onResetPlanList } = userWorkoutPlanStore()
  const sortWorkList = groupByDate(workoutPlanList)
  const headerHeight = useHeaderHeight()
  const colorScheme = useColorScheme()
  const itemRef = useRef(new Map())

  const { scrollY } = useAnimatedHeaderTitle({
    title: "오늘의 운동",
    triggerPoint: 30,
  })

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    { useNativeDriver: false }
  )

  const getYPosition = (key: string) => {
    const ref = itemRef.current.get(key)
    if (ref) {
      ref.measureLayout(
        null, // 필요하면 부모 뷰의 ref를 지정할 수 있음
        (x: any, y: any) => {
          console.log(`날짜 ${key}의 y 위치: ${y}`)
        },
        (error: Error) => {
          console.error(`날짜 ${key}의 측정 중 오류:`, error)
        }
      )
    }
  }

  // viewable 아이템이 변경될 때 호출되는 콜백
  const onViewableItemsChanged = useCallback(({ viewableItems }: any) => {
    viewableItems.forEach((viewableItem: any) => {
      const [key] = viewableItem.item
      getYPosition(key)
    })
  }, [])

  const [data, setData] = useState<any>(null)

  if (workoutPlanList.length === 0) {
    return <EmptyList />
  }

  return (
    <ScrollView
      //   onScroll={handleScroll}
      style={[
        styles.container,
        {
          paddingTop: headerHeight,
          backgroundColor: Colors[colorScheme ?? "light"].background,
        },
      ]}
    >
      <FlashList
        data={Object.entries(sortWorkList)}
        // viewabilityConfig={viewabilityConfig.current}
        // onViewableItemsChanged={onViewableItemsChanged}
        scrollEventThrottle={16}
        estimatedItemSize={50}
        keyExtractor={(item) => item[0]}
        renderItem={({ item, index }) => {
          return (
            <View style={styles.list} key={index}>
              <RefView
                ref={(ref) => {
                  if (ref) {
                    itemRef.current.set(item[0], ref)
                  } else {
                    itemRef.current.delete(item[0])
                  }
                }}
              >
                <Text
                  style={[
                    styles.date,
                    { borderColor: Colors[colorScheme ?? "light"].subText },
                  ]}
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
      <View style={{ height: 300 }} />
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

{
  /* {Object.entries(sortWorkList).map((item, index) => {
        return (
          <View style={styles.list} key={index}>
            <Text
              onLayout={(e) =>
                setDataValue({ y: e.nativeEvent.layout.y, value: item[0] })
              }
              style={[
                styles.date,
                { borderColor: Colors[colorScheme ?? "light"].subText },
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
      })} */
}

// ;<ScrollView
//   scrollEventThrottle={0}
//   //   onScroll={handleScroll}
//   onScroll={(e) => console.log("adsads", e.nativeEvent.contentOffset.y)}
//   style={[
//     styles.container,
//     {
//       paddingTop: headerHeight,
//       backgroundColor: Colors[colorScheme ?? "light"].background,
//     },
//   ]}
// >
//   <FlatList
//     data={Object.entries(sortWorkList)}
//     // onViewableItemsChanged={onViewableItemsChanged}
//     // viewabilityConfig={viewabilityConfig.current}

//     scrollEventThrottle={16}
//     // estimatedItemSize={50}
//     keyExtractor={(item) => item[0]}
//     renderItem={({ item, index }) => {
//       return (
//         <View style={styles.list} key={index}>
//           <Text
//             style={[
//               styles.date,
//               { borderColor: Colors[colorScheme ?? "light"].subText },
//             ]}
//           >{`🗓️  ${formatDate(item[0])}`}</Text>

//           <View style={styles.workoutList}>
//             {item[1].map((data, index) => (
//               <WorkoutPlan
//                 key={data.id}
//                 item={data}
//                 index={index}
//                 totalLength={item[1].length}
//               />
//             ))}
//           </View>
//         </View>
//       )
//     }}
//   />

//   <View style={{ height: 300 }} />
// </ScrollView>

// onLayout={(e) => {
//     // y 위치
//     const y = e.nativeEvent.layout.y
//     console.log("y: ", y)
//     // 2024년 10월
//     const splitItem = item[0].split(".")
//     const date = `${splitItem[0]}-${splitItem[1]}`

//     if (data) {
//       const prevData = Object.keys(data)
//       if (prevData.includes(date)) {
//         return
//       }
//     }
//     setData({
//       ...data,
//       [date]: y,
//     })
//   }}
