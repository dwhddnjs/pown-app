import React from "react"
// component
import { StyleSheet } from "react-native"
import { Text, View } from "../Themed"
import { LineChart } from "react-native-gifted-charts"
// hook
import useCurrneThemeColor from "@/hooks/use-current-theme-color"

const BodyChart = () => {
  const themeColor = useCurrneThemeColor()

  const ptData = [
    { id: 1, value: 120, date: "1 Apr 2022" },
    { id: 2, value: 119, date: "2 Apr 2022" },
    { id: 3, value: 117, date: "3 Apr 2022" },
    { id: 4, value: 115, date: "4 Apr 2022" },
    { id: 5, value: 113, date: "5 Apr 2022" },
    { id: 6, value: 111, date: "6 Apr 2022" },
    { id: 7, value: 109, date: "7 Apr 2022" },
    { id: 8, value: 107, date: "8 Apr 2022" },
    { id: 9, value: 106, date: "9 Apr 2022" },
    { id: 10, value: 105, date: "10 Apr 2022" },
    { id: 11, value: 104, date: "11 Apr 2022" },
    { id: 12, value: 103, date: "12 Apr 2022" },
    { id: 13, value: 100, date: "13 Apr 2022" },
    { id: 14, value: 98, date: "14 Apr 2022" },
    { id: 15, value: 97, date: "15 Apr 2022" },
    { id: 16, value: 95, date: "16 Apr 2022" },
    { id: 17, value: 93, date: "17 Apr 2022" },
    { id: 18, value: 92, date: "18 Apr 2022" },
    { id: 19, value: 90, date: "19 Apr 2022" },
    { id: 20, value: 90, date: "20 Apr 2022" },
    { id: 21, value: 95, date: "21 Apr 2022" },
    { id: 22, value: 96, date: "22 Apr 2022" },
    { id: 23, value: 97, date: "23 Apr 2022" },
    { id: 24, value: 100, date: "24 Apr 2022" },
    { id: 25, value: 99, date: "25 Apr 2022" },
    { id: 26, value: 95, date: "26 Apr 2022" },
    { id: 27, value: 93, date: "27 Apr 2022" },
    { id: 28, value: 90, date: "28 Apr 2022" },
    { id: 29, value: 89, date: "29 Apr 2022" },
    { id: 30, value: 87, date: "30 Apr 2022" },
    { id: 31, value: 85, date: "31 Apr 2022" },
  ]

  return (
    <View style={[styles(themeColor).container]}>
      <Text style={{ fontSize: 18, paddingHorizontal: 18, paddingTop: 18 }}>
        몸무게의 변화
      </Text>
      <View
        style={{
          height: 1,
          backgroundColor: themeColor.tabIconDefault,
          marginHorizontal: 18,
        }}
      />
      <View
        style={{
          backgroundColor: themeColor.itemColor,
          paddingVertical: 4,
          paddingLeft: 10,
        }}
      >
        <LineChart
          disableScroll
          areaChart
          data={ptData}
          rotateLabel
          width={310}
          hideDataPoints
          spacing={10}
          color={themeColor.tint}
          thickness={2}
          startFillColor={themeColor.pressed}
          endFillColor={themeColor.itemColor}
          startOpacity={0.9}
          endOpacity={0.2}
          initialSpacing={0}
          noOfSections={5}
          maxValue={200}
          hideRules
          yAxisTextStyle={{ color: themeColor.text }}
          yAxisThickness={0}
          xAxisColor={themeColor.subText}
          xAxisThickness={0}
          yAxisColor={themeColor.subText}
          xAxisLabelTextStyle={{
            textAlign: "center",
            fontFamily: "sb-l",
          }}
          pointerConfig={{
            pointerStripHeight: 160,
            pointerStripColor: themeColor.subText,
            pointerStripWidth: 1,
            pointerColor: themeColor.tint,
            radius: 6,
            pointerLabelWidth: 100,
            activatePointersOnLongPress: true,
            // autoAdjustPointerLabelPosition: true,

            pointerLabelComponent: (items: any, index: number) => {
              console.log("index: ", items)
              return (
                <View
                  style={{
                    borderRadius: 8,
                    backgroundColor: themeColor.background,
                    padding: 6,
                    gap: 4,
                    position: "absolute",
                    left: items[0].id >= 21 ? -60 : 5,
                    top: 4,
                    borderColor: themeColor.subText,
                  }}
                >
                  <Text style={{ fontSize: 10 }}>{items[0].date}</Text>
                  <Text style={{ fontWeight: "bold", color: themeColor.tint }}>
                    {items[0].value + "kg"}
                  </Text>
                </View>
              )
            },
          }}
        />
      </View>
    </View>
  )
}

export default BodyChart

const styles = (color: any) =>
  StyleSheet.create({
    container: {
      backgroundColor: color.itemColor,
      paddingBottom: 18,
      borderRadius: 12,
      gap: 12,
    },
  })
