import AsyncStorage from "@react-native-async-storage/async-storage"
import { MMKV } from "react-native-mmkv"

const mmkv = new MMKV()

// zustand persist는 동기/비동기 반환을 모두 받는다. MMKV는 동기라 첫 렌더부터
// 데이터가 채워진 상태로 하이드레이션된다(빈 화면 깜빡임 없음).
//
// ponytail: MMKV에 값이 없을 때만 구버전 AsyncStorage를 한 번 읽어 옮긴다.
// 이 폴백이 없으면 업데이트 순간 기존 사용자의 운동 기록이 전부 사라진다.
// 몇 버전 지나 사용자가 전부 넘어오면 폴백과 async-storage 의존성을 지울 것.
export const storage = {
  getItem: (name: string): string | null | Promise<string | null> => {
    const data = mmkv.getString(name)
    if (data !== undefined) return data

    return AsyncStorage.getItem(name)
      .then((legacy) => {
        if (legacy !== null) mmkv.set(name, legacy)
        return legacy
      })
      .catch(() => null)
  },
  setItem: (name: string, value: string): void => {
    mmkv.set(name, value)
  },
  removeItem: (name: string): void => {
    mmkv.delete(name)
    // 구버전 값도 같이 지운다 — 안 지우면 다음 실행에서 폴백이 되살린다
    AsyncStorage.removeItem(name).catch(() => {})
  },
}
