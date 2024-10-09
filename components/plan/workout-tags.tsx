import { StyleSheet, TouchableOpacity } from "react-native"
import React from "react"
import { Text, View } from "../Themed"
import { workoutData } from "@/constants/constants"
import Colors from "@/constants/Colors"

export const WorkoutTags = () => {
  return (
    <View style={styles.container}>
      {workoutData.leg.map((item) => (
        <TouchableOpacity key={item} style={styles.tag}>
          <Text style={styles.title}>{item}</Text>
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
    paddingHorizontal: 6,
    borderWidth: 2,
    borderColor: Colors.dark.tint,
    borderRadius: 24,
  },
  title: {
    fontFamily: "sb-l",
    color: Colors.dark.tint,
  },
})
