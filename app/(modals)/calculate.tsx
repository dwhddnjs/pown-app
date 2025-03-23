import React, { useRef, useState } from "react"
// component
import { Text, View } from "@/components/Themed"
import {
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from "react-native"
// hook
import useCurrneThemeColor from "@/hooks/use-current-theme-color"

export default function calculate() {
  const themeColor = useCurrneThemeColor()
  const [selected, setSelected] = useState("kg")
  const [inputNumber, setInputNumber] = useState("0")

  const generatePercentageValues = (input: string) => {
    const num = parseFloat(input)
    if (isNaN(num)) return []

    return Array.from({ length: 22 }, (_, i) => {
      const percent = 110 - i * 5
      const percentText = () => {
        if (percent === 110) {
          return `💪🏻 + 10%`
        }
        if (percent === 105) {
          return `💪🏻 + 5%`
        }
        if (percent === 100) {
          return `💪🏻`
        }
        return `${percent}%`
      }

      return {
        title: percentText(),
        value: `${Math.round((num * percent) / 100).toString()}${
          selected === "kg" ? "kg" : "lb"
        }`,
      }
    })
  }

  const onSelectedTab = (type: "lb" | "kg") => {
    const num = parseFloat(inputNumber)
    if (type === "lb") {
      const pound = Math.round(num * 2.20462).toString()
      setSelected("lb")
      setInputNumber(String(pound))
    } else {
      const kg = Math.round(num / 2.20462).toString()
      setSelected("kg")
      setInputNumber(String(kg))
    }
  }

  return (
    <View style={{ flex: 1 }}>
      <View style={styles(themeColor).tabContainer}>
        <TouchableOpacity
          onPress={() => onSelectedTab("kg")}
          style={[
            styles(themeColor).tabItem,
            {
              backgroundColor:
                selected === "kg" ? themeColor.tint : themeColor.background,
            },
          ]}
        >
          <Text style={{ textAlign: "center" }}>킬로그램/kg</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => onSelectedTab("lb")}
          style={[
            styles(themeColor).tabItem,
            {
              backgroundColor:
                selected === "lb" ? themeColor.tint : themeColor.background,
            },
          ]}
        >
          <Text style={{ textAlign: "center" }}>파운드/lb</Text>
        </TouchableOpacity>
      </View>
      <View style={styles(themeColor).inputContainer}>
        <TextInput
          keyboardType="numeric"
          placeholder="0"
          textAlign="right"
          style={styles(themeColor).input}
          value={inputNumber}
          onChangeText={(value) => setInputNumber(value === "" ? "0" : value)}
          placeholderTextColor={themeColor.text}
          returnKeyType="done"
        />
        <Text style={{ fontSize: 18 }}>{selected === "kg" ? "kg" : "lb"}</Text>
      </View>

      <ScrollView
        scrollEventThrottle={16}
        contentContainerStyle={{
          paddingHorizontal: 20,
        }}
      >
        {generatePercentageValues(inputNumber).map((item) => (
          <View style={styles(themeColor).listItem}>
            <Text style={{ fontSize: 16, color: themeColor.text }}>
              {item.title}
            </Text>
            <Text style={{ fontSize: 16, color: themeColor.tint }}>
              {item.value}
            </Text>
          </View>
        ))}
      </ScrollView>
      <View style={{ height: 100 }} />
    </View>
  )
}

const styles = (color: any) =>
  StyleSheet.create({
    tabContainer: {
      borderWidth: 2,
      borderColor: color.tint,
      padding: 6,
      borderRadius: 12,
      flexDirection: "row",
      marginHorizontal: 20,
    },
    tabItem: {
      flex: 1,
      height: 36,
      borderRadius: 6,
      justifyContent: "center",
    },
    inputContainer: {
      flexDirection: "row",
      alignItems: "center",
      gap: 2,
      paddingVertical: 24,
      paddingHorizontal: 20,
      borderBottomWidth: 1,
      borderColor: color.itemColor,
    },
    input: {
      fontSize: 36,
      color: color.text,
      justifyContent: "flex-end",
      fontFamily: "sb-m",
      flex: 1,
    },
    listItem: {
      borderBottomWidth: 1,
      flexDirection: "row",
      justifyContent: "space-between",
      borderColor: color.itemColor,
      paddingVertical: 20,
    },
  })
