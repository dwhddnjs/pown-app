import { SetCounterSheet } from "@/components/SetCounterSheet"
import { Text, View } from "@/components/Themed"
import { BottomSheetModal } from "@gorhom/bottom-sheet"
import React, { useCallback, useEffect, useRef, useState } from "react"
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
import { KeyBoardAvoid } from "@/components/KeyBoardAvoid"
import { EquipmentBox } from "@/components/add-plan/equipment-box"
import { userWorkoutPlanStore } from "@/hooks/use-workout-plan-store"
import { usePlanStore, WorkoutTypes } from "@/hooks/use-plan-store"
import {
  useFocusEffect,
  useLocalSearchParams,
  useNavigation,
} from "expo-router"
import { CameraImage } from "@/components/add-plan/camera-image"
import useCurrneThemeColor from "@/hooks/use-current-theme-color"
import { SearchWorkoutTagSheet } from "@/components/add-plan/search-workout-tag-sheet"
import { useUserStore } from "@/hooks/use-user-store"
import { TitleSearchHeader } from "@/components/add-plan/title-search-header"

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

export default function EditPlan() {
  const bottomSheetModalRef = useRef<BottomSheetModal>(null)
  const workoutTagRef = useRef<BottomSheetModal>(null)
  const { workoutList } = useUserStore()
  const { workoutPlanList, setWorkoutPlan, setEditPlan } =
    userWorkoutPlanStore()
  const { onReset, setPrevPlanValue, ...result } = usePlanStore()
  const { slug } = useLocalSearchParams()
  const navigation = useNavigation()
  const workoutListData = workoutList[slug[0] as WorkoutTypes]

  const getWorkoutPlan = workoutPlanList.filter(
    (item) => item.id === parseInt(slug[1])
  )[0]
  const themeColor = useCurrneThemeColor()
  const [isWorkoutTagModalOpen, setIsWorkoutTagModalOpen] = useState(false)
  const [currentScrollY, setCurrentScrollY] = useState(0)

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

  useFocusEffect(
    useCallback(() => {
      const unsubscribe = navigation.addListener("beforeRemove", (e) => {
        onReset()
      })

      return unsubscribe
    }, [navigation])
  )

  useEffect(() => {
    if (slug[0]) {
      setPrevPlanValue(getWorkoutPlan)
    }
  }, [slug[0]])

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

  const onFocusScroll = (positionY: number) => {
    scrollRef.current?.scrollTo({ y: positionY, animated: true })
  }

  return (
    <KeyBoardAvoid
      style={[styles.container, { backgroundColor: themeColor.background }]}
    >
      <ScrollView
        ref={scrollRef}
        onScroll={(e) => setCurrentScrollY(e.nativeEvent.contentOffset.y)}
        style={{
          flex: 1,
        }}
      >
        <TitleSearchHeader onPress={onWorkoutTagSheetOpen} />
        {/* 운동 태그 */}
        <WorkoutTags workoutList={workoutListData} />
        {/* 도구 선택 */}
        <EquipmentBox />
        {/* 목표중량 */}
        <TopWeight
          onFocusScroll={onFocusScroll}
          currentScrollY={currentScrollY}
        />
        {/* 세트와 횟수 */}
        <SetCounter onOpen={onSheetOpen} onFocus={onInputFocus} />
        {/* 컨디션 */}
        <ConditionList />
        {/* 퀵노트 전체 노트 */}
        <PlanNote
          onFocusScroll={onFocusScroll}
          currentScrollY={currentScrollY}
        />
        {/* 사진   */}
        <CameraImage />
        <View style={{ height: 250 }} />
      </ScrollView>
      <SetCounterSheet ref={bottomSheetModalRef} onClose={onSheetClose} />
      <SearchWorkoutTagSheet
        workoutList={workoutListData}
        ref={workoutTagRef}
        onClose={onWorkoutTagSheetClose}
        isOpen={isWorkoutTagModalOpen}
      />
    </KeyBoardAvoid>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
    paddingTop: 12,
  },
})
