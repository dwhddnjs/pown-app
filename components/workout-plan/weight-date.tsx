import { StyleSheet, Text, View } from "react-native"
import React from "react"
import Colors from "@/constants/Colors"

export const WeightDate = () => {
  return (
    <View style={styles.container}>
      <View style={styles.titleWeight}>
        <Text style={styles.title}>바벨 로우</Text>
        <Text style={styles.weight}> X 90kg</Text>
      </View>
      <Text style={styles.date}>09:21</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.dark.itemColor,
    flexDirection: "column",
    // alignItems: "flex-end",
    paddingTop: 10,
  },

  titleWeight: {
    flexDirection: "row",
    alignItems: "flex-end",
  },

  title: {
    color: Colors.dark.tint,
    fontSize: 20,
    fontFamily: "sb-m",
  },

  weight: {
    fontSize: 16,
    color: Colors.dark.tint,
    fontFamily: "sb-l",
  },

  date: {
    color: Colors.dark.subText,
    fontFamily: "sb-l",
  },
})
