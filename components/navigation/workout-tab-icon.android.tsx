import React from "react";
// icon
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";

// 운동 탭 아이콘 — SF Symbol(expo-symbols)은 iOS 전용이라, iOS의 dumbbell.fill처럼
// 가로로 누운 덤벨 아이콘을 쓴다
export const WorkoutTabIcon = ({ color }: { color: string }) => (
  <FontAwesome6 name="dumbbell" size={21} color={color} />
);
