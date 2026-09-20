import { useEffect, useState } from "react";
// component
import { StyleSheet } from "react-native";
import { Text } from "@/components/themed";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
// hooks
import useCurrentThemeColor from "@/hooks/use-current-theme-color";
import { useSafeAreaInsets } from "react-native-safe-area-context";
// expo
import { LinearGradient } from "expo-linear-gradient";

const SWEEP_MS = 1600;
const LINE_HEIGHT = 120;
// 끝에 닿아 방향이 바뀔 때 꼬리를 접었다 반대쪽으로 펴는 시간
const FLIP_MS = 300;
const CORNER = 28;
// 리포트 생성이 실측 50~95초 걸린다. 같은 문구로 1분 넘게 돌면 멈춘 걸로 보여서
// 실제로 "되는 건지 몰라 뒤로 나갔다"는 피드백을 받았다 — 도중에 기대치를 바꿔준다.
const PHASE_SWITCH_MS = 15_000;

interface ScanOverlayProps {
  label: string;
  // 15초가 지나면 이 문구로 바꾼다
  longLabel: string;
}

// AI가 영상을 훑는 동안 덮는 화면. 이 앱 최초의 "기다리는 UI"라 선례가 없어
// 카메라 뷰파인더 모양(모서리 괄호 + 스캔 라인)으로 만들었다.
// 영상 영역만 덮으므로 아래 하단바(뒤로가기·삭제)는 그대로 쓸 수 있다.
export const ScanOverlay = ({ label, longLabel }: ScanOverlayProps) => {
  const themeColor = useCurrentThemeColor();
  // 상세 화면은 edges={["bottom"]}이라 영상이 상태바 아래까지 올라온다 —
  // 괄호를 고정값으로 두면 시계·배터리 위에 겹쳐 그려진다
  const insets = useSafeAreaInsets();
  const [height, setHeight] = useState(0);
  const [isLong, setIsLong] = useState(false);
  const progress = useSharedValue(0);
  // 진행 방향(1=아래로, -1=위로). 꼬리는 항상 진행 반대쪽에 달려야 자연스럽다.
  // 값이 0을 지나는 동안 꼬리가 선 안으로 접혔다 반대쪽으로 펴져 뒤집힘이 안 튄다.
  const direction = useSharedValue(1);

  useEffect(() => {
    const timer = setTimeout(() => setIsLong(true), PHASE_SWITCH_MS);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const sweep = { duration: SWEEP_MS, easing: Easing.inOut(Easing.quad) };
    // withRepeat(reverse) 대신 왕복을 두 구간으로 쪼갠다 — 끝나는 순간을 잡아야
    // 방향 전환에 맞춰 꼬리를 뒤집을 수 있다
    const toUp = () => {
      "worklet";
      direction.value = withTiming(-1, { duration: FLIP_MS });
    };
    const toDown = () => {
      "worklet";
      direction.value = withTiming(1, { duration: FLIP_MS });
    };
    progress.value = withRepeat(
      withSequence(withTiming(1, sweep, toUp), withTiming(0, sweep, toDown)),
      -1,
    );
  }, [progress, direction]);

  const sweepStyle = useAnimatedStyle(() => {
    // 그라데이션의 진한 끝(=선)이 화면 위아래 끝까지 닿게 잡는다
    const lineY = progress.value * height;
    return {
      transform: [
        // scaleY로 뒤집으면 진한 끝이 박스 반대편으로 가므로 그만큼 당겨준다
        { translateY: lineY - (LINE_HEIGHT * (direction.value + 1)) / 2 },
        { scaleY: direction.value },
      ],
    };
  });

  const corner = { borderColor: themeColor.tint };
  const topInset = { top: insets.top + 16 };

  return (
    // 분석 중에는 스와이프로 다른 영상에 넘어가지 못하게 터치를 여기서 막는다
    <Animated.View
      style={styles.container}
      onLayout={(e) => setHeight(e.nativeEvent.layout.height)}
    >
      <Animated.View style={[styles.sweep, sweepStyle]}>
        <LinearGradient
          colors={["transparent", `${themeColor.tint}55`, themeColor.tint]}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>

      <Animated.View
        style={[styles.corner, styles.topLeft, corner, topInset]}
      />
      <Animated.View
        style={[styles.corner, styles.topRight, corner, topInset]}
      />
      <Animated.View style={[styles.corner, styles.bottomLeft, corner]} />
      <Animated.View style={[styles.corner, styles.bottomRight, corner]} />

      <Text style={[styles.label, { color: themeColor.tint }]}>
        {isLong ? longLabel : label}
      </Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "center",
    alignItems: "center",
  },
  sweep: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: LINE_HEIGHT,
  },
  corner: {
    position: "absolute",
    width: CORNER,
    height: CORNER,
  },
  topLeft: { left: 24, borderTopWidth: 2, borderLeftWidth: 2 },
  topRight: { right: 24, borderTopWidth: 2, borderRightWidth: 2 },
  bottomLeft: {
    bottom: 32,
    left: 24,
    borderBottomWidth: 2,
    borderLeftWidth: 2,
  },
  bottomRight: {
    bottom: 32,
    right: 24,
    borderBottomWidth: 2,
    borderRightWidth: 2,
  },
  label: {
    fontSize: 15,
    // 스캔 라인이 지나가도 글자가 묻히지 않게
    textShadowColor: "rgba(0,0,0,0.8)",
    textShadowRadius: 6,
  },
});
