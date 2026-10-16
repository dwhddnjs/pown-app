import { useEffect, useRef } from "react";
// component
import { Animated, Easing, StyleSheet, View } from "react-native";

// 안드로이드 ActivityIndicator는 머티리얼 원(강조색)이라 iOS 스피너를 그린다 — 시뮬레이터 녹화에서 잰
// 모양: 20 상자, 바퀴살 8개(길이 6⅔·두께 2.5·둥근 끝, RN iOS 기본색 #999999), 0.1초마다
// 시계방향으로 한 칸, 막 켜진 살은 1에서 다섯 칸 동안 0.26까지 흐려진다
const SPOKES = 8;
const STEP_MS = 100;
const FADE_STEPS = 5;

export const ActivitySpinner = () => {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(progress, {
        toValue: SPOKES,
        duration: SPOKES * STEP_MS,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    loop.start();
    return () => loop.stop();
  }, [progress]);

  return (
    <View style={styles.box}>
      {Array.from({ length: SPOKES }, (_, index) => (
        <View
          key={index}
          style={[
            styles.arm,
            { transform: [{ rotate: `${(index * 360) / SPOKES}deg` }] },
          ]}
        >
          <Animated.View
            style={[
              styles.spoke,
              {
                // 이 살이 켜진 뒤 지난 칸 수 — 머리가 index를 지나는 순간 0
                opacity: Animated.modulo(
                  Animated.add(progress, SPOKES - index),
                  SPOKES,
                ).interpolate({
                  inputRange: [0, FADE_STEPS, SPOKES],
                  outputRange: [1, 0.26, 0.26],
                }),
              },
            ]}
          />
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  box: {
    width: 20,
    height: 20,
  },
  // 상자 전체를 돌려 살을 12시 방향에서 각도만큼 옮긴다
  arm: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
  },
  spoke: {
    width: 2.5,
    height: 20 / 3,
    borderRadius: 1.25,
    backgroundColor: "#999999",
  },
});
