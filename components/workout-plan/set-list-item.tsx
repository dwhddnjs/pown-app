import { StyleSheet, TouchableOpacity } from "react-native"
import React from "react"
import { Text, View } from "../Themed"
import Colors from "@/constants/Colors"
import { NumberBallIcon } from "../number-ball-icon"
import { SetWithCountType } from "@/hooks/use-plan-store"
import { userWorkoutPlanStore } from "@/hooks/use-workout-plan-store"
import CheckCircle from "@expo/vector-icons/AntDesign"

interface SetListItemProps {
  item: SetWithCountType
  planId: number
}

export const SetListItem = ({ item, planId }: SetListItemProps) => {
  const { setCompleteProgress } = userWorkoutPlanStore()

  return (
    <View style={styles.container}>
      <View style={styles.ballContainer}>
        <NumberBallIcon>{item.id}</NumberBallIcon>
      </View>
      <View style={styles.setCounter}>
        <View style={styles.setCounterContainer}>
          <Text style={styles.setType}>{item.set}</Text>
          <Text style={styles.count}>{`${item.count} 회`}</Text>
        </View>
        <Text
          style={[
            styles.progressText,
            item.progress === "완료" && { color: Colors.dark.tint },
          ]}
        >
          {item.progress}
        </Text>
      </View>
      <View style={styles.buttonContainer}>
        {item.progress === "완료" ? (
          <View style={styles.completedIcon}>
            <CheckCircle
              name="checkcircleo"
              size={24}
              color={Colors.dark.tint}
            />
          </View>
        ) : (
          <TouchableOpacity
            style={[
              styles.button,
              {
                backgroundColor: Colors.dark.subText,
                borderRadius: 8,
              },
            ]}
            onPress={() => setCompleteProgress(planId, item.id)}
          >
            <Text style={styles.butttonText}>완료</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.dark.itemColor,
    flexDirection: "row",
    // gap: 8,
    // borderWidth: 1,
  },
  ballContainer: { paddingTop: 2, backgroundColor: Colors.dark.itemColor },
  progressText: {
    color: Colors.dark.subText,
    fontFamily: "sb-l",
    fontSize: 10,
  },

  setCounterContainer: {
    flexDirection: "row",
    backgroundColor: Colors.dark.itemColor,
    alignItems: "center",
    gap: 4,
  },

  setCounter: {
    backgroundColor: Colors.dark.itemColor,
    flexDirection: "column",
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.subText,
    // gap: 2,
    flex: 1,
    marginLeft: 6,
    marginRight: 6,
    justifyContent: "center",
  },
  setType: {
    color: Colors.dark.tint,
  },
  count: {
    color: Colors.dark.text,
    fontFamily: "sb-l",
    fontSize: 12,
  },
  buttonContainer: {
    flexDirection: "row",
    backgroundColor: Colors.dark.itemColor,
  },
  button: {
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 10,
  },

  butttonText: {
    fontSize: 12,
  },
  completedIcon: {
    justifyContent: "center",
    backgroundColor: Colors.dark.itemColor,
    paddingHorizontal: 10,
  },
})
