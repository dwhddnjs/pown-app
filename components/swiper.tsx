import {
  PanGestureHandler,
  PanGestureHandlerGestureEvent,
} from "react-native-gesture-handler"
import Animated, {
  useAnimatedGestureHandler,
  useSharedValue,
  runOnJS,
} from "react-native-reanimated"
import { View } from "react-native"

type ContextType = {
  startX: number
}

export default function SwipeWrapper({
  children,
  onSwipeLeft,
}: {
  children: React.ReactNode
  onSwipeLeft: () => void
}) {
  const translateX = useSharedValue(0)

  const gestureHandler = useAnimatedGestureHandler<
    PanGestureHandlerGestureEvent,
    ContextType
  >({
    onStart: (_, ctx) => {
      ctx.startX = translateX.value
    },
    onActive: (event, ctx) => {
      translateX.value = ctx.startX + event.translationX
    },
    onEnd: (event) => {
      if (event.translationX < -100) {
        runOnJS(onSwipeLeft)() // 왼쪽으로 충분히 밀었을 때
      }
      translateX.value = 0 // 리셋
    },
  })

  return (
    <PanGestureHandler onGestureEvent={gestureHandler}>
      <Animated.View style={{ flex: 1 }}>{children}</Animated.View>
    </PanGestureHandler>
  )
}
