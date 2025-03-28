//component
import { StyleSheet, TouchableOpacity, useColorScheme } from "react-native"
import { Text, View } from "@/components/Themed"
// zustand
import { usePlanStore } from "@/hooks/use-plan-store"
// hook
import useCurrneThemeColor from "@/hooks/use-current-theme-color"
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
  type: "column" | "row"
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

export const ConditionIcon = ({ item, type }: ConditionIconProps) => {
  const { condition, setCondition, setFilterCondition } = usePlanStore()
  const themeColor = useCurrneThemeColor()

  const onPressCondition = () => {
    if (condition.includes(item.condition)) {
      setFilterCondition(item.condition)
      return
    }
    setCondition(item.condition)
  }

  const renderComponent = {
    column: (
      <TouchableOpacity
        style={[
          styles.icon,
          { borderColor: themeColor.tint },
          item.id === 1 && { marginLeft: 20 },
          item.id === 9 && { marginRight: 20 },
          condition.includes(item.condition) && {
            backgroundColor: themeColor.tint,
          },
        ]}
        key={item.id}
        onPress={onPressCondition}
      >
        {getIcon(
          item.condition,
          26,
          condition.includes(item.condition)
            ? themeColor.background
            : themeColor.tint
        )}
        <Text
          style={[
            styles.text,
            { color: themeColor.tint },
            condition.includes(item.condition) && {
              color: themeColor.background,
            },
          ]}
        >
          {item.condition}
        </Text>
      </TouchableOpacity>
    ),
    row: (
      <View
        style={[
          styles.rowIcon,
          {
            backgroundColor: themeColor.itemColor,
            borderColor: themeColor.tint,
          },
        ]}
        key={item.id}
      >
        {getIcon(item.condition, 16, themeColor.tint)}
        <Text style={[styles.rowText, { color: themeColor.tint }]}>
          {item.condition}
        </Text>
      </View>
    ),
  }

  return renderComponent[type]
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
