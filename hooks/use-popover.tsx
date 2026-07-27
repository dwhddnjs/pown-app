import { useCallback, useState } from "react";
// component
import {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

// 드롭다운·컨텍스트 메뉴처럼 떴다 사라지는 팝오버의 열기/닫기 애니메이션.
// 조건부 렌더 + exiting prop은 바로 언마운트돼서 닫힘 애니메이션이 보이지 않는다 —
// 닫는 애니메이션이 끝난 뒤에 직접 언마운트한다.
export const usePopover = () => {
  const [visible, setVisible] = useState(false);
  const progress = useSharedValue(0);

  const open = useCallback(() => {
    setVisible(true);
    progress.value = withTiming(1, {
      duration: 160,
      easing: Easing.out(Easing.quad),
    });
  }, [progress]);

  const close = useCallback(() => {
    progress.value = withTiming(
      0,
      { duration: 120, easing: Easing.in(Easing.quad) },
      (finished) => {
        // 닫는 도중 다시 열면 finished가 false — 그땐 언마운트하지 않는다
        if (finished) runOnJS(setVisible)(false);
      },
    );
  }, [progress]);

  // 버튼 쪽에서 살짝 자라나며 열리는 느낌 (transformOrigin은 쓰는 쪽에서 지정)
  const style = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [
      { translateY: -6 * (1 - progress.value) },
      { scale: 0.94 + 0.06 * progress.value },
    ],
  }));

  return { visible, open, close, style };
};
