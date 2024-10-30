import { StyleSheet, Text, useColorScheme, View } from "react-native"
import React from "react"
import Colors from "@/constants/Colors"
import { WorkoutPlanTypes } from "@/hooks/use-workout-plan-store"
import { format, formatDate } from "date-fns"
import { formatTime } from "@/lib/function"

interface WeightDateProps {
  workout: string
  weight: string
  date: string
  equipment: string
}

export const WeightDate = ({
  workout,
  weight,
  date,
  equipment,
}: WeightDateProps) => {
  const colorScheme = useColorScheme()
  return (
    <View
      style={[
        styles.container,
        { backgroundColor: Colors[colorScheme ?? "light"].itemColor },
      ]}
    >
      <View style={styles.titleWeight}>
        <Text
          style={[styles.title, { color: Colors[colorScheme ?? "light"].tint }]}
        >{`${equipment} ${workout}`}</Text>
        <Text
          style={[
            styles.date,
            { color: Colors[colorScheme ?? "light"].subText },
          ]}
        >
          {formatTime(date)}
        </Text>
      </View>
      <Text
        style={[styles.weight, { color: Colors[colorScheme ?? "light"].text }]}
      >
        {`목표 • ${weight}kg`}{" "}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "column",
    // alignItems: "flex-end",
    paddingTop: 8,
  },

  titleWeight: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 6,
  },

  title: {
    fontSize: 18,
    fontFamily: "sb-m",
  },

  weight: {
    // fontSize: 16
    fontFamily: "sb-m",
  },

  date: {
    fontFamily: "sb-l",
  },
})
