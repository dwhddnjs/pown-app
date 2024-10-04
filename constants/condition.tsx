import GoodIcon from "@expo/vector-icons/MaterialCommunityIcons"
import Colors from "./Colors"
import TiredIcon from "@expo/vector-icons/MaterialCommunityIcons"
import AngryIcon from "@expo/vector-icons/MaterialCommunityIcons"
import SickIcon from "@expo/vector-icons/MaterialCommunityIcons"
import SadIcon from "@expo/vector-icons/MaterialCommunityIcons"
import LolIcon from "@expo/vector-icons/MaterialCommunityIcons"
import CoolIcon from "@expo/vector-icons/MaterialCommunityIcons"
import NeutralIcon from "@expo/vector-icons/MaterialCommunityIcons"
import AnoyIcon from "@expo/vector-icons/MaterialCommunityIcons"

export const condition = [
  {
    id: 1,
    condition: "좋음",
    Icon: (
      <GoodIcon name="emoticon-outline" size={26} color={Colors.dark.tint} />
    ),
  },
  {
    id: 2,
    condition: "피곤함",
    Icon: (
      <TiredIcon
        name="emoticon-dead-outline"
        size={26}
        color={Colors.dark.tint}
      />
    ),
  },
  {
    id: 3,
    condition: "화남",
    Icon: (
      <AngryIcon
        name="emoticon-angry-outline"
        size={26}
        color={Colors.dark.tint}
      />
    ),
  },
  {
    id: 4,
    condition: "아픔",
    Icon: (
      <SickIcon
        name="emoticon-sick-outline"
        size={26}
        color={Colors.dark.tint}
      />
    ),
  },
  {
    id: 5,
    condition: "슬픔",
    Icon: (
      <SadIcon name="emoticon-cry-outline" size={26} color={Colors.dark.tint} />
    ),
  },
  {
    id: 6,
    condition: "신남",
    Icon: (
      <LolIcon name="emoticon-lol-outline" size={26} color={Colors.dark.tint} />
    ),
  },
  {
    id: 7,
    condition: "상쾌함",
    Icon: (
      <CoolIcon
        name="emoticon-cool-outline"
        size={26}
        color={Colors.dark.tint}
      />
    ),
  },
  {
    id: 8,
    condition: "양호함",
    Icon: (
      <NeutralIcon
        name="emoticon-neutral-outline"
        size={26}
        color={Colors.dark.tint}
      />
    ),
  },
  {
    id: 8,
    condition: "짜증남",
    Icon: (
      <AnoyIcon
        name="emoticon-sad-outline"
        size={26}
        color={Colors.dark.tint}
      />
    ),
  },
]
