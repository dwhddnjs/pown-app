import { StyleSheet, TouchableOpacity } from "react-native"
import { Text, View } from "../Themed"
import { Octicons } from "@expo/vector-icons"
import Colors from "@/constants/Colors"
import { Button } from "../Button"
import { IconTitle } from "../IconTitle"
import { usePlanStore } from "@/hooks/use-plan-store"
import { SetCounterItem } from "./set-counter-item"

interface SetCounterProps {
  onOpen: () => void
}

export const SetCounter = ({ onOpen }: SetCounterProps) => {
  const { setWithCount } = usePlanStore()

  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        <IconTitle style={{ paddingLeft: 24 }}>
          <Octicons name="number" size={20} color={Colors.dark.tint} />
          <Text style={{ fontSize: 16 }}>세트와 횟수</Text>
        </IconTitle>
        <Text style={styles.subText}>(선택)</Text>
      </View>
      <Button type="bordered" onPress={onOpen}>
        선택하기
      </Button>
      {setWithCount.length > 0 && (
        <View style={{ gap: 8 }}>
          {setWithCount.map((item, index) => (
            <SetCounterItem key={item.id} item={item} index={index} />
          ))}
        </View>
      )}

      {/* {set && count ? (
        <TouchableOpacity style={styles.selected} onPress={onOpen}>
          <Text style={styles.selectedText}>{`${set} 세트 x ${count} 회`}</Text>
        </TouchableOpacity>
      ) : (
        <Button type="bordered" onPress={onOpen}>
          선택하기
        </Button>
      )} */}
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
  subText: {
    fontFamily: "sb-l",
    color: Colors.dark.tint,
    fontSize: 12,
  },
  titleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingRight: 24,
    alignItems: "flex-end",
  },
})
