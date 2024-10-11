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
import { WorkoutTags } from "@/components/plan/workout-tags"
import { SetCounter } from "@/components/plan/set-counter"
import { TopWeight } from "@/components/plan/top-weight"
import { ConditionList } from "@/components/plan/condition-list"
import { PlanNote } from "@/components/plan/plan-note"
import { Button } from "@/components/Button"
import Colors from "@/constants/Colors"
import { KeyBoardAvoid } from "@/components/KeyBoardAvoid"
import { EquipmentBox } from "@/components/plan/equipment-box"

export default function AddPlan() {
  const bottomSheetModalRef = useRef<BottomSheetModal>(null)

  const onSheetClose = () => bottomSheetModalRef.current?.close()
  const onSheetOpen = () => bottomSheetModalRef.current?.expand()

  const onHideKeyboard = () => {
    Keyboard.dismiss()
  }

  return (
    <KeyBoardAvoid style={styles.container}>
      <ScrollView>
        <Text style={styles.title}>🔥 어떤 운동 하실건가요?</Text>
        {/* 운동 태그 */}
        <WorkoutTags />

        {/* 도구 선택 */}
        <EquipmentBox />

        {/* 세트와 횟수 */}
        <SetCounter onOpen={onSheetOpen} />

        {/* 목표중량 */}
        <TopWeight />

        {/* 컨디션 */}
        <ConditionList />

        {/* 퀵노트 전체 노트 */}
        <PlanNote />
      </ScrollView>
      <Button type="submit">저장</Button>
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
