import * as StoreReview from "expo-store-review"
import { mmkv } from "@/lib/storage"

const KEY = "review-requested"

// 앱 생애주기 통틀어 딱 한 번. 데이터 초기화(reset-data)로도 안 지워진다 —
// onResetPlanList는 zustand 스토어만 비우고 이 키는 건드리지 않는다.
export const requestReviewOnce = async () => {
  // 개발/시뮬레이터에서는 프롬프트가 뜨지 않는데 플래그만 찍혀 실기기 테스트 때
  // 한 번뿐인 기회를 이미 날린 상태가 된다
  if (__DEV__) return
  if (mmkv.getBoolean(KEY)) return
  if (!(await StoreReview.isAvailableAsync())) return
  mmkv.set(KEY, true) // 프롬프트 호출 전에 찍는다 — 실패해도 재시도 안 함
  await StoreReview.requestReview()
}
