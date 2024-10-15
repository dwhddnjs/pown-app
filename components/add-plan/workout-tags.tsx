import { StyleSheet, TouchableOpacity } from "react-native"
import React from "react"
import { Text, View } from "../Themed"
import { workoutData } from "@/constants/constants"
import Colors from "@/constants/Colors"
import { useLocalSearchParams } from "expo-router"
import { usePlanStore } from "@/hooks/use-plan-store"

export const WorkoutTags = () => {
  const { slug } = useLocalSearchParams<{ slug: string }>()
  const { workout, setPlanValue } = usePlanStore()

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
            item === workout && { backgroundColor: Colors.dark.tint },
          ]}
          onPress={() => onPressWorkout(item)}
        >
          <Text
            style={[
              styles.title,
              item === workout && {
                color: Colors.dark.text,
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
    borderColor: Colors.dark.tint,
    borderRadius: 50,
  },
  title: {
    fontFamily: "sb-l",
    color: Colors.dark.tint,
    fontSize: 14,
  },
})
