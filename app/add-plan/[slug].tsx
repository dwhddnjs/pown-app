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
import { usePlanStore } from "@/hooks/use-plan-store"

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

  const onHideKeyboard = () => {
    Keyboard.dismiss()
  }

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
      <ScrollView ref={scrollRef}>
        <Text style={styles.title}>🔥 어떤 운동 하실건가요?</Text>
        {/* 운동 태그 */}
        <WorkoutTags />

        {/* 도구 선택 */}
        <EquipmentBox />

        {/* 세트와 횟수 */}
        <SetCounter onOpen={onSheetOpen} />
        <View style={{ paddingHorizontal: 24, gap: 12, flexDirection: "row" }}>
          <View
            style={{
              width: "100%",
              //   backgroundColor: Colors.dark.tint,
              paddingVertical: 4,
              flexDirection: "row",
              borderRadius: 50,
              borderWidth: 2,
              borderColor: Colors.dark.tint,
              paddingHorizontal: 6,
              gap: 8,
            }}
          >
            <View
              style={{
                backgroundColor: Colors.dark.tint,
                borderRadius: 50,
                width: 16,
                height: 16,
                justifyContent: "flex-end",
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  fontFamily: "sb-m",
                  color: Colors.dark.text,
                  textAlign: "center",
                  fontSize: 12,
                }}
              >
                1
              </Text>
            </View>
            <Text style={{ fontFamily: "sb-m", color: Colors.dark.tint }}>
              웜업
            </Text>
            <Text style={{ fontFamily: "sb-l", color: Colors.dark.text }}>
              8 + α
            </Text>
          </View>
        </View>

        {/* 목표중량 */}
        <TopWeight onFocus={onInputFocus} />

        {/* 컨디션 */}
        <ConditionList />

        {/* 퀵노트 전체 노트 */}
        <PlanNote onFocus={onInputFocus} />
        <View style={{ height: 250 }} />
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
