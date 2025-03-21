// component
import { View, Text } from "@/components/Themed"
import { Platform, StyleSheet, useColorScheme, FlatList } from "react-native"
import { WorkoutPlan } from "@/components/workout-plan/workout-plan"
// expo
import { useLocalSearchParams, useRouter } from "expo-router"
// hook
import useCurrneThemeColor from "@/hooks/use-current-theme-color"
// lib
import { formatDate, groupByDate } from "@/lib/function"

export default function calendarWorkout() {
  const themeColor = useCurrneThemeColor()
  const { data } = useLocalSearchParams()
  const workoutPlanData = JSON.parse(data as string)
  const sortWorkList = groupByDate(workoutPlanData)

  return (
    <View style={styles(themeColor).container}>
      <Text style={{ fontSize: 24, padding: 12 }}>운동 히스토리</Text>
      <FlatList
        data={Object.entries(sortWorkList)}
        // estimatedItemSize={50}
        keyExtractor={(item) => item[0]}
        renderItem={({ item, index }) => {
          return (
            <View style={styles(themeColor).list} key={index}>
              <Text
                style={[
                  styles(themeColor).date,
                  { borderColor: themeColor.subText },
                ]}
              >{`🗓️  ${formatDate(item[0])}`}</Text>
              <View style={styles(themeColor).workoutList}>
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
    </View>
  )
}

const styles = (color: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      paddingHorizontal: 8,
      paddingTop: 12,
    },
    workoutList: {
      borderBottomRightRadius: 12,
      borderBottomLeftRadius: 12,
      paddingTop: 4,
      overflow: "hidden",
      backgroundColor: color.itemColor,
    },
    list: {
      paddingHorizontal: 12,
      paddingTop: 18,
    },
    date: {
      fontSize: 14,
      fontFamily: "sb-l",
      borderTopRightRadius: 12,
      borderTopLeftRadius: 12,
      paddingVertical: 6,
      backgroundColor: color.tint,
      color: color.background,
      paddingHorizontal: 12,
    },
  })
