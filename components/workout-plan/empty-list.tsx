import { Image } from "react-native"
import React from "react"
import { Text, View } from "../Themed"
import useCurrentThemeColor from "@/hooks/use-current-theme-color"

export const EmptyList = () => {
  const themeColor = useCurrentThemeColor()
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
      <Text
        style={{
          color: themeColor.subText,
          fontSize: 18,
          textAlign: "center",
          lineHeight: 24,
        }}
      >
        운동계획이 없습니다. {"\n"}추가해주세요!
      </Text>
    </View>
  )
}
