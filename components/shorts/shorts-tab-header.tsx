import React from "react"
// component
import { SafeAreaView, StyleSheet, TouchableOpacity, View } from "react-native"
import { DrawerToggleButton } from "@react-navigation/drawer"
// expo
import { BlurView } from "expo-blur"
import { useRouter } from "expo-router"
import FontAwesome from "@expo/vector-icons/FontAwesome"
// hook
import useCurrneThemeColor from "@/hooks/use-current-theme-color"
import { Text } from "../Themed"

const ShortsTabHeader = ({ title }: { title?: string }) => {
  const themeColor = useCurrneThemeColor()
  const { push } = useRouter()

  return (
    <BlurView intensity={80} tint="default" style={styles.blur}>
      <SafeAreaView>
        <View style={styles.container}>
          <Text style={{ fontSize: 16 }}>내 운동 숏츠</Text>
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
