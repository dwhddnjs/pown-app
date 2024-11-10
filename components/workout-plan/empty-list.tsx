import { Image, StyleSheet } from "react-native"
import React from "react"
import Colors from "@/constants/Colors"
import { Text, View } from "../Themed"

export const EmptyList = () => {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        gap: 16,
      }}
    >
      <Image
        source={require("@/assets/images/empty.png")}
        style={{ width: 150, height: 200 }}
      />
      <Text style={{ color: Colors.dark.subText, fontSize: 18 }}>
        운동계획이 없습니다. 추가해주세요!
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({})
