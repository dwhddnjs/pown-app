import React from "react"
// component
import { StyleSheet } from "react-native"
import { Text, View } from "../Themed"
// hook
import useCurrneThemeColor from "@/hooks/use-current-theme-color"
// data
import { conditionData } from "@/constants/constants"
// lib
import { getIcon } from "../add-plan/condition-icon"

const ConditionCount = () => {
  const themeColor = useCurrneThemeColor()
  return (
    <View style={styles(themeColor).container}>
      <Text style={{ fontSize: 18 }}>컨비션 별 횟수</Text>
      <View style={{ height: 1, backgroundColor: themeColor.tabIconDefault }} />
      <View style={[styles(themeColor).iconListContainer]}>
        {conditionData.map((item) => (
          <View style={styles(themeColor).iconItem}>
            {getIcon(item.condition, 36, themeColor.tint)}
            <Text style={styles(themeColor).iconText}>{item.condition}</Text>
          </View>
        ))}
      </View>
    </View>
  )
}

export default ConditionCount

const styles = (color: any) =>
  StyleSheet.create({
    container: {
      backgroundColor: color.itemColor,
      padding: 18,
      borderRadius: 12,
      gap: 12,
    },
    iconListContainer: {
      backgroundColor: color.itemColor,
      justifyContent: "center",
      alignItems: "center",
      flexDirection: "row",
      gap: 8,
      paddingVertical: 4,
      flexWrap: "wrap",
    },
    iconItem: {
      backgroundColor: color.itemColor,
      justifyContent: "center",
      alignItems: "center",
      minWidth: 48,
    },
    iconText: {
      color: color.tint,
      fontSize: 12,
      fontFamily: "sb-l",
    },
  })
