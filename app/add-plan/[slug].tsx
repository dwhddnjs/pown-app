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
  useColorScheme,
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
import { useLocalSearchParams, useRouter } from "expo-router"
import { format } from "date-fns"
import { useHeaderHeight } from "@react-navigation/elements"
import { toast } from "sonner-native"
import { useNoteStore } from "@/hooks/use-note-store"

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
  const { onReset, ...result } = usePlanStore()
  const { onReset: onResetNote } = useNoteStore()
  const { slug } = useLocalSearchParams()
  const { back } = useRouter()
  const headerHeight = useHeaderHeight()
  const colorScheme = useColorScheme()

  const onHideKeyboard = () => {
    Keyboard.dismiss()
  }

  const onSubmitWorkoutPlan = () => {
    if (result.weight && result.workout) {
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
        createdAt: format(new Date(), "yyyy.MM.dd HH:mm:ss"),

        updatedAt: format(new Date(), "yyyy.MM.dd HH:mm:ss"),
      })
      onReset()
      back()
      onResetNote()
      return toast.success("운동 계획을 추가되었습니다!!")
    }
    return toast.error("운동과 목표 중량은 필수에요..")
  }
  //   createdAt: "2024.10.27 02:52:43",

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
    <KeyBoardAvoid
      style={[
        styles.container,
        { backgroundColor: Colors[colorScheme ?? "light"].background },
      ]}
    >
      <ScrollView
        ref={scrollRef}
        style={{
          flex: 1,
        }}
      >
        <Text style={styles.title}>🔥 어떤 운동 하실건가요?</Text>
        {/* 운동 태그 */}
        <WorkoutTags />

        {/* 도구 선택 */}
        <EquipmentBox />

        {/* 목표중량 */}
        <TopWeight onFocus={onInputFocus} />

        {/* 세트와 횟수 */}
        <SetCounter onOpen={onSheetOpen} />

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

    paddingTop: 12,
  },

  title: {
    fontSize: 24,
    textAlign: "center",
  },
})
