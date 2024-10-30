import { StyleSheet, TouchableOpacity, useColorScheme } from "react-native"
import React from "react"
import { Text, View } from "../Themed"
import { workoutData } from "@/constants/constants"
import Colors from "@/constants/Colors"
import { useLocalSearchParams } from "expo-router"
import { usePlanStore } from "@/hooks/use-plan-store"

export const WorkoutTags = () => {
  const { slug } = useLocalSearchParams<{ slug: string }>()
  const { workout, setPlanValue } = usePlanStore()
  const colorScheme = useColorScheme()

  const onPressWorkout = (item: string) => {
    if (workout === item) {
      setPlanValue("workout", "")
      return
    }
    setPlanValue("workout", item)
  }

  return (
    <View style={styles.container}>
      {workoutData[`${slug}`].map((item) => (
        <TouchableOpacity
          key={item}
          style={[
            styles.tag,
            { borderColor: Colors[colorScheme ?? "light"].tint },
            item === workout && {
              backgroundColor: Colors[colorScheme ?? "light"].tint,
            },
          ]}
          onPress={() => onPressWorkout(item)}
        >
          <Text
            style={[
              styles.title,
              { color: Colors[colorScheme ?? "light"].tint },
              item === workout && {
                color: Colors[colorScheme ?? "light"].text,
              },
            ]}
          >
            {item}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    paddingVertical: 12,
  },
  tag: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderWidth: 2,

    borderRadius: 50,
  },
  title: {
    fontFamily: "sb-l",
    fontSize: 14,
  },
})
