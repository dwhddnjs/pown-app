import { StyleSheet } from "react-native"
import React from "react"
import useCurrneThemeColor from "@/hooks/use-current-theme-color"
import { Text, View } from "../Themed"
import { BarChart, ruleTypes } from "react-native-gifted-charts"

const SbdChart = () => {
  const themeColor = useCurrneThemeColor()
  const data = [
    {
      value: 2500,
      frontColor: "#006DFF",
      gradientColor: "#009FFF",
      spacing: 6,
      label: "Jan",
    },
    { value: 2400, frontColor: "#3BE9DE", gradientColor: "#93FCF8" },

    {
      value: 3500,
      frontColor: "#006DFF",
      gradientColor: "#009FFF",
      spacing: 6,
      label: "Feb",
    },
    { value: 3000, frontColor: "#3BE9DE", gradientColor: "#93FCF8" },

    {
      value: 4500,
      frontColor: "#006DFF",
      gradientColor: "#009FFF",
      spacing: 6,
      label: "Mar",
    },
    { value: 4000, frontColor: "#3BE9DE", gradientColor: "#93FCF8" },

    {
      value: 5200,
      frontColor: "#006DFF",
      gradientColor: "#009FFF",
      spacing: 6,
      label: "Apr",
    },
    { value: 4900, frontColor: "#3BE9DE", gradientColor: "#93FCF8" },

    {
      value: 3000,
      frontColor: "#006DFF",
      gradientColor: "#009FFF",
      spacing: 6,
      label: "May",
    },
    { value: 2800, frontColor: "#3BE9DE", gradientColor: "#93FCF8" },
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
          data={data}
          barWidth={16}
          initialSpacing={10}
          spacing={14}
          barBorderRadius={4}
          showGradient
          yAxisThickness={0}
          xAxisType={ruleTypes.DASHED}
          xAxisColor={"lightgray"}
          yAxisTextStyle={{ color: "lightgray" }}
          stepValue={1000}
          maxValue={6000}
          noOfSections={6}
          yAxisLabelTexts={["0", "1k", "2k", "3k", "4k", "5k", "6k"]}
          labelWidth={40}
          xAxisLabelTextStyle={{ color: "lightgray", textAlign: "center" }}
          showLine
          lineConfig={{
            color: "#F29C6E",
            thickness: 3,
            curved: true,
            hideDataPoints: true,
            shiftY: 20,
            initialSpacing: -30,
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
      padding: 18,
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
