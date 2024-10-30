import { StyleSheet, useColorScheme } from "react-native"
import React from "react"
import Colors from "@/constants/Colors"
import { Text, View } from "../Themed"
import { useUserStore } from "@/hooks/use-user-store"

export const UserDataCard = () => {
  const { ...result } = useUserStore()
  const colorScheme = useColorScheme()
  const weightMax = [
    { id: 1, title: "스쿼트", weight: result.sq ?? 0 },
    { id: 2, title: "벤치프레스", weight: result.bp ?? 0 },
    { id: 3, title: "데드리프트", weight: result.dl ?? 0 },
  ]
  const useData = [
    { id: 1, title: "키", weight: result.height ?? 0 },
    { id: 2, title: "몸무게", weight: result.weight ?? 0 },
    { id: 3, title: "나이", weight: result.age ?? 0 },
    {
      id: 4,
      title: "성별",
      weight:
        result.gender === "male"
          ? "남자"
          : result.gender === "female"
          ? "여자"
          : "없음",
    },
  ]

  return (
    <View
      style={[
        styles.userData,
        { backgroundColor: Colors[colorScheme ?? "light"].itemColor },
      ]}
    >
      {/* 무게 */}
      <View
        style={[
          styles.weight,
          {
            gap: 52,
            backgroundColor: Colors[colorScheme ?? "light"].itemColor,
          },
        ]}
      >
        {useData.map((item) => (
          <View
            style={[
              styles.weightItem,
              { backgroundColor: Colors[colorScheme ?? "light"].itemColor },
            ]}
          >
            <Text
              style={[
                styles.weightTitle,
                { color: Colors[colorScheme ?? "light"].tint },
              ]}
            >
              {item.title}
            </Text>
            <Text style={styles.weightKg}>{`${item.weight}`}</Text>
          </View>
        ))}
      </View>
      <View
        style={[
          styles.weight,
          {
            gap: 46,
            backgroundColor: Colors[colorScheme ?? "light"].itemColor,
          },
        ]}
      >
        {weightMax.map((item) => (
          <View
            style={[
              styles.weightItem,
              { backgroundColor: Colors[colorScheme ?? "light"].itemColor },
            ]}
          >
            <Text
              style={[
                styles.weightTitle,
                { color: Colors[colorScheme ?? "light"].tint },
              ]}
            >
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
