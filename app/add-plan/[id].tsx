// import { StyleSheet, Text, View } from "react-native"
import { SetCountSheet } from "@/components/SetCountSheet"
import { Text, View } from "@/components/Themed"
import Colors from "@/constants/Colors"
import BottomSheet, { BottomSheetModal } from "@gorhom/bottom-sheet"
import { Picker } from "@react-native-picker/picker"
import React, { useCallback, useMemo, useRef, useState } from "react"
import Octicons from "@expo/vector-icons/Octicons"
import WeightIcon from "@expo/vector-icons/MaterialCommunityIcons"
import NoteIcon from "@expo/vector-icons/MaterialCommunityIcons"
import EmotionIcon from "@expo/vector-icons/MaterialIcons"

import {
  Button,
  Pressable,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from "react-native"
import { Link } from "expo-router"
import { condition } from "@/constants/condition"
import { FlashList } from "@shopify/flash-list"

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
      <Text style={styles.title}>🔥 어떤 종목 하실건가요?</Text>
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

      {/* 목표중량 */}
      <View style={{ paddingHorizontal: 24 }}>
        <View style={[styles.textIconContainer, { gap: 6 }]}>
          <WeightIcon
            name="weight-kilogram"
            size={20}
            color={Colors.dark.tint}
          />
          <Text style={{ fontSize: 16 }}>목표 중량</Text>
        </View>
        <View style={styles.textInputContainer}>
          <TextInput
            style={styles.TextInput}
            keyboardType="numeric"
            returnKeyType="done"
            maxLength={3}
          />
          <Text>kg</Text>
        </View>
      </View>

      {/* 컨디션 */}
      <View>
        <View style={[styles.textIconContainer, { gap: 6, paddingLeft: 24 }]}>
          <EmotionIcon
            name="emoji-emotions"
            size={20}
            color={Colors.dark.tint}
          />
          <Text style={{ fontSize: 16 }}>컨디션</Text>
        </View>
        <View style={{ width: "100%", height: 60, alignItems: "center" }}>
          <FlashList
            data={condition}
            horizontal
            renderItem={({ item, index }) => (
              <TouchableOpacity
                style={[
                  styles.conditionIcon,
                  index === 0 && { marginLeft: 24 },
                  index === condition.length - 1 && { marginRight: 24 },
                ]}
                key={item.id}
              >
                <View>{item.Icon}</View>
                <Text style={{ fontSize: 8, color: Colors.dark.tint }}>
                  {item.condition}
                </Text>
              </TouchableOpacity>
            )}
            estimatedItemSize={61}
          />
        </View>
        {/* <View style={{ flexDirection: "row" }}>
          {condition.map((item) => (
            <TouchableOpacity style={styles.conditionIcon}>
              <View>{item.Icon}</View>
              <Text style={{ fontSize: 8, color: Colors.dark.tint }}>
                {item.condition}
              </Text>
            </TouchableOpacity>
          ))}
        </View> */}
      </View>

      {/* 퀵노트 전체 노트 */}
      <View style={{ paddingHorizontal: 24 }}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "flex-end",
          }}
        >
          <View style={[styles.textIconContainer, { gap: 7 }]}>
            <NoteIcon name="note-text" size={20} color={Colors.dark.tint} />
            <Text style={{ fontSize: 16 }}>퀵 노트</Text>
          </View>
          <Link
            href="/(modals)/note"
            style={{
              fontSize: 14,
              fontFamily: "sb-l",
              color: Colors.dark.tint,
            }}
          >
            전체노트 열기
          </Link>
        </View>
        <TextInput
          style={styles.noteTextInput}
          placeholder="특이사항을 적어주세요 (선택)"
        />
      </View>
      <SetCountSheet ref={bottomSheetModalRef} />
    </View>
  )
}

const styles = StyleSheet.create({
  conditionIcon: {
    alignSelf: "flex-start",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: Colors.dark.tint,
    width: 50,
    height: 50,
    borderRadius: 50,
    gap: 1,
    marginLeft: 10,
  },

  noteTextInput: {
    borderWidth: 2,
    borderColor: Colors.dark.subText,
    // backgroundColor: Colors.dark.itemColor,
    borderRadius: 12,
    paddingVertical: 12,
    color: Colors.dark.text,
    paddingLeft: 12,
    fontSize: 14,
    fontFamily: "sb-l",
  },

  textInputContainer: {
    flexDirection: "row",
    borderWidth: 2,
    borderColor: Colors.dark.subText,

    alignSelf: "flex-start",
    paddingVertical: 8,
    gap: 3,
    paddingLeft: 4,
    paddingRight: 8,
    borderRadius: 12,
  },

  TextInput: {
    textAlign: "right",
    color: Colors.dark.tint,
    minWidth: 40,
    fontSize: 16,
    fontFamily: "sb-l",
  },
  sheetBtn: {
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: Colors.dark.subText,
    paddingVertical: 12,
    borderRadius: 12,
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
