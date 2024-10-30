import { StyleSheet, TouchableOpacity, useColorScheme } from "react-native"
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
  const colorScheme = useColorScheme()

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: Colors[colorScheme ?? "light"].itemColor },
      ]}
    >
      <View
        style={[
          styles.ballContainer,
          { backgroundColor: Colors[colorScheme ?? "light"].itemColor },
        ]}
      >
        <NumberBallIcon>{item.id}</NumberBallIcon>
      </View>
      <View
        style={[
          styles.setCounter,
          {
            backgroundColor: Colors[colorScheme ?? "light"].itemColor,
            borderBottomColor: Colors[colorScheme ?? "light"].subText,
          },
        ]}
      >
        <View
          style={[
            styles.setCounterContainer,
            { backgroundColor: Colors[colorScheme ?? "light"].itemColor },
          ]}
        >
          <Text
            style={[
              styles.setType,
              { color: Colors[colorScheme ?? "light"].tint },
            ]}
          >
            {item.set}
          </Text>
          <Text
            style={[
              styles.count,
              { color: Colors[colorScheme ?? "light"].text },
            ]}
          >{`${item.count} 회`}</Text>
        </View>
        <Text
          style={[
            styles.progressText,
            { color: Colors[colorScheme ?? "light"].subText },
            item.progress === "완료" && {
              color: Colors[colorScheme ?? "light"].tint,
            },
          ]}
        >
          {item.progress}
        </Text>
      </View>
      <View
        style={[
          styles.buttonContainer,
          { backgroundColor: Colors[colorScheme ?? "light"].itemColor },
        ]}
      >
        {item.progress === "완료" ? (
          <View
            style={[
              styles.completedIcon,
              { backgroundColor: Colors[colorScheme ?? "light"].itemColor },
            ]}
          >
            <CheckCircle
              name="checkcircleo"
              size={24}
              color={Colors[colorScheme ?? "light"].tint}
            />
          </View>
        ) : (
          <TouchableOpacity
            style={[
              styles.button,
              {
                backgroundColor: Colors[colorScheme ?? "light"].subText,
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
    flexDirection: "row",
    // gap: 8,
    // borderWidth: 1,
  },
  ballContainer: { paddingTop: 2 },
  progressText: {
    fontFamily: "sb-l",
    fontSize: 10,
  },

  setCounterContainer: {
    flexDirection: "row",

    alignItems: "center",
    gap: 4,
  },

  setCounter: {
    flexDirection: "column",
    borderBottomWidth: 1,
    // gap: 2,
    flex: 1,
    marginLeft: 6,
    marginRight: 6,
    justifyContent: "center",
  },
  setType: {},
  count: {
    fontFamily: "sb-l",
    fontSize: 12,
  },
  buttonContainer: {
    flexDirection: "row",
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

    paddingHorizontal: 10,
  },
})
