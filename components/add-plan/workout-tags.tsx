import React from "react"
// component
import {
  StyleSheet,
  TextInput,
  TouchableOpacity,
  useColorScheme,
} from "react-native"
import { Text, View } from "../Themed"
// zustand
import { usePlanStore } from "@/hooks/use-plan-store"
import useCurrneThemeColor from "@/hooks/use-current-theme-color"

interface WorkoutTagsProps {
  workoutList: string[]
}

export const WorkoutTags = ({ workoutList }: WorkoutTagsProps) => {
  const { workout, setPlanValue } = usePlanStore()
  const themeColor = useCurrneThemeColor()

  const onPressWorkout = (item: string) => {
    if (workout === item) {
      setPlanValue("workout", "")
      return
    }
    setPlanValue("workout", item)
  }

  return (
    <View>
      <View style={styles.container}>
        {workoutList?.map((item) => (
          <TouchableOpacity
            key={item}
            style={[
              styles.tag,
              { borderColor: themeColor.tint },
              item === workout && {
                backgroundColor: themeColor.tint,
              },
            ]}
            onPress={() => onPressWorkout(item)}
          >
            <Text
              style={[
                styles.title,
                { color: themeColor.tint },
                item === workout && {
                  color: themeColor.text,
                },
              ]}
            >
              {item}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
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
    paddingHorizontal: 12,
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
