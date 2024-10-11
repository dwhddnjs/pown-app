import GoodIcon from "@expo/vector-icons/MaterialCommunityIcons"
import Colors from "../../constants/Colors"
import TiredIcon from "@expo/vector-icons/MaterialCommunityIcons"
import AngryIcon from "@expo/vector-icons/MaterialCommunityIcons"
import SickIcon from "@expo/vector-icons/MaterialCommunityIcons"
import SadIcon from "@expo/vector-icons/MaterialCommunityIcons"
import LolIcon from "@expo/vector-icons/MaterialCommunityIcons"
import CoolIcon from "@expo/vector-icons/MaterialCommunityIcons"
import NeutralIcon from "@expo/vector-icons/MaterialCommunityIcons"
import AnoyIcon from "@expo/vector-icons/MaterialCommunityIcons"
import { StyleSheet, TouchableOpacity } from "react-native"
import { Text } from "@/components/Themed"
import { usePlanStore } from "@/hooks/use-plan-store"

interface ConditionIconProps {
  item: {
    id: number
    condition: string
  }
}

export const ConditionIcon = ({ item }: ConditionIconProps) => {
  const { condition, setCondition, setFilterCondition } = usePlanStore()

  const onPressCondition = () => {
    if (condition.includes(item.condition)) {
      setFilterCondition(item.condition)
      return
    }
    setCondition(item.condition)
  }

  const getIcon = (value: string) => {
    let result
    switch (value) {
      case "좋음":
        result = (
          <GoodIcon
            name="emoticon"
            size={26}
            color={
              condition.includes(value)
                ? Colors.dark.background
                : Colors.dark.tint
            }
          />
        )
        break
      case "피곤함":
        result = (
          <TiredIcon
            name="emoticon-dead"
            size={26}
            color={
              condition.includes(value)
                ? Colors.dark.background
                : Colors.dark.tint
            }
          />
        )
        break
      case "화남":
        result = (
          <AngryIcon
            name="emoticon-angry"
            size={26}
            color={
              condition.includes(value)
                ? Colors.dark.background
                : Colors.dark.tint
            }
          />
        )
        break
      case "아픔":
        result = (
          <SickIcon
            name="emoticon-sick"
            size={26}
            color={
              condition.includes(value)
                ? Colors.dark.background
                : Colors.dark.tint
            }
          />
        )
        break
      case "슬픔":
        result = (
          <SadIcon
            name="emoticon-cry"
            size={26}
            color={
              condition.includes(value)
                ? Colors.dark.background
                : Colors.dark.tint
            }
          />
        )
        break
      case "신남":
        result = (
          <SadIcon
            name="emoticon-cry"
            size={26}
            color={
              condition.includes(value)
                ? Colors.dark.background
                : Colors.dark.tint
            }
          />
        )
        break
      case "상쾌함":
        result = (
          <LolIcon
            name="emoticon-lol"
            size={26}
            color={
              condition.includes(value)
                ? Colors.dark.background
                : Colors.dark.tint
            }
          />
        )
        break
      case "양호함":
        result = (
          <NeutralIcon
            name="emoticon-neutral"
            size={26}
            color={
              condition.includes(value)
                ? Colors.dark.background
                : Colors.dark.tint
            }
          />
        )
        break
      default:
        result = (
          <AnoyIcon
            name="emoticon-sad"
            size={26}
            color={
              condition.includes(value)
                ? Colors.dark.background
                : Colors.dark.tint
            }
          />
        )
        break
    }
    return result
  }

  return (
    <TouchableOpacity
      style={[
        styles.icon,
        item.id === 1 && { marginLeft: 24 },
        item.id === 9 && { marginRight: 24 },
        condition.includes(item.condition) && {
          backgroundColor: Colors.dark.tint,
        },
      ]}
      key={item.id}
      onPress={onPressCondition}
    >
      {getIcon(item.condition)}
      <Text
        style={[
          styles.text,
          condition.includes(item.condition) && {
            color: Colors.dark.background,
          },
        ]}
      >
        {item.condition}
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
    borderColor: Colors.dark.tint,
    // backgroundColor: Colors.dark.tint,
    width: 50,
    height: 50,
    borderRadius: 50,
    gap: 0.5,
    marginLeft: 10,
  },
  text: {
    fontSize: 8,
    color: Colors.dark.tint,
  },
})
