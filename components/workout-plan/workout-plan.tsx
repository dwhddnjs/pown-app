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

export const WorkoutPlan = () => {
  return (
    <View style={styles.container}>
      {/* 세션 1 */}
      <View style={styles.iconLine}>
        <Back />
        {/* <View style={styles.line} /> */}
      </View>

      {/* 세션 2 */}
      <View style={styles.workoutContainer}>
        <WeightDate />

        <View style={styles.conditionTagList}>
          {conditionData.map((item) => (
            <ConditionIcon key={item.id} item={item} type="row" />
          ))}
        </View>

        {/* 노트 */}
        <NoteText />

        {/* 세트와 횟수 */}
        <View
          style={{
            paddingVertical: 8,
            backgroundColor: Colors.dark.itemColor,
          }}
        >
          <SetListItem />
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    // paddingHorizontal: 24,
    backgroundColor: Colors.dark.itemColor,
    // borderRadius: 12,
    gap: 10,
    flexDirection: "row",
    alignItems: "flex-start",
  },
  iconLine: {
    backgroundColor: Colors.dark.itemColor,
    // justifyContent: "center",
    alignItems: "center",
    gap: 10,
  },
  workoutContainer: {
    backgroundColor: Colors.dark.itemColor,
    flex: 1,
  },

  conditionTagList: {
    backgroundColor: Colors.dark.itemColor,
    flexDirection: "row",
    flexWrap: "wrap",
    paddingVertical: 8,
  },

  //   line: {
  //     width: 2,
  //     height: "100%",
  //     backgroundColor: Colors.dark.subText,
  //   },
})
