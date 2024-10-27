import { StyleSheet, TouchableOpacity } from "react-native"
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
  return (
    <View style={styles.main}>
      <View style={styles.titleContainer}>
        <IconTitle style={{ gap: 7 }}>
          <BatteryIcon
            name="battery-heart-variant"
            size={20}
            color={Colors.dark.tint}
          />
          <Text style={{ fontSize: 16 }}>지금 컨디션</Text>
        </IconTitle>
        <Text style={styles.subText}>(선택)</Text>
      </View>
      <View style={styles.container}>
        <FlashList
          data={conditionData}
          horizontal
          renderItem={({ item, index }) => (
            <ConditionIcon item={item} type="column" />
          )}
          estimatedItemSize={65}
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
