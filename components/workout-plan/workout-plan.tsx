import { StyleSheet, TouchableOpacity, useColorScheme } from "react-native"
import React from "react"
import { Text, View } from "../Themed"
import Back from "@/assets/images/svg/back_icon.svg"
import Colors from "@/constants/Colors"
import GoodIcon from "@expo/vector-icons/MaterialCommunityIcons"
import { WeightDate } from "./weight-date"
import { conditionData } from "@/constants/constants"
import { ConditionIcon } from "../add-plan/condition-icon"
import { NoteText } from "./note-text"
import { SetListItem } from "./set-list-item"
import { WorkoutPlanTypes } from "@/hooks/use-workout-plan-store"
import Arm from "@/assets/images/svg/arm_icon.svg"
import Chest from "@/assets/images/svg/chest_icon.svg"
import Leg from "@/assets/images/svg/leg_icon.svg"
import Shoulder from "@/assets/images/svg/shoulder_icon.svg"

interface WorkoutPlanProps {
  item: WorkoutPlanTypes
  index: number
  totalLength: number
}

export const WorkoutPlan = ({ item, index, totalLength }: WorkoutPlanProps) => {
  const colorScheme = useColorScheme()
  const getWorkoutIcon = (type: string) => {
    let result
    switch (type) {
      case "chest":
        result = <Chest />
        break
      case "back":
        result = <Back />
        break
      case "leg":
        result = <Leg />
        break
      case "arm":
        result = <Arm />
        break
      default:
        result = <Chest />
        break
    }

    return result
  }

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: Colors[colorScheme ?? "light"].itemColor },
        index === 0 && { paddingTop: 18 },
        index === totalLength - 1 && { paddingBottom: 18 },
      ]}
    >
      <View
        style={[
          styles.iconLine,
          { backgroundColor: Colors[colorScheme ?? "light"].itemColor },
        ]}
      >
        {getWorkoutIcon(item.type)}
        {index !== totalLength - 1 && (
          <View
            style={{
              width: 2,
              height: 16,
              flex: 1,
              backgroundColor: Colors[colorScheme ?? "light"].subText,
            }}
          />
        )}
      </View>
      <View
        style={[
          styles.workoutContainer,
          {
            paddingBottom: 12,
            backgroundColor: Colors[colorScheme ?? "light"].itemColor,
          },
        ]}
      >
        <WeightDate
          equipment={item.equipment}
          workout={item.workout}
          weight={item.weight}
          date={item.createdAt as string}
        />
        {/* 컨디션 */}
        {item.condition.length > 0 && (
          <View
            style={[
              styles.conditionTagList,
              { backgroundColor: Colors[colorScheme ?? "light"].itemColor },
            ]}
          >
            {item.condition.map((item, index) => (
              <ConditionIcon
                key={index}
                item={{ id: index + 1, condition: item }}
                type="row"
              />
            ))}
          </View>
        )}
        {/* 노트 */}
        {item.content && <NoteText title={item.title} content={item.content} />}

        {/* 세트와 횟수 */}
        {item.setWithCount.length > 0 && (
          <View
            style={{
              backgroundColor: Colors[colorScheme ?? "light"].itemColor,
              gap: 8,
            }}
          >
            {item.setWithCount.map((setCount) => (
              <SetListItem key={setCount.id} planId={item.id} item={setCount} />
            ))}
          </View>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    // paddingHorizontal: 24,
    paddingTop: 8,
    paddingHorizontal: 16,
    // borderRadius: 12,
    gap: 14,
    flexDirection: "row",
    alignItems: "flex-start",
    // borderWidth: 1,
  },
  iconLine: {
    // justifyContent: "center",

    alignItems: "center",
    gap: 8,
  },
  workoutContainer: {
    flex: 1,
    gap: 14,
  },

  conditionTagList: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
})
