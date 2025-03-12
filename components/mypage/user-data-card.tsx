import React from "react"
// component
import { StyleSheet, useColorScheme } from "react-native"
import { Text, View } from "../Themed"
// zustand
import { useUserStore } from "@/hooks/use-user-store"
// hook
import useCurrneThemeColor from "@/hooks/use-current-theme-color"

export const UserDataCard = () => {
  const { userInfo } = useUserStore()
  const currentUserInfo = userInfo[userInfo.length - 1]
  const themeColor = useCurrneThemeColor()
  const weightMax = [
    { id: 1, title: "스쿼트", weight: currentUserInfo.sq ?? 0 },
    { id: 2, title: "벤치프레스", weight: currentUserInfo.bp ?? 0 },
    { id: 3, title: "데드리프트", weight: currentUserInfo.dl ?? 0 },
  ]
  const useData = [
    { id: 1, title: "키", weight: currentUserInfo.height ?? 0 },
    { id: 2, title: "몸무게", weight: currentUserInfo.weight ?? 0 },
    { id: 3, title: "나이", weight: currentUserInfo.age ?? 0 },
    {
      id: 4,
      title: "성별",
      weight:
        currentUserInfo.gender === "male"
          ? "남자"
          : currentUserInfo.gender === "female"
          ? "여자"
          : "없음",
    },
  ]

  return (
    <View style={[styles.userData, { backgroundColor: themeColor.itemColor }]}>
      <View
        style={[
          styles.weight,
          {
            gap: 46,
            backgroundColor: themeColor.itemColor,
          },
        ]}
      >
        {weightMax.map((item) => (
          <View
            key={item.id}
            style={[
              styles.weightItem,
              { backgroundColor: themeColor.itemColor },
            ]}
          >
            <Text style={[styles.weightTitle, { color: themeColor.tint }]}>
              {item.title}
            </Text>
            <Text style={styles.weightKg}>{`${item.weight}`}</Text>
          </View>
        ))}
      </View>
      {/* 무게 */}
      <View
        style={[
          styles.weight,
          {
            gap: 52,
            backgroundColor: themeColor.itemColor,
          },
        ]}
      >
        {useData.map((item) => (
          <View
            key={item.id}
            style={[
              styles.weightItem,
              { backgroundColor: themeColor.itemColor },
            ]}
          >
            <Text style={[styles.weightTitle, { color: themeColor.tint }]}>
              {item.title}
            </Text>
            <Text style={styles.weightKg}>{`${item.weight}`}</Text>
          </View>
        ))}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  userData: {
    paddingVertical: 6,
    justifyContent: "space-between",
    borderRadius: 12,
    overflow: "hidden",
    // marginHorizontal: 24,
  },
  weight: {
    flexDirection: "row",
    justifyContent: "center",
    padding: 12,
  },

  weightItem: {
    justifyContent: "center",
    alignItems: "center",
  },
  weightTitle: {
    fontSize: 14,
  },
  weightKg: {
    fontSize: 12,
  },
})
