import * as Haptics from "expo-haptics";

// expo-haptics의 selection·impact는 안드로이드에서 진동 모터를 정해진 파형으로 직접 돌린다 — "웅" 하는
// 진동이고, 시스템 "터치 진동"을 꺼도 울린다(iOS 햅틱은 시스템 설정을 따르는 짧은 탭). 시스템 햅틱
// (View.performHapticFeedback)으로 보내 기기가 맞춰 둔 짧은 효과를 쓴다: 선택 = 피커 눈금(TimePicker와 같은
// CLOCK_TICK), 가벼운 탭 = CONTEXT_CLICK, 중간 = VIRTUAL_KEY
export const hapticSelection = () =>
  Haptics.performAndroidHapticsAsync(Haptics.AndroidHaptics.Clock_Tick);
export const hapticLight = () =>
  Haptics.performAndroidHapticsAsync(Haptics.AndroidHaptics.Context_Click);
export const hapticMedium = () =>
  Haptics.performAndroidHapticsAsync(Haptics.AndroidHaptics.Virtual_Key);
