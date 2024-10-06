// import { StyleSheet, Text, View } from "react-native"
import { SetCountSheet } from "@/components/SetCountSheet"
import { Text, View } from "@/components/Themed"
import Colors from "@/constants/Colors"
import BottomSheet, { BottomSheetModal } from "@gorhom/bottom-sheet"
import { Picker } from "@react-native-picker/picker"
import React, { useCallback, useMemo, useRef, useState } from "react"
import Octicons from "@expo/vector-icons/Octicons"

import EmotionIcon from "@expo/vector-icons/MaterialIcons"

import {
  Button,
  Pressable,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from "react-native"
import { Link } from "expo-router"
import { condition } from "@/constants/condition"
import { FlashList } from "@shopify/flash-list"
import { workoutData } from "@/constants/constants"
import { WorkoutTags } from "@/components/plan/workout-tags"
import { SetCounter } from "@/components/plan/set-counter"
import { IconTitle } from "@/components/IconTitle"
import { TopWeight } from "@/components/plan/top-weight"
import { ConditionList } from "@/components/plan/condition-list"
import { PlanNote } from "@/components/plan/plan-note"

export default function AddPlan() {
  const bottomSheetModalRef = useRef<BottomSheetModal>(null)

  const onSheetClose = () => bottomSheetModalRef.current?.close()
  const onSheetOpen = () => bottomSheetModalRef.current?.expand()

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🔥 어떤 운동 하실건가요?</Text>

      {/* 운동 태그 */}
      <WorkoutTags />

      {/* 세트와 횟수 */}
      <SetCounter onOpen={onSheetOpen} />

      {/* 목표중량 */}
      <TopWeight />

      {/* 컨디션 */}
      <ConditionList />

      {/* 퀵노트 전체 노트 */}
      <PlanNote />

      {/* 바텀시트 */}
      <SetCountSheet ref={bottomSheetModalRef} />
    </View>
  )
}

const styles = StyleSheet.create({
  conditionIcon: {
    alignSelf: "flex-start",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: Colors.dark.tint,
    width: 50,
    height: 50,
    borderRadius: 50,
    gap: 1,
    marginLeft: 10,
  },

  noteTextInput: {
    borderWidth: 2,
    borderColor: Colors.dark.subText,
    // backgroundColor: Colors.dark.itemColor,
    borderRadius: 12,
    paddingVertical: 12,
    color: Colors.dark.text,
    paddingLeft: 12,
    fontSize: 14,
    fontFamily: "sb-l",
  },

  textIconContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  container: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    textAlign: "center",
  },
})
