import { StyleSheet, TouchableOpacity } from "react-native"
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
        index === 0 && { paddingTop: 16 },
        index === totalLength - 1 && { paddingBottom: 24 },
      ]}
    >
      <View style={styles.iconLine}>
        {getWorkoutIcon(item.type)}
        {index !== totalLength - 1 && (
          <View
            style={{
              width: 2,
              height: 16,
              flex: 1,
              backgroundColor: Colors.dark.subText,
            }}
          />
        )}
      </View>
      <View style={[styles.workoutContainer, { paddingBottom: 12 }]}>
        <WeightDate
          equipment={item.equipment}
          workout={item.workout}
          weight={item.weight}
          date={item.createdAt as string}
        />
        {/* 컨디션 */}
        {item.condition.length > 0 && (
          <View style={styles.conditionTagList}>
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
              backgroundColor: Colors.dark.itemColor,
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
    backgroundColor: Colors.dark.itemColor,
    // borderRadius: 12,
    gap: 14,
    flexDirection: "row",
    alignItems: "flex-start",
    // borderWidth: 1,
  },
  iconLine: {
    backgroundColor: Colors.dark.itemColor,
    // justifyContent: "center",

    alignItems: "center",
    gap: 8,
  },
  workoutContainer: {
    backgroundColor: Colors.dark.itemColor,
    flex: 1,
    gap: 14,
  },

  conditionTagList: {
    backgroundColor: Colors.dark.itemColor,
    flexDirection: "row",
    flexWrap: "wrap",
  },

  //   line: {
  //     width: 2,
  //     height: "100%",
  //     backgroundColor: Colors.dark.subText,
  //   },
})
