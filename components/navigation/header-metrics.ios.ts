// 헤더 버튼(36pt)을 헤더 하단에서 7pt 띄우는 마진. 네비게이션 바의 콘텐츠 높이는
// iOS가 정하고 headerStyle.height는 무시되는데, 푸시 화면은 44pt·모달은 56pt로 다르다.
// 그래서 같은 하단 간격을 얻는 방향이 서로 반대다 (실측: 시뮬레이터 @3x 기준).
//   푸시 44pt: 박스 36+6=42 → 중앙 top 1  → 아래 7
//   모달 56pt: 박스 6+36=42 → 중앙 top 7 +6 → 아래 7
export const headerButtonLift = { marginBottom: 6 };
export const headerButtonLiftModal = { marginTop: 6 };

// 기본 헤더를 쓰는 탭(MY)의 높이 — iOS 기본(폰 44pt, 아이패드 50pt)을 그대로 쓴다
export const tabHeaderHeight = (_topInset: number): number | undefined =>
  undefined;
