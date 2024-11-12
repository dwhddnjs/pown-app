import { SetCounterSheet } from "@/components/SetCounterSheet"
import { Text, View } from "@/components/Themed"
import { BottomSheetModal } from "@gorhom/bottom-sheet"
import React, { useCallback, useEffect, useRef } from "react"
import { Keyboard, ScrollView, StyleSheet, useColorScheme } from "react-native"
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
import {
  useFocusEffect,
  useLocalSearchParams,
  useNavigation,
  useRouter,
} from "expo-router"
import { format } from "date-fns"
import { useHeaderHeight } from "@react-navigation/elements"
import { toast } from "sonner-native"
import { useNoteStore } from "@/hooks/use-note-store"
import { workoutData } from "@/constants/constants"

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
  const onSheetClose = () => bottomSheetModalRef.current?.close()
  const onSheetOpen = () => bottomSheetModalRef.current?.expand()
  const { workoutPlanList, setWorkoutPlan, setEditPlan } =
    userWorkoutPlanStore()
  const { onReset, setPrevPlanValue, ...result } = usePlanStore()

  const { onReset: onResetNote } = useNoteStore()
  const { slug } = useLocalSearchParams()
  const navigation = useNavigation()
  const { back } = useRouter()
  const colorScheme = useColorScheme()
  const workoutList = workoutData[slug[0]]
  const getWorkoutPlan = workoutPlanList.filter(
    (item) => item.id === parseInt(slug[1])
  )[0]

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

  const onHideKeyboard = () => {
    Keyboard.dismiss()
  }

  const onSubmitEditWorkoutPlan = () => {
    if (result.weight && result.workout) {
      setEditPlan({
        id: parseInt(slug[1]),
        workout: result.workout,
        type: slug[0],
        equipment: result.equipment,
        weight: result.weight,
        condition: result.condition,
        content: result.content,
        title: result.title,
        setWithCount: result.setWithCount.map((item, index) => ({
          ...item,
          id: index + 1,
        })),
        createdAt: getWorkoutPlan.createdAt,
        updatedAt: getWorkoutPlan.updatedAt,
      })
      onReset()
      back()
      onResetNote()
      return toast.success("운동 계획을 수정되었습니다!!")
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
        <WorkoutTags workoutList={workoutList} />

        {/* 도구 선택 */}
        <EquipmentBox />

        {/* 목표중량 */}
        <TopWeight onFocus={onInputFocus} />

        {/* 세트와 횟수 */}
        <SetCounter onOpen={onSheetOpen} onFocus={onInputFocus} />

        {/* 컨디션 */}
        <ConditionList />

        {/* 퀵노트 전체 노트 */}
        <PlanNote onFocus={onInputFocus} />
        <View style={{ height: 250 }} />
      </ScrollView>
      <Button type="submit" onPress={onSubmitEditWorkoutPlan}>
        수정
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
