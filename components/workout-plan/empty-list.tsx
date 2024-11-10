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
        안되는 이유를 누군가 설명해줬으면 함
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({})
