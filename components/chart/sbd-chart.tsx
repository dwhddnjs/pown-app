import React from "react"
// component
import { StyleSheet } from "react-native"
import { Text, View } from "../Themed"
import { BarChart, ruleTypes } from "react-native-gifted-charts"
// hook
import useCurrneThemeColor from "@/hooks/use-current-theme-color"
import { useUserStore } from "@/hooks/use-user-store"
import { useMonthlyPlanData } from "@/hooks/use-monthly-plan-data"
import { useChartStore } from "@/hooks/use-chart-store"

const SbdChart = () => {
  const { userInfo } = useUserStore()
  const { date } = useChartStore()
  const { monthlyUserInfoData } = useMonthlyPlanData(date)
  const firstWeight = userInfo[0]
  const lastestWeight = monthlyUserInfoData[monthlyUserInfoData.length - 1]

  const themeColor = useCurrneThemeColor()
  const data = [
    {
      value: firstWeight?.sq,
      frontColor: themeColor?.subText,
      spacing: 8,
      label: "스쿼트",
    },
    {
      value: lastestWeight?.sq,
      frontColor: themeColor?.tint,
    },
    {
      value: firstWeight?.bp,
      frontColor: themeColor?.subText,
      spacing: 8,
      label: "벤치프레스",
    },
    {
      value: lastestWeight?.bp,
      frontColor: themeColor?.tint,
    },
    {
      value: firstWeight?.dl,
      frontColor: themeColor?.subText,
      spacing: 8,
      label: "데드리프트",
    },
    {
      value: lastestWeight?.dl,
      frontColor: themeColor?.tint,
    },
  ]
  return (
    <View style={[styles(themeColor).container]}>
      <Text style={{ fontSize: 18 }}>3대중량의 변화</Text>
      <View style={{ height: 1, backgroundColor: themeColor.tabIconDefault }} />
      <View
        style={{
          overflow: "hidden",
          backgroundColor: themeColor.itemColor,
          paddingVertical: 4,
        }}
      >
        <BarChart
          data={data as any}
          barWidth={28}
          disableScroll
          barBorderRadius={4}
          yAxisTextStyle={{ color: themeColor.text, fontFamily: "sb-l" }}
          stepValue={50}
          maxValue={300}
          yAxisLabelTexts={["0", "50", "100", "150", "200", "250"]}
          labelWidth={65}
          yAxisThickness={1}
          xAxisThickness={1}
          yAxisColor={themeColor.subText}
          xAxisColor={themeColor.subText}
          rulesColor={themeColor.subText}
          barInnerComponent={(item) => (
            <Text style={{ textAlign: "center", fontSize: 10, paddingTop: 2 }}>
              {item?.value}
            </Text>
          )}
          xAxisLabelTextStyle={{
            color: themeColor.text,
            textAlign: "center",
            fontFamily: "sb-l",
          }}
          showLine
          lineConfig={{
            color: themeColor.success,
            thickness: 3,
            curved: true,
            hideDataPoints: true,
            shiftY: 60,
            initialSpacing: 2,
          }}
        />
      </View>
    </View>
  )
}

export default SbdChart

const styles = (color: any) =>
  StyleSheet.create({
    container: {
      backgroundColor: color.itemColor,
      paddingVertical: 20,
      paddingHorizontal: 12,
      borderRadius: 12,
      gap: 12,
    },
    iconItem: {
      backgroundColor: color.itemColor,
      justifyContent: "space-between",
      alignItems: "center",
      gap: 8,
    },
    iconListContainer: {
      backgroundColor: color.itemColor,
      justifyContent: "space-between",
      alignItems: "center",
      flexDirection: "row",
      gap: 8,
      paddingVertical: 4,
    },
  })

// <Button
//         type="solid"
//         onPress={async () => {
//           AsyncStorage.removeItem("user")
//         }}
//       >
//         asdsdadsa
//       </Button>
