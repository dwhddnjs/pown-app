// import { StyleSheet, Text, View } from "react-native"
import { SetCountSheet } from "@/components/SetCountSheet"
import { Text, View } from "@/components/Themed"
import Colors from "@/constants/Colors"
import BottomSheet, { BottomSheetModal } from "@gorhom/bottom-sheet"
import { Picker } from "@react-native-picker/picker"
import React, { useCallback, useMemo, useRef, useState } from "react"
import Octicons from "@expo/vector-icons/Octicons"
import {
  Button,
  Pressable,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from "react-native"

export default function AddPlan() {
  const planData = {
    id: 1,
    type: "back",
    workout: "바벨로우",
    totalSet: 10,
    maxWeight: {
      weight: 100,
      count: 1,
    },
    createdAt: "9시 30분",
    condition: ["화남", "피곤함", "우울함", "신남"],
    comment: "아 진짜 개빡치네 너무 아쉽게 못 들었음",
  }
  const workoutData = {
    back: [
      "풀업",
      "시티드로우",
      "랫풀다운",
      "바벨로우",
      "하이로우",
      "로우로우",
      "암풀다운",
      "슈러그",
    ],
    chest: [
      "인클라인프레스",
      "디클라인프레스",
      "벤치프레스",
      "케이블플라이",
      "팩덱플라이",
    ],
    shoulder: [
      "프론트레이즈",
      "사이드레터럴레이즈",
      "케이블푸쉬다운",
      "밀리터리프레스",
      "오버헤드프레스",
      "업라이트로우",
    ],
    leg: [
      "스쿼트",
      "브이스쿼트",
      "핵스쿼트",
      "인어싸이",
      "아웃싸이",
      "카프레이즈",
      "데드리프트",
      "레그익스텐션",
      "레그컬",
      "레그프레스",
      "스플릿 스쿼트",
      "런지",
      "힙쓰러스트",
    ],
    arm: [
      "해머컬",
      "바벨컬",
      "덤벨컬",
      "케이블컬",
      "리버스컬",
      "리스트컬",
      "리버스리스트컬",
    ],
  }

  const bottomSheetModalRef = useRef<BottomSheetModal>(null)

  const onSheetClose = () => bottomSheetModalRef.current?.close()
  const onSheetOpen = () => bottomSheetModalRef.current?.expand()

  return (
    <View style={styles.container}>
      <Text style={styles.title}>어떤 종목 하실건가요?</Text>
      <View style={styles.tagContainer}>
        {workoutData.leg.map((item) => (
          <TouchableOpacity key={item} style={styles.tag}>
            <Text style={styles.tagName}>{item}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* 세트와 횟수 */}
      <View style={{ paddingHorizontal: 24 }}>
        <View style={styles.textIconContainer}>
          <Octicons name="number" size={20} color={Colors.dark.tint} />
          <Text style={{ fontSize: 16 }}>세트와 횟수</Text>
        </View>
        <TouchableOpacity style={styles.sheetBtn} onPress={onSheetOpen}>
          <Text style={{ color: Colors.dark.tint }}>선택하기</Text>
        </TouchableOpacity>
      </View>

      <Text>목표 중량</Text>
      <Text>컨디션</Text>
      <View>
        <View>
          <Text>퀵 노트</Text>
          <Text>전체노트 열기</Text>
        </View>
        <TextInput />
      </View>
      <SetCountSheet ref={bottomSheetModalRef} />
    </View>
  )
}

const styles = StyleSheet.create({
  sheetBtn: {
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: Colors.dark.subText,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: Colors.dark.itemColor,
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
  tagContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  tag: {
    paddingVertical: 4,
    paddingHorizontal: 6,
    borderWidth: 2,
    borderColor: Colors.dark.tint,
    borderRadius: 24,
  },
  tagName: {
    fontFamily: "sb-l",
    color: Colors.dark.tint,
  },
})
