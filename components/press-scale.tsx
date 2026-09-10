import { Pressable, PressableProps, StyleProp, ViewStyle } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface PressScaleProps extends Omit<PressableProps, "style"> {
  style?: StyleProp<ViewStyle>;
  // 눌렀을 때 커질 배율
  scaleTo?: number;
}

// 배경도 테두리도 없는 아이콘 버튼은 눌러도 티가 안 난다 — 누르는 동안 살짝 키운다
export const PressScale = ({
  scaleTo = 1.25,
  style,
  onPressIn,
  onPressOut,
  ...props
}: PressScaleProps) => {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      {...props}
      onPressIn={(e) => {
        scale.value = withSpring(scaleTo, { damping: 12, stiffness: 400 });
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        scale.value = withSpring(1, { damping: 12, stiffness: 400 });
        onPressOut?.(e);
      }}
      style={[style, animatedStyle]}
    />
  );
};
