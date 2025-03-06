import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native"
import React from "react"
import { BlurView } from "expo-blur"
import { DrawerToggleButton } from "@react-navigation/drawer"
import { useRouter } from "expo-router"
import Colors from "@/constants/Colors"
import FontAwesome from "@expo/vector-icons/FontAwesome"
import useCurrneThemeColor from "@/hooks/use-current-theme-color"

const WorkoutTabHeader = ({ title }: { title?: string }) => {
  const themeColor = useCurrneThemeColor()
  const { push } = useRouter()

  return (
    <BlurView intensity={80} tint="default" style={styles.blur}>
      <SafeAreaView>
        <View style={styles.container}>
          <TouchableOpacity>
            <DrawerToggleButton tintColor={themeColor.text} />
          </TouchableOpacity>
          <Text
            style={{
              fontSize: 18,
              color: themeColor.text,
              textAlign: "center",
              fontFamily: "sb-m",
            }}
          >
            {title}
          </Text>
          <TouchableOpacity
            style={{
              paddingLeft: 12,
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
    paddingBottom: 10,
    alignItems: "center",
  },
  container: {
    backgroundColor: "transparent",
    width: "100%",
    paddingVertical: 2,
    paddingLeft: 8,
    paddingRight: 25,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
})
