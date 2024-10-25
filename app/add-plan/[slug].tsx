import { SetCounterSheet } from "@/components/SetCounterSheet"
import { Text, View } from "@/components/Themed"
import BottomSheet, { BottomSheetModal } from "@gorhom/bottom-sheet"
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
import {
  Keyboard,
  KeyboardAvoidingView,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from "react-native"
import { WorkoutTags } from "@/components/add-plan/workout-tags"
import { SetCounter } from "@/components/add-plan/set-counter"
import { TopWeight } from "@/components/add-plan/top-weight"
import { ConditionList } from "@/components/add-plan/condition-list"
import { PlanNote } from "@/components/add-plan/plan-note"
import { Button } from "@/components/Button"
import Colors from "@/constants/Colors"
import { KeyBoardAvoid } from "@/components/KeyBoardAvoid"
import { EquipmentBox } from "@/components/add-plan/equipment-box"
import { userWorkoutPlanStore } from "@/hooks/use-workout-plan-store"
import { usePlanStore } from "@/hooks/use-plan-store"
import { useLocalSearchParams } from "expo-router"

interface InputRefObject {
  measure: (
    callback: (
      x: number,
      y: number,
      width: number,
      height: number,
      pageX: number,
      pageY: number
    ) => void
  ) => void
}

export default function AddPlan() {
  const bottomSheetModalRef = useRef<BottomSheetModal>(null)
  const onSheetClose = () => bottomSheetModalRef.current?.close()
  const onSheetOpen = () => bottomSheetModalRef.current?.expand()
  const { workoutPlanList, setWorkoutPlan } = userWorkoutPlanStore()
  const { ...result } = usePlanStore()
  const { slug } = useLocalSearchParams()

  const onHideKeyboard = () => {
    Keyboard.dismiss()
  }

  const onSubmitWorkoutPlan = () => {
    setWorkoutPlan({
      id: workoutPlanList.length + 1,
      workout: result.workout,
      type: slug as string,
      equipment: result.equipment,
      weight: result.weight,
      condition: result.condition,
      content: result.content,
      title: result.title,
      setWithCount: result.setWithCount,
      createdAt: "2024-10-27T19:51:28.459Z",
      updatedAt: new Date(),
    })
  }

  //   ;("2024-10-25T19:51:28.459Z")

  const scrollRef = useRef<ScrollView>(null)

  const onInputFocus = (node: InputRefObject) => {
    if (node) {
      node.measure(
        (
          fx: number,
          fy: number,
          width: number,
          height: number,
          px: number,
          py: number
        ) => {
          scrollRef.current?.scrollTo({ y: py, animated: true })
        }
      )
    }
  }

  return (
    <KeyBoardAvoid style={styles.container}>
      <ScrollView ref={scrollRef} style={{ flex: 1 }}>
        <Text style={styles.title}>🔥 어떤 운동 하실건가요?</Text>
        {/* 운동 태그 */}
        <WorkoutTags />

        {/* 도구 선택 */}
        <EquipmentBox />

        {/* 세트와 횟수 */}
        <SetCounter onOpen={onSheetOpen} />

        {/* 목표중량 */}
        <TopWeight onFocus={onInputFocus} />

        {/* 컨디션 */}
        <ConditionList />

        {/* 퀵노트 전체 노트 */}
        <PlanNote onFocus={onInputFocus} />
        <View style={{ height: 250 }} />
      </ScrollView>
      <Button type="submit" onPress={onSubmitWorkoutPlan}>
        저장
      </Button>
      <SetCounterSheet ref={bottomSheetModalRef} onClose={onSheetClose} />
    </KeyBoardAvoid>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
    backgroundColor: Colors.dark.background,
    paddingTop: 12,
  },

  title: {
    fontSize: 24,
    textAlign: "center",
  },
})
