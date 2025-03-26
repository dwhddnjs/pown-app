import React from "react"
// component
import { StyleSheet, useColorScheme, FlatList } from "react-native"
import { Text, View } from "../Themed"
import { ConditionIcon } from "@/components/add-plan/condition-icon"
import { IconTitle } from "../IconTitle"
// color
import Colors from "@/constants/Colors"
// lib
import { conditionData } from "@/constants/constants"
// icon
import BatteryIcon from "@expo/vector-icons/MaterialCommunityIcons"
// hook
import useCurrneThemeColor from "@/hooks/use-current-theme-color"

export const ConditionList = () => {
  const themeColor = useCurrneThemeColor()
  return (
    <View style={styles.main}>
      <View style={styles.titleContainer}>
        <IconTitle style={{ gap: 7, paddingLeft: 20 }}>
          <BatteryIcon
            name="battery-heart-variant"
            size={20}
            color={themeColor.tint}
          />
          <Text style={{ fontSize: 16 }}>지금 컨디션</Text>
        </IconTitle>
        <Text style={[styles.subText, { color: themeColor.tint }]}>(선택)</Text>
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

    alignItems: "center",
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
