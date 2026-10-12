// 푸시 화면 헤더는 56dp라 버튼이 이미 세로 가운데에 온다 — 끌어올릴 필요가 없다
export const headerButtonLift = {};
// 모달은 시트 헤더(modal-presentation.android.tsx, 56dp)에 그린다 — iOS 모달과 같은 자리
// (시트 위에서 31pt)에 오도록 iOS와 같은 값으로 내린다
export const headerButtonLiftModal = { marginTop: 6 };

// 기본 헤더를 쓰는 탭(MY)의 높이 — 안드로이드 기본(56dp)이면 커스텀 헤더를 쓰는 다른 탭보다
// 제목이 한참 아래로 내려가 탭을 옮길 때 튄다. iOS와 같은 44로 맞춘다
export const tabHeaderHeight = (topInset: number): number | undefined =>
  topInset + 44;
