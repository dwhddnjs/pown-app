import React from "react"
import { useT } from "@/hooks/use-t"
// component
import { SafeAreaView, StyleSheet, View } from "react-native"
// expo
import { BlurView } from "expo-blur"
import { Text } from "../themed"

const ShortsTabHeader = () => {
  const t = useT()

  return (
    <BlurView intensity={80} tint="default" style={styles.blur}>
      <SafeAreaView>
        <View style={styles.container}>
          <Text style={{ fontSize: 16 }}>{t("shorts.title")}</Text>
        </View>
      </SafeAreaView>
    </BlurView>
  )
}

export default ShortsTabHeader

const styles = StyleSheet.create({
  // alignItems:"center"를 주면 SafeAreaView가 콘텐츠 폭으로 쪼그라들어
  // 안쪽 width:"100%"가 화면 폭이 아니게 된다 — 타이틀이 중앙에서 밀리던 원인
  blur: {
    width: "100%",
    paddingBottom: 6,
  },
  container: {
    backgroundColor: "transparent",
    width: "100%",
    paddingVertical: 8,
    paddingHorizontal: 8,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
})
