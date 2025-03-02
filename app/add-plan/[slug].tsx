import React, { useCallback, useRef, useState } from "react"
// component
import { SetCounterSheet } from "@/components/SetCounterSheet"
import { Text, View } from "@/components/Themed"
import { BottomSheetModal } from "@gorhom/bottom-sheet"
import {
  Keyboard,
  ScrollView,
  StyleSheet,
  useColorScheme,
  Dimensions,
} from "react-native"
import { WorkoutTags } from "@/components/add-plan/workout-tags"
import { SetCounter } from "@/components/add-plan/set-counter"
import { TopWeight } from "@/components/add-plan/top-weight"
import { ConditionList } from "@/components/add-plan/condition-list"
import { PlanNote } from "@/components/add-plan/plan-note"
import { EquipmentBox } from "@/components/add-plan/equipment-box"
import { toast } from "sonner-native"
// zustand
import { userWorkoutPlanStore } from "@/hooks/use-workout-plan-store"
import { usePlanStore } from "@/hooks/use-plan-store"
import { useNoteStore } from "@/hooks/use-note-store"
// expo
import {
  useFocusEffect,
  useLocalSearchParams,
  useNavigation,
  useRouter,
} from "expo-router"
// lib
import { format } from "date-fns"
import { workoutData } from "@/constants/constants"
// hook
import useCurrneThemeColor from "@/hooks/use-current-theme-color"
import { KeyBoardAvoid } from "@/components/KeyBoardAvoid"
import { useKeyboardVisible } from "@/hooks/use-keyboard-visible"

export interface InputRefObject {
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

const { height } = Dimensions.get("window")

export default function AddPlan() {
  const bottomSheetModalRef = useRef<BottomSheetModal>(null)
  const onSheetClose = () => bottomSheetModalRef.current?.close()
  const onSheetOpen = () => bottomSheetModalRef.current?.expand()
  const { workoutPlanList, setWorkoutPlan } = userWorkoutPlanStore()
  const { onReset, ...result } = usePlanStore()
  const { slug } = useLocalSearchParams()
  const navigation = useNavigation()

  const scrollRef = useRef<ScrollView>(null)
  const themeColor = useCurrneThemeColor()
  const isKeyboardVisible = useKeyboardVisible()

  useFocusEffect(
    useCallback(() => {
      const unsubscribe = navigation.addListener("beforeRemove", (e) => {
        onReset()
      })

      return unsubscribe
    }, [navigation])
  )

  const onInputFocus = (node: InputRefObject) => {
    if (node) {
      node.measure(
        (
          fx: number,
          fy: number,
          width: number,
          h: number,
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
      style={[styles.container, { backgroundColor: themeColor.background }]}
      keyboardShouldPersistTaps="handled"
    >
      <ScrollView
        ref={scrollRef}
        style={{
          flex: 1,
        }}
      >
        <Text style={styles.title}>🔥 어떤 운동 하실건가요?</Text>
        {/* 운동 태그 */}
        <WorkoutTags workoutList={workoutData[slug as string]} />
        {/* 도구 선택 */}
        <EquipmentBox />
        {/* 목표중량 */}
        <TopWeight />
        {/* 세트와 횟수 */}
        <SetCounter onOpen={onSheetOpen} onFocus={onInputFocus} />
        {/* 컨디션 */}
        <ConditionList />
        {/* 퀵노트 전체 노트 */}
        <PlanNote />
      </ScrollView>
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
