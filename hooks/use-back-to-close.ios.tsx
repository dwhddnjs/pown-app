// iOS엔 하드웨어 뒤로가기가 없다 — 시트·오버레이는 각자 닫기 제스처·버튼으로 닫힌다.
// 안드로이드 쪽 동작은 use-back-to-close.android.tsx
export const useBackToClose = (_isOpen: boolean, _close: () => void) => {};
