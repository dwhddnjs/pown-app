import { StyleSheet } from "react-native"
import React from "react"
import { Text, View } from "../Themed"
import Back from "@/assets/images/svg/back_icon.svg"
import Colors from "@/constants/Colors"
import GoodIcon from "@expo/vector-icons/MaterialCommunityIcons"

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
        <View style={styles.workoutDate}>
          <Text style={styles.workout}>바벨 로우</Text>
          <Text style={{ fontSize: 16, color: Colors.dark.tint }}> X 90kg</Text>
          <Text style={styles.date}>09:21</Text>
        </View>

        <View style={styles.conditionTagList}>
          <View style={styles.conditionTag}>
            <GoodIcon name="emoticon" size={16} color={Colors.dark.tint} />
            <Text style={styles.conditionTagText}>좋음</Text>
          </View>
          <View style={styles.conditionTag}>
            <GoodIcon name="emoticon" size={16} color={Colors.dark.tint} />
            <Text style={styles.conditionTagText}>좋음</Text>
          </View>
          <View style={styles.conditionTag}>
            <GoodIcon name="emoticon" size={16} color={Colors.dark.tint} />
            <Text style={styles.conditionTagText}>좋음</Text>
          </View>
          <View style={styles.conditionTag}>
            <GoodIcon name="emoticon" size={16} color={Colors.dark.tint} />
            <Text style={styles.conditionTagText}>좋음</Text>
          </View>
          <View style={styles.conditionTag}>
            <GoodIcon name="emoticon" size={16} color={Colors.dark.tint} />
            <Text style={styles.conditionTagText}>좋음</Text>
          </View>
          <View style={styles.conditionTag}>
            <GoodIcon name="emoticon" size={16} color={Colors.dark.tint} />
            <Text style={styles.conditionTagText}>좋음</Text>
          </View>
          <View style={styles.conditionTag}>
            <GoodIcon name="emoticon" size={16} color={Colors.dark.tint} />
            <Text style={styles.conditionTagText}>좋음</Text>
          </View>
          <View style={styles.conditionTag}>
            <GoodIcon name="emoticon" size={16} color={Colors.dark.tint} />
            <Text style={styles.conditionTagText}>좋음</Text>
          </View>
          <View style={styles.conditionTag}>
            <GoodIcon name="emoticon" size={16} color={Colors.dark.tint} />
            <Text style={styles.conditionTagText}>좋음</Text>
          </View>
        </View>
        {/* 노트 */}
        <View style={styles.noteContainer}>
          <Text style={styles.noteTitle}>오늘 느낌이 좋은데?</Text>
          <Text style={styles.noteContent}>
            근데 사실 오늘 컨디션 좋지는 않았는데 뭔가 욕심 내면 들 수 있을거
            같음
          </Text>
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

  workoutDate: {
    backgroundColor: Colors.dark.itemColor,
    flexDirection: "row",
    alignItems: "flex-end",
  },

  workout: {
    color: Colors.dark.tint,
    fontSize: 20,
  },

  date: {
    color: Colors.dark.subText,
    fontFamily: "sb-l",
  },

  conditionTagList: {
    backgroundColor: Colors.dark.itemColor,
    flexDirection: "row",
    flexWrap: "wrap",
  },

  conditionTag: {
    backgroundColor: Colors.dark.itemColor,
    borderWidth: 2,
    alignSelf: "flex-start",
    borderColor: Colors.dark.tint,
    borderRadius: 50,
    paddingHorizontal: 4,
    paddingVertical: 2,
    flexDirection: "row",
    gap: 4,
    alignItems: "center",
  },
  conditionTagText: {
    color: Colors.dark.tint,
    fontFamily: "sb-l",
    fontSize: 12,
  },

  noteContainer: {
    backgroundColor: Colors.dark.itemColor,
  },
  noteTitle: {
    fontSize: 18,
  },
  noteContent: {
    fontFamily: "sb-l",
  },

  //   line: {
  //     width: 2,
  //     height: "100%",
  //     backgroundColor: Colors.dark.subText,
  //   },
})
