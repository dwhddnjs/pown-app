import React from "react";
// icon
import { SymbolView } from "expo-symbols";

// 운동 탭 아이콘 — SF Symbol
export const WorkoutTabIcon = ({ color }: { color: string }) => (
  <SymbolView
    name="dumbbell.fill"
    type="hierarchical"
    tintColor={color}
    // SF Symbol은 가로로 납작해서 같은 size로도 아이콘 폰트보다 작아 보인다
    size={32}
  />
);
