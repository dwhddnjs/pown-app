import {
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  FlatList,
} from "react-native"
import React from "react"
import { Text, View } from "../Themed"
import EmotionIcon from "@expo/vector-icons/MaterialIcons"
import { FlashList } from "@shopify/flash-list"
import { ConditionIcon } from "@/components/add-plan/condition-icon"
import Colors from "@/constants/Colors"
import { IconTitle } from "../IconTitle"
import { conditionData } from "@/constants/constants"
import { usePlanStore } from "@/hooks/use-plan-store"
import BatteryIcon from "@expo/vector-icons/MaterialCommunityIcons"

export const ConditionList = () => {
  const colorScheme = useColorScheme()
  return (
    <View style={styles.main}>
      <View style={styles.titleContainer}>
        <IconTitle style={{ gap: 7, paddingLeft: 24 }}>
          <BatteryIcon
            name="battery-heart-variant"
            size={20}
            color={Colors[colorScheme ?? "light"].tint}
          />
          <Text style={{ fontSize: 16 }}>지금 컨디션</Text>
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
      <View style={styles.container}>
        <FlatList
          data={conditionData}
          horizontal
          renderItem={({ item, index }) => (
            <ConditionIcon item={item} type="column" />
          )}
          // estimatedItemSize={65}
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  main: {
    paddingVertical: 12,
    gap: 10,
  },

  container: {
    width: "100%",
    height: 65,
    alignItems: "center",
  },

  subText: {
    fontFamily: "sb-l",
    fontSize: 12,
  },
  titleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingRight: 24,
    alignItems: "flex-end",
  },
})
