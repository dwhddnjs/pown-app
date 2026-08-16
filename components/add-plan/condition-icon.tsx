//component
import { StyleSheet, TouchableOpacity } from "react-native"
import React from "react"
import { Text, View } from "@/components/themed"
// zustand
import { usePlanStore } from "@/hooks/use-plan-store"
// hook
import useCurrentThemeColor from "@/hooks/use-current-theme-color"
import { useLanguage } from "@/hooks/use-user-store"
import { tCondition } from "@/lib/i18n"
// icon
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons"

interface ConditionButtonProps {
  item: {
    id: number
    condition: string
  }
}

// 컨디션(저장값은 한국어) → 이모티콘 글리프.
// 모르는 값은 예전 switch의 default와 같이 짜증남 아이콘으로 떨어진다.
const CONDITION_ICON: Record<
  string,
  React.ComponentProps<typeof MaterialCommunityIcons>["name"]
> = {
  좋음: "emoticon",
  피곤함: "emoticon-dead",
  화남: "emoticon-angry",
  아픔: "emoticon-sick",
  슬픔: "emoticon-cry",
  신남: "emoticon-lol",
  상쾌함: "emoticon-cool",
  양호함: "emoticon-neutral",
}

export const getIcon = (value: string, size: number, color: string) => (
  <MaterialCommunityIcons
    name={CONDITION_ICON[value] ?? "emoticon-sad"}
    size={size}
    color={color}
  />
)

// 운동 기록 리스트의 셀마다 붙는 읽기 전용 태그 — 계획 작성 폼 스토어와는 무관하다.
// 예전엔 한 컴포넌트가 두 모양을 다 만들고 골라 반환해서, 리스트의 태그까지
// usePlanStore 전체를 구독하고 쓰지도 않는 column JSX를 매번 만들었다.
export const ConditionTag = ({ condition }: { condition: string }) => {
  const themeColor = useCurrentThemeColor()
  const lang = useLanguage()

  return (
    <View
      style={[
        styles.rowIcon,
        {
          backgroundColor: themeColor.itemColor,
          borderColor: themeColor.tint,
        },
      ]}
    >
      {getIcon(condition, 16, themeColor.tintText)}
      <Text style={[styles.rowText, { color: themeColor.tintText }]}>
        {tCondition(condition, lang)}
      </Text>
    </View>
  )
}

export const ConditionButton = ({ item }: ConditionButtonProps) => {
  const { condition, setCondition, setFilterCondition } = usePlanStore()
  const themeColor = useCurrentThemeColor()
  const lang = useLanguage()
  const isSelected = condition.includes(item.condition)

  const onPressCondition = () => {
    if (isSelected) {
      setFilterCondition(item.condition)
      return
    }
    setCondition(item.condition)
  }

  return (
    <TouchableOpacity
      style={[
        styles.icon,
        { borderColor: themeColor.tint },
        item.id === 1 && { marginLeft: 20 },
        item.id === 9 && { marginRight: 20 },
        isSelected && { backgroundColor: themeColor.tint },
      ]}
      onPress={onPressCondition}
    >
      {getIcon(
        item.condition,
        26,
        isSelected ? themeColor.onTint : themeColor.tintText
      )}
      <Text
        style={[
          styles.text,
          { color: themeColor.tintText },
          isSelected && { color: themeColor.onTint },
        ]}
      >
        {tCondition(item.condition, lang)}
      </Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  icon: {
    alignSelf: "flex-start",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    width: 50,
    height: 50,
    borderRadius: 50,
    gap: 0.5,
    marginLeft: 10,
  },

  rowIcon: {
    borderWidth: 2,
    alignSelf: "flex-start",

    borderRadius: 50,
    paddingLeft: 2,
    paddingRight: 6,
    paddingVertical: 2,
    flexDirection: "row",
    gap: 2,
    alignItems: "center",
    marginRight: 6,
    marginBottom: 5,
  },
  rowText: {
    fontSize: 10,
    fontFamily: "sb-l",
  },

  text: {
    fontSize: 8,
  },
})
