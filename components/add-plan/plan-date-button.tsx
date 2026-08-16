import React from "react"
// component
import { StyleProp, StyleSheet, TextStyle, TouchableOpacity } from "react-native"
import { Text } from "../themed"
// zustand
import { usePlanStore } from "@/hooks/use-plan-store"
import { useIsDialogOpenStore } from "@/hooks/use-is-dialog-open-store"
// hook
import useCurrentThemeColor from "@/hooks/use-current-theme-color"
import { useLanguage } from "@/hooks/use-user-store"
// lib
import { formatPlanDateTime } from "@/lib/date"
// icon
import Entypo from "@expo/vector-icons/Entypo"

interface PlanDateButtonProps {
  // 부위 선택 모달과 루틴 추가 화면의 글자 크기가 달라 바깥에서 지정한다
  textStyle?: StyleProp<TextStyle>
}

// 지금 작성 중인 계획의 날짜를 보여주고, 누르면 날짜 선택 시트를 연다.
// 시트 자체(SelectTypeDateSheet)는 이 버튼을 쓰는 화면이 마운트한다.
export const PlanDateButton = ({ textStyle }: PlanDateButtonProps) => {
  const { date } = usePlanStore()
  const { setOpen } = useIsDialogOpenStore()
  const themeColor = useCurrentThemeColor()
  const lang = useLanguage()

  return (
    <TouchableOpacity style={styles.button} onPress={() => setOpen(true)}>
      <Text style={[{ color: themeColor.tintText }, textStyle]}>
        {`📆 ${formatPlanDateTime(date, lang)}`}
      </Text>
      <Entypo name="select-arrows" size={18} color={themeColor.tintText} />
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "flex-end",
    gap: 4,
  },
})
