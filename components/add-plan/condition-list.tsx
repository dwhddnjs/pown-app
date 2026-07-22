import React from "react"
// component
import { StyleSheet, FlatList } from "react-native"
import { Text, View } from "../themed"
import { ConditionIcon } from "@/components/add-plan/condition-icon"
import { IconTitle } from "../icon-title"
// color
// lib
import { conditionData } from "@/constants/constants"
// icon
import BatteryIcon from "@expo/vector-icons/MaterialCommunityIcons"
// hook
import useCurrentThemeColor from "@/hooks/use-current-theme-color"
import { useT } from "@/hooks/use-t"

export const ConditionList = () => {
  const themeColor = useCurrentThemeColor()
  const t = useT()
  return (
    <View style={styles.main}>
      <View style={styles.titleContainer}>
        <IconTitle style={{ gap: 7, paddingLeft: 20 }}>
          <BatteryIcon
            name="battery-heart-variant"
            size={20}
            color={themeColor.tintText}
          />
          <Text style={{ fontSize: 16 }}>{t("plan.condition")}</Text>
        </IconTitle>
        <Text style={[styles.subText, { color: themeColor.tintText }]}>{t("common.optional")}</Text>
      </View>
      <View style={styles.container}>
        <FlatList
          data={conditionData}
          horizontal
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
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
