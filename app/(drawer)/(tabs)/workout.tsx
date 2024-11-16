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
import { useCallback, useEffect, useRef, useState } from "react"
import { userWorkoutPlanStore } from "@/hooks/use-workout-plan-store"
import { formatDate, groupByDate } from "@/lib/function"
import { useNavigation } from "expo-router"
import { useHeaderHeight } from "@react-navigation/elements"
import { FlashList } from "@shopify/flash-list"
import { EmptyList } from "@/components/workout-plan/empty-list"

export default function TabOneScreen() {
  const { workoutPlanList, onResetPlanList } = userWorkoutPlanStore()

  const sortWorkList = groupByDate(workoutPlanList)
  const headerHeight = useHeaderHeight()
  const colorScheme = useColorScheme()
  const navigation = useNavigation()
  const itemRef = useRef(new Map())
  const scrollRef = useRef(null)
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
          backgroundColor: Colors[colorScheme ?? "light"].background,
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
      <View
        style={{
          height: 300,
          alignItems: "center",
          paddingTop: 80,
        }}
      >
        <Text style={{ color: Colors[colorScheme ?? "light"].subText }}>
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
