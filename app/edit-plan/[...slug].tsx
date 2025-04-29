import { SetCounterSheet } from "@/components/SetCounterSheet"
import { Text, View } from "@/components/Themed"
import { BottomSheetModal } from "@gorhom/bottom-sheet"
import React, { useCallback, useEffect, useRef, useState } from "react"
import {
  Keyboard,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
} from "react-native"
import { WorkoutTags } from "@/components/add-plan/workout-tags"
import { SetCounter } from "@/components/add-plan/set-counter"
import { TopWeight } from "@/components/add-plan/top-weight"
import { ConditionList } from "@/components/add-plan/condition-list"
import { PlanNote } from "@/components/add-plan/plan-note"
import Colors from "@/constants/Colors"
import { KeyBoardAvoid } from "@/components/KeyBoardAvoid"
import { EquipmentBox } from "@/components/add-plan/equipment-box"
import { userWorkoutPlanStore } from "@/hooks/use-workout-plan-store"
import { usePlanStore } from "@/hooks/use-plan-store"
import {
  useFocusEffect,
  useLocalSearchParams,
  useNavigation,
  useRouter,
} from "expo-router"
import { workoutData } from "@/constants/constants"
import { CameraImage } from "@/components/add-plan/camera-image"
import useCurrneThemeColor from "@/hooks/use-current-theme-color"
import { SearchWorkoutTagSheet } from "@/components/add-plan/search-workout-tag-sheet"
import { FontAwesome } from "@expo/vector-icons"

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
  const { workoutPlanList, setWorkoutPlan, setEditPlan } =
    userWorkoutPlanStore()
  const { onReset, setPrevPlanValue, ...result } = usePlanStore()
  const { slug } = useLocalSearchParams()
  const navigation = useNavigation()
  const workoutList = workoutData[slug[0]]

  const getWorkoutPlan = workoutPlanList.filter(
    (item) => item.id === parseInt(slug[1])
  )[0]
  const themeColor = useCurrneThemeColor()
  const [isWorkoutTagModalOpen, setIsWorkoutTagModalOpen] = useState(false)

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

  return (
    <KeyBoardAvoid
      style={[styles.container, { backgroundColor: themeColor.background }]}
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
        <WorkoutTags workoutList={workoutList} />

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
        workoutList={workoutList}
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

  title: {
    fontSize: 24,
    textAlign: "center",
  },
  header: {
    flexDirection: "row",
    paddingHorizontal: 20,
    justifyContent: "space-between",
    alignItems: "center",
  },
})
