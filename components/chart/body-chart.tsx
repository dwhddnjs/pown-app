import React from "react"
// component
import { StyleSheet } from "react-native"
import { Text, View } from "../Themed"
import { LineChart } from "react-native-gifted-charts"
// hook
import useCurrneThemeColor from "@/hooks/use-current-theme-color"
import { useUserStore } from "@/hooks/use-user-store"
import { useChartStore } from "@/hooks/use-chart-store"
// lib
import { getMonthlyBodyData } from "@/lib/function"
import InfoIcon from "@expo/vector-icons/FontAwesome6"

const BodyChart = () => {
  const themeColor = useCurrneThemeColor()
  const { userInfo } = useUserStore()
  const { date } = useChartStore()
  const monthUserInfo = userInfo.filter((item) => {
    const getYear = item.createdAt.slice(0, 4)
    const getMonth = item.createdAt.slice(5, 7)
    const selectedYear = date.slice(0, 4)
    const selectedMonth = date.slice(4, 7)
    return getYear === selectedYear && getMonth === selectedMonth
  })

  const ptData2 = getMonthlyBodyData(monthUserInfo, date)
  // console.log("ptData2: ", ptData2)

  const isEmptyData =
    ptData2
      .map((item: (typeof ptData2)[0]) => item.value)
      .reduce((acc: number, cur: number) => acc + cur, 0) === 0

  return (
    <View style={[styles(themeColor).container]}>
      <Text style={{ fontSize: 18, paddingHorizontal: 12, paddingTop: 20 }}>
        몸무게의 변화
      </Text>
      <View
        style={{
          height: 1,
          backgroundColor: themeColor.tabIconDefault,
          marginHorizontal: 12,
        }}
      />
      {isEmptyData ? (
        <View style={[styles(themeColor).emptyContainer]}>
          <InfoIcon name="circle-info" size={16} color={themeColor.subText} />
          <Text
            style={{
              color: themeColor.subText,
            }}
          >
            기록된 몸무게 데이터가 없습니다.
          </Text>
        </View>
      ) : (
        <View
          style={{
            backgroundColor: themeColor.itemColor,
            paddingVertical: 4,
            paddingLeft: 12,
          }}
        >
          <LineChart
            disableScroll
            areaChart
            data={ptData2}
            rotateLabel
            // maxValue={ptData2[ptData2.length - 1]?.value + 50}
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
                return (
                  <View
                    style={{
                      borderRadius: 8,
                      backgroundColor: themeColor.background,
                      paddingVertical: 6,
                      paddingHorizontal: 4,
                      gap: 4,
                      position: "absolute",
                      left: items[0].id >= 21 ? -80 : 5,
                      top: 4,
                      borderColor: themeColor.subText,
                    }}
                  >
                    <Text style={{ fontSize: 10 }}>{items[0].date}</Text>
                    <Text
                      style={{ fontWeight: "bold", color: themeColor.tint }}
                    >
                      {items[0].value + "kg"}
                    </Text>
                  </View>
                )
              },
            }}
          />
        </View>
      )}
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
    emptyContainer: {
      flexDirection: "row",
      paddingVertical: 12,
      paddingHorizontal: 16,
      gap: 6,
      backgroundColor: color.itemColor,
    },
  })
