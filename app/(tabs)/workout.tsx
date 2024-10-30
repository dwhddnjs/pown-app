import { WorkoutPlan } from "@/components/workout-plan/workout-plan"
import { Text, View } from "@/components/Themed"
import {
  Image,
  PlatformColor,
  ScrollView,
  StyleSheet,
  useColorScheme,
} from "react-native"
import Colors from "@/constants/Colors"
import { supabase } from "@/lib/supabase"
import { useEffect } from "react"
import { userWorkoutPlanStore } from "@/hooks/use-workout-plan-store"
import { Button } from "@/components/Button"
import { formatDate, groupByDate } from "@/lib/function"
import { format } from "date-fns"
import { Stack } from "expo-router"
import { useHeaderHeight } from "@react-navigation/elements"
import { BlurView } from "expo-blur"

export default function TabOneScreen() {
  const { workoutPlanList, onResetPlanList } = userWorkoutPlanStore()
  const sortWorkList = groupByDate(workoutPlanList)
  const headerHeight = useHeaderHeight()
  const colorScheme = useColorScheme()

  if (workoutPlanList.length === 0) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          gap: 16,
        }}
      >
        <Image
          source={require("@/assets/images/empty.png")}
          style={{ width: 150, height: 200 }}
        />
        <Text style={{ color: Colors.dark.subText, fontSize: 18 }}>
          운동 계획을 작성해주세요!
        </Text>
      </View>
    )
  }

  return (
    <ScrollView
      style={[
        styles.container,
        {
          paddingTop: headerHeight,
          backgroundColor: Colors[colorScheme ?? "light"].background,
        },
      ]}
    >
      <View>
        {Object.entries(sortWorkList).map((item, index) => {
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
        })}
      </View>
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
