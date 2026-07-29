//component
import { StyleSheet, TouchableOpacity } from "react-native"
import { Text } from "@/components/themed"
// zustand
import { usePlanStore } from "@/hooks/use-plan-store"
// hook
import useCurrentThemeColor from "@/hooks/use-current-theme-color"
import { useLanguage } from "@/hooks/use-user-store"
import { tCondition } from "@/lib/i18n"
// icon
import GoodIcon from "@expo/vector-icons/MaterialCommunityIcons"
import TiredIcon from "@expo/vector-icons/MaterialCommunityIcons"
import AngryIcon from "@expo/vector-icons/MaterialCommunityIcons"
import SickIcon from "@expo/vector-icons/MaterialCommunityIcons"
import SadIcon from "@expo/vector-icons/MaterialCommunityIcons"
import LolIcon from "@expo/vector-icons/MaterialCommunityIcons"
import NeutralIcon from "@expo/vector-icons/MaterialCommunityIcons"
import AnoyIcon from "@expo/vector-icons/MaterialCommunityIcons"
import CoolIcon from "@expo/vector-icons/MaterialCommunityIcons"

interface ConditionIconProps {
  item: {
    id: number
    condition: string
  }
}

export const getIcon = (value: string, size: number, color: string) => {
  let result
  switch (value) {
    case "좋음":
      result = <GoodIcon name="emoticon" size={size} color={color} />
      break
    case "피곤함":
      result = <TiredIcon name="emoticon-dead" size={size} color={color} />
      break
    case "화남":
      result = <AngryIcon name="emoticon-angry" size={size} color={color} />
      break
    case "아픔":
      result = <SickIcon name="emoticon-sick" size={size} color={color} />
      break
    case "슬픔":
      result = <SadIcon name="emoticon-cry" size={size} color={color} />
      break
    case "신남":
      result = <LolIcon name="emoticon-lol" size={size} color={color} />
      break
    case "상쾌함":
      result = <CoolIcon name="emoticon-cool" size={size} color={color} />
      break
    case "양호함":
      result = <NeutralIcon name="emoticon-neutral" size={size} color={color} />
      break
    default:
      result = <AnoyIcon name="emoticon-sad" size={size} color={color} />
      break
  }
  return result
}

// 계획 추가/수정 폼의 선택 가능한 컨디션 버튼. 읽기 전용 태그는
// components/workout-plan/condition-tag.tsx가 담당한다 (폼 스토어를 안 구독한다)
export const ConditionIcon = ({ item }: ConditionIconProps) => {
  const { condition, setCondition, setFilterCondition } = usePlanStore()
  const themeColor = useCurrentThemeColor()
  const lang = useLanguage()
  const selected = condition.includes(item.condition)

  const onPressCondition = () => {
    if (selected) {
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
        selected && { backgroundColor: themeColor.tint },
      ]}
      onPress={onPressCondition}
    >
      {getIcon(
        item.condition,
        26,
        selected ? themeColor.onTint : themeColor.tintText
      )}
      <Text
        style={[
          styles.text,
          { color: themeColor.tintText },
          selected && { color: themeColor.onTint },
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

  text: {
    fontSize: 8,
  },
})
