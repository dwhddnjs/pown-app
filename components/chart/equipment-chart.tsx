import React from "react"
// component
import { StyleSheet } from "react-native"
import { Text, View } from "../Themed"
import { BarChart, ruleTypes, yAxisSides } from "react-native-gifted-charts"
// hook
import useCurrneThemeColor from "@/hooks/use-current-theme-color"
import { getEquipmentCount } from "@/lib/function"
import { useMonthlyPlanData } from "@/hooks/use-monthly-plan-data"
import { useChartStore } from "@/hooks/use-chart-store"
import InfoIcon from "@expo/vector-icons/FontAwesome6"

const EquipmentChart = () => {
  const themeColor = useCurrneThemeColor()
  const { date } = useChartStore()
  const { monthlyPlanData } = useMonthlyPlanData(date)
  const equipmentCount = getEquipmentCount(monthlyPlanData)

  const isEmptyCount =
    (Object.values(equipmentCount) as number[]).reduce(
      (acc: number, cur: number) => acc + cur
    ) === 0

  const barData1 = [
    {
      value: equipmentCount.babel,
      label: "바벨",
      frontColor: themeColor.tint,
    },
    {
      value: equipmentCount.dumbel,
      label: "덤벨",
      frontColor: themeColor.tint,
    },
    {
      value: equipmentCount.machine,
      label: "머신",
      frontColor: themeColor.tint,
    },
    {
      value: equipmentCount.smith,
      label: "스미스",
      frontColor: themeColor.tint,
    },
    {
      value: equipmentCount.cable,
      label: "케이블",
      frontColor: themeColor.tint,
    },
    {
      value: equipmentCount.body,
      label: "맨몸",
      frontColor: themeColor.tint,
    },
  ]

  return (
    <View style={styles(themeColor).container}>
      <Text style={{ fontSize: 18 }}>주로 뭐로 운동했지?</Text>
      <View
        style={{
          height: 1,
          backgroundColor: themeColor.tabIconDefault,
        }}
      />
      {isEmptyCount ? (
        <View style={[styles(themeColor).emptyContainer]}>
          <InfoIcon name="circle-info" size={16} color={themeColor.subText} />
          <Text
            style={{
              color: themeColor.subText,
            }}
          >
            기록된 운동장비 데이터가 없습니다.
          </Text>
        </View>
      ) : (
        <View
          style={{
            overflow: "hidden",
            backgroundColor: themeColor.itemColor,
            paddingVertical: 4,
          }}
        >
          <BarChart
            barWidth={24}
            noOfSections={5}
            barBorderRadius={4}
            frontColor={themeColor.subText}
            disableScroll
            data={barData1}
            shiftY={10}
            sideWidth={15}
            yAxisThickness={1}
            xAxisThickness={1}
            yAxisColor={themeColor.subText}
            xAxisColor={themeColor.subText}
            rulesColor={themeColor.subText}
            barInnerComponent={(item) => (
              <Text
                style={{ textAlign: "center", fontSize: 10, paddingTop: 2 }}
              >
                {item?.value}
              </Text>
            )}
            xAxisLabelTextStyle={{
              color: themeColor.text,
              fontWeight: "bold",
              fontFamily: "sb-l",
            }}
            yAxisTextStyle={{
              color: themeColor.text,
              fontWeight: "bold",
              fontFamily: "sb-l",
            }}
          />
        </View>
      )}
    </View>
  )
}

export default EquipmentChart

const styles = (color: any) =>
  StyleSheet.create({
    container: {
      backgroundColor: color.itemColor,
      paddingVertical: 20,
      paddingHorizontal: 12,
      borderRadius: 12,
      gap: 12,
      overflow: "hidden",
    },
    iconListContainer: {
      backgroundColor: color.itemColor,
      justifyContent: "center",
      alignItems: "center",
      flexDirection: "row",
      gap: 9,
      paddingVertical: 4,
      flexWrap: "wrap",
    },
    iconItem: {
      backgroundColor: color.itemColor,
      justifyContent: "center",
      alignItems: "center",
      minWidth: 54,
      position: "relative",
    },
    iconText: {
      color: color.tint,
      fontSize: 10,
      fontFamily: "sb-l",
    },
    numberCount: {
      width: 18,
      height: 18,
      justifyContent: "center",
      alignItems: "center",
      borderRadius: 50,
      backgroundColor: color.subText,
      position: "absolute",
      top: -2,
      left: -2,
      zIndex: 1,
    },
    emptyContainer: {
      flexDirection: "row",
      paddingVertical: 12,
      paddingHorizontal: 4,
      gap: 6,
      backgroundColor: color.itemColor,
    },
  })
