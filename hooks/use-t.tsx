import { useCallback } from "react"
// hooks
import { getLanguage, useLanguage } from "@/hooks/use-user-store"
// lib
import { TKey, translate } from "@/lib/i18n"

// 컴포넌트에서: const t = useT() → t("my.language")
export const useT = () => {
  const lang = useLanguage()
  return useCallback(
    (key: TKey, vars?: Record<string, string | number>) =>
      translate(lang, key, vars),
    [lang],
  )
}

// 훅을 쓸 수 없는 곳(lib의 토스트 등)에서 쓰는 동기 버전
export const tt = (key: TKey, vars?: Record<string, string | number>) =>
  translate(getLanguage(), key, vars)
