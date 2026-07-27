import React from "react"
// component
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native"
import Animated, { FadeInDown } from "react-native-reanimated"
import { DrawerToggleButton } from "@react-navigation/drawer"
// expo
import { BlurView } from "expo-blur"
import { useRouter } from "expo-router"
import FontAwesome from "@expo/vector-icons/FontAwesome"
import * as Haptics from "expo-haptics"
// hook
import useCurrentThemeColor from "@/hooks/use-current-theme-color"
import { useNavigation, DrawerActions } from "@react-navigation/native"
// icon
import PowLogo from "@/assets/images/svg/pow_logo2.svg"

const WorkoutTabHeader = ({ title }: { title?: string }) => {
  const themeColor = useCurrentThemeColor()
  const { push } = useRouter()
  const navigation = useNavigation()

  return (
    <BlurView intensity={80} tint="default" style={styles.blur}>
      <SafeAreaView>
        <View style={styles.container}>
          <View style={styles.side}>
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
          </View>
          {/* 스크롤로 날짜가 잡히기 전(최상단)에는 타이틀 자리에 로고를 둔다 */}
          {title ? (
            // key로 달이 바뀔 때마다 다시 아래에서 올라오게 한다
            <Animated.View
              key={title}
              entering={FadeInDown.duration(220).withInitialValues({
                transform: [{ translateY: 10 }],
              })}
            >
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
            </Animated.View>
          ) : (
            <PowLogo width={44} height={22} />
          )}
          <View style={[styles.side, { justifyContent: "flex-end" }]}>
            <TouchableOpacity
              style={{
                paddingLeft: 18,
                paddingRight: 17,
                paddingVertical: 8,
              }}
              onPress={() => push("/workout/search")}
            >
              <FontAwesome name="search" size={20} color={themeColor.text} />
            </TouchableOpacity>
          </View>
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
    // 좌우 여백을 대칭으로 두고, 양옆을 flex:1로 나눠야 가운데 로고/타이틀이
    // 화면 정중앙에 온다 (space-between은 좌우 버튼 폭 차이만큼 밀린다)
    paddingHorizontal: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  side: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
})
