import { StyleSheet, TouchableOpacity } from "react-native"
import { Text, View } from "../Themed"
import { Octicons } from "@expo/vector-icons"
import Colors from "@/constants/Colors"
import { Button } from "../Button"
import { IconTitle } from "../IconTitle"
import { usePlanStore } from "@/hooks/use-plan-store"

interface SetCounterProps {
  onOpen: () => void
}

export const SetCounter = ({ onOpen }: SetCounterProps) => {
  const { set, count } = usePlanStore()

  return (
    <View style={styles.container}>
      <IconTitle>
        <Octicons name="number" size={20} color={Colors.dark.tint} />
        <Text style={{ fontSize: 16 }}>세트와 횟수</Text>
      </IconTitle>
      {set && count ? (
        <TouchableOpacity style={styles.selected} onPress={onOpen}>
          <Text style={styles.selectedText}>{`${set} 세트 x ${count} 회`}</Text>
        </TouchableOpacity>
      ) : (
        <Button type="bordered" onPress={onOpen}>
          선택하기
        </Button>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
    gap: 10,
  },
  selected: {
    paddingVertical: 14,
    marginHorizontal: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.dark.subText,
    backgroundColor: Colors.dark.itemColor,
  },
  selectedText: {
    fontSize: 16,
    fontFamily: "sb-m",
    textAlign: "center",
    color: Colors.dark.tint,
  },
})
