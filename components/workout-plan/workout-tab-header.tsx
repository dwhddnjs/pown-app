import React from "react"
// component
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native"
import { DrawerToggleButton } from "@react-navigation/drawer"
// expo
import { BlurView } from "expo-blur"
import { useRouter } from "expo-router"
import FontAwesome from "@expo/vector-icons/FontAwesome"
import * as Haptics from "expo-haptics"
// hook
import useCurrentThemeColor from "@/hooks/use-current-theme-color"
import { useNavigation, DrawerActions } from "@react-navigation/native"

const WorkoutTabHeader = ({ title }: { title?: string }) => {
  const themeColor = useCurrentThemeColor()
  const { push } = useRouter()
  const navigation = useNavigation()

  return (
    <BlurView intensity={80} tint="default" style={styles.blur}>
      <SafeAreaView>
        <View style={styles.container}>
          <TouchableOpacity
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
              navigation.dispatch(DrawerActions.toggleDrawer())
            }}
          >
            <View pointerEvents="none">
              <DrawerToggleButton tintColor={themeColor.text} />
            </View>
          </TouchableOpacity>
          <Text
            style={{
              fontSize: 18,
              color:
                title === "🔥오늘도 화이팅!"
                  ? themeColor.tint
                  : themeColor.text,
              textAlign: "center",
              fontFamily: "sb-m",
            }}
          >
            {title}
          </Text>
          <TouchableOpacity
            style={{
              paddingLeft: 18,
              paddingVertical: 8,
            }}
            onPress={() => push("/workout/search")}
          >
            <FontAwesome name="search" size={20} color={themeColor.text} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </BlurView>
  )
}

export default WorkoutTabHeader

const styles = StyleSheet.create({
  blur: {
    width: "100%",
    paddingBottom: 6,
    alignItems: "center",
  },
  container: {
    backgroundColor: "transparent",
    width: "100%",
    paddingLeft: 8,
    paddingRight: 25,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
})
