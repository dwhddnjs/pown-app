import { WorkoutPlan } from "@/components/workout-plan/workout-plan"
import { Text, View } from "@/components/Themed"
import {
  Image,
  PlatformColor,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  View as Any,
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

  const { scrollY } = useAnimatedHeaderTitle({
    title: "오늘의 운동",
    triggerPoint: 30,
  })
  console.log("scrollY: ", scrollY)
  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    { useNativeDriver: false }
  )

  const [data, setData] = useState<any>()

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
        scrollEventThrottle={16}
        estimatedItemSize={50}
        keyExtractor={(item) => item[0]}
        renderItem={({ item, index }) => {
          return (
            <View style={styles.list} key={index}>
              <Text
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
