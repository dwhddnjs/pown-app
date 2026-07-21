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
  blur: {
    width: "100%",
    paddingBottom: 6,
    alignItems: "center",
  },
  container: {
    backgroundColor: "transparent",
    // height: 50,
    width: "100%",
    paddingVertical: 8,
    paddingLeft: 8,
    paddingRight: 25,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
})
