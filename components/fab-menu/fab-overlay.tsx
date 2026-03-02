import React, { useEffect } from "react";
import { Pressable, StyleSheet, TouchableOpacity } from "react-native";
import { View, Text } from "@/components/Themed";
import { router } from "expo-router";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
  Easing,
} from "react-native-reanimated";
import useCurrneThemeColor from "@/hooks/use-current-theme-color";

interface FabOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

const ANIMATION_DURATION = 250;

export default function FabOverlay({ isOpen, onClose }: FabOverlayProps) {
  const themeColor = useCurrneThemeColor();
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(isOpen ? 1 : 0, {
      duration: ANIMATION_DURATION,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    });
  }, [isOpen]);

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: progress.value * 0.6,
  }));

  const singleButtonStyle = useAnimatedStyle(() => {
    const translateY = interpolate(progress.value, [0, 1], [30, 0]);
    const opacity = interpolate(progress.value, [0, 0.3, 1], [0, 0, 1]);
    const scale = interpolate(progress.value, [0, 0.3, 1], [0.6, 0.6, 1]);
    return {
      transform: [{ translateY }, { scale }],
      opacity,
    };
  });

  const multiButtonStyle = useAnimatedStyle(() => {
    const translateY = interpolate(progress.value, [0, 1], [30, 0]);
    const opacity = interpolate(progress.value, [0, 0.5, 1], [0, 0, 1]);
    const scale = interpolate(progress.value, [0, 0.5, 1], [0.6, 0.6, 1]);
    return {
      transform: [{ translateY }, { scale }],
      opacity,
    };
  });

  const handleSingle = () => {
    onClose();
    setTimeout(() => {
      router.push("/(modals)/select-type");
    }, ANIMATION_DURATION);
  };

  const handleMulti = () => {
    onClose();
    setTimeout(() => {
      router.push("/workout/multi-plan");
    }, ANIMATION_DURATION);
  };

  if (!isOpen && progress.value === 0) return null;

  return (
    <View style={styles.container} pointerEvents="box-none">
      <Animated.View style={[styles.overlay, overlayStyle]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      </Animated.View>

      <View style={styles.menuContainer} pointerEvents="box-none">
        <Animated.View style={[styles.menuItem, multiButtonStyle]}>
          <TouchableOpacity
            style={[styles.actionButton, { borderColor: themeColor.tint }]}
            onPress={handleMulti}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons
              name="notebook-multiple"
              size={20}
              color={themeColor.tint}
            />
          </TouchableOpacity>
          <Text style={styles.actionLabel}>루틴 추가</Text>
        </Animated.View>

        <Animated.View style={[styles.menuItem, singleButtonStyle]}>
          <TouchableOpacity
            style={[styles.actionButton, { borderColor: themeColor.tint }]}
            onPress={handleSingle}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons
              name="notebook-plus"
              size={22}
              color={themeColor.tint}
            />
          </TouchableOpacity>
          <Text style={styles.actionLabel}>운동 추가</Text>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "transparent",
    zIndex: 100,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#000",
  },
  menuContainer: {
    position: "absolute",
    bottom: 110,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    gap: 32,
    backgroundColor: "transparent",
  },
  menuItem: {
    alignItems: "center",
    gap: 6,
    backgroundColor: "transparent",
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    backgroundColor: "transparent",
    justifyContent: "center",
    alignItems: "center",
  },
  actionLabel: {
    fontSize: 12,
    fontFamily: "sb-l",
  },
});
