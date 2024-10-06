import { StyleSheet } from "react-native"
import { Text, View } from "../Themed"
import { Octicons } from "@expo/vector-icons"
import Colors from "@/constants/Colors"
import { Button } from "../Button"
import { IconTitle } from "../IconTitle"

interface SetCounterProps {
  onOpen: () => void
}

export const SetCounter = ({ onOpen }: SetCounterProps) => {
  return (
    <View>
      <IconTitle>
        <Octicons name="number" size={20} color={Colors.dark.tint} />
        <Text style={{ fontSize: 16 }}>세트와 횟수</Text>
      </IconTitle>
      <Button type="bordered" onPress={onOpen}>
        선택하기
      </Button>
    </View>
  )
}

const styles = StyleSheet.create({})
