import React, { useCallback, useRef, useState } from "react"
// component
import { SetCounterSheet } from "@/components/SetCounterSheet"
import { Text, View } from "@/components/Themed"
import { BottomSheetModal } from "@gorhom/bottom-sheet"
import {
  Keyboard,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from "react-native"
import { WorkoutTags } from "@/components/add-plan/workout-tags"
import { SetCounter } from "@/components/add-plan/set-counter"
import { TopWeight } from "@/components/add-plan/top-weight"
import { ConditionList } from "@/components/add-plan/condition-list"
import { PlanNote } from "@/components/add-plan/plan-note"
import { EquipmentBox } from "@/components/add-plan/equipment-box"
// zustand
import { usePlanStore } from "@/hooks/use-plan-store"
// expo
import {
  useFocusEffect,
  useLocalSearchParams,
  useNavigation,
} from "expo-router"
// lib
import { workoutData } from "@/constants/constants"
// hook
import useCurrneThemeColor from "@/hooks/use-current-theme-color"
import { KeyBoardAvoid } from "@/components/KeyBoardAvoid"
import { Button } from "@/components/Button"
import { CameraImage } from "@/components/add-plan/camera-image"
import { SearchWorkoutTagSheet } from "@/components/add-plan/search-workout-tag-sheet"
import { FontAwesome } from "@expo/vector-icons"
import { Dialog } from "@/components/Dialog"
import { AddWorkoutTagDialog } from "@/components/add-plan/add-workout-tag-dialog"

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

export default function AddPlan() {
  const bottomSheetModalRef = useRef<BottomSheetModal>(null)
  const workoutTagRef = useRef<BottomSheetModal>(null)
  const { onReset } = usePlanStore()
  const { slug } = useLocalSearchParams()
  const navigation = useNavigation()
  const [isWorkoutTagModalOpen, setIsWorkoutTagModalOpen] = useState(false)
  const scrollRef = useRef<ScrollView>(null)
  const themeColor = useCurrneThemeColor()

  const onWorkoutTagSheetClose = () => {
    if (isWorkoutTagModalOpen) {
      Keyboard.dismiss()
      setIsWorkoutTagModalOpen(false)
      workoutTagRef.current?.close()
    }
  }

  const onWorkoutTagSheetOpen = () => {
    setIsWorkoutTagModalOpen(true)
    workoutTagRef.current?.expand()
  }
  const onSheetClose = () => bottomSheetModalRef.current?.close()
  const onSheetOpen = () => bottomSheetModalRef.current?.expand()

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

  useFocusEffect(
    useCallback(() => {
      const unsubscribe = navigation.addListener("beforeRemove", (e) => {
        onReset()
      })

      return unsubscribe
    }, [navigation])
  )

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
        <View style={styles.header}>
          <Text style={styles.title}>🔥 어떤 운동 하실건가요?</Text>
          <TouchableOpacity
            onPress={onWorkoutTagSheetOpen}
            style={{ padding: 8 }}
          >
            <FontAwesome name="search" size={20} color={themeColor.text} />
          </TouchableOpacity>
        </View>
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
        {/* 사진   */}
        <CameraImage />
        <View style={{ height: 250 }} />
      </ScrollView>
      <SetCounterSheet ref={bottomSheetModalRef} onClose={onSheetClose} />
      <SearchWorkoutTagSheet
        workoutList={workoutData[slug as string]}
        ref={workoutTagRef}
        onClose={onWorkoutTagSheetClose}
        isOpen={isWorkoutTagModalOpen}
      />
      <AddWorkoutTagDialog />
    </KeyBoardAvoid>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",

    paddingTop: 12,
  },
  header: {
    flexDirection: "row",
    paddingHorizontal: 20,
    justifyContent: "space-between",
    alignItems: "center",
  },

  title: {
    fontSize: 24,
    textAlign: "center",
  },
})
