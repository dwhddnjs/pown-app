import * as Haptics from "expo-haptics";

// 햅틱 — iOS는 Taptic Engine API 그대로 (안드로이드는 haptics.android.ts)
export const hapticSelection = () => Haptics.selectionAsync();
export const hapticLight = () =>
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
export const hapticMedium = () =>
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
