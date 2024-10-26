import { StyleSheet, Text, View } from "react-native"
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
  return (
    <View style={styles.container}>
      <View style={styles.titleWeight}>
        <Text style={styles.title}>{`${equipment} ${workout}`}</Text>
        <Text style={styles.date}>{formatTime(date)}</Text>
      </View>
      <Text style={styles.weight}>{`목표 • ${weight}kg`} </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.dark.itemColor,
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
    color: Colors.dark.tint,
    fontSize: 18,
    fontFamily: "sb-m",
  },

  weight: {
    // fontSize: 16
    color: Colors.dark.text,
    fontFamily: "sb-m",
  },

  date: {
    color: Colors.dark.subText,
    fontFamily: "sb-l",
  },
})
