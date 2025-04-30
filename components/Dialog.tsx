import { Pressable, StyleSheet, TouchableOpacity, View } from "react-native"
import React, { useEffect } from "react"
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from "react-native-reanimated"
import useCurrneThemeColor from "@/hooks/use-current-theme-color"
import AntDesign from "@expo/vector-icons/AntDesign"

interface DialogProps {
  children: React.ReactNode
  isOpen: boolean
  onClose: () => void
}

export const Dialog = ({ children, isOpen, onClose }: DialogProps) => {
  const themeColor = useCurrneThemeColor()
  const translateY = useSharedValue(50)
  const opacity = useSharedValue(0)

  useEffect(() => {
    if (isOpen) {
      translateY.value = withSpring(0)
      opacity.value = withSpring(1)
    } else {
      translateY.value = withTiming(50, { duration: 150 })
      opacity.value = withTiming(0, { duration: 150 }, () => {
        runOnJS(onClose)()
      })
    }
  }, [isOpen])

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }))

  if (!isOpen) return null

  const onPress = () => {
    translateY.value = withTiming(50, { duration: 150 })
    opacity.value = withTiming(0, { duration: 150 }, () => {
      runOnJS(onClose)()
    })
  }

  return (
    <Pressable style={styles.overlay} onPress={onPress}>
      <Animated.View
        style={[
          styles.content,
          { backgroundColor: themeColor.itemColor },
          animatedStyle,
        ]}
      >
        <View style={{ justifyContent: "center", alignItems: "flex-end" }}>
          <TouchableOpacity
            style={{ paddingHorizontal: 12, paddingVertical: 8 }}
            onPress={onPress}
          >
            <AntDesign name="close" size={24} color={themeColor.subText} />
          </TouchableOpacity>
        </View>
        {children}
      </Animated.View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-start",
    alignItems: "center",
    paddingTop: 180,
    flex: 1,
    zIndex: 999,
  },
  content: {
    width: "90%",
    borderRadius: 16,
    paddingBottom: 20,
  },
})
