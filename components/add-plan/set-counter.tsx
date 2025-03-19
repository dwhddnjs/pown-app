import { StyleSheet, TouchableOpacity, useColorScheme } from "react-native"
import { Text, View } from "../Themed"
import { Octicons } from "@expo/vector-icons"
import Colors from "@/constants/Colors"
import { Button } from "../Button"
import { IconTitle } from "../IconTitle"
import { usePlanStore } from "@/hooks/use-plan-store"
import { SetCounterItem } from "./set-counter-item"
import { useRef, useState } from "react"
import { InputRefObject } from "@/app/add-plan/[slug]"

interface SetCounterProps {
  onOpen: () => void
  onFocus: (value: InputRefObject) => void
}

export const SetCounter = ({ onOpen, onFocus }: SetCounterProps) => {
  const { setWithCount } = usePlanStore()
  const colorScheme = useColorScheme()
  const [layout, setLayout] = useState(0)

  return (
    <View
      style={styles.container}
      onLayout={(e) => setLayout(e.nativeEvent.layout.y)}
    >
      <View style={styles.titleContainer}>
        <IconTitle style={{ paddingLeft: 20 }}>
          <Octicons
            name="number"
            size={20}
            color={Colors[colorScheme ?? "light"].tint}
          />
          <Text style={{ fontSize: 16 }}>세트와 횟수</Text>
        </IconTitle>
        <Text
          style={[
            styles.subText,
            { color: Colors[colorScheme ?? "light"].tint },
          ]}
        >
          (선택)
        </Text>
      </View>
      <Button
        type="bordered"
        onPress={(e) => {
          onOpen()
          onFocus(e.target)
        }}
      >
        선택하기
      </Button>
      {setWithCount.length > 0 && (
        <View style={{ gap: 8 }}>
          {setWithCount?.map((item, index) => (
            <SetCounterItem key={item.id} item={item} index={index} />
          ))}
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
    gap: 10,
  },

  subText: {
    fontFamily: "sb-l",
    fontSize: 12,
  },
  titleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingRight: 20,
    alignItems: "flex-end",
  },
})
