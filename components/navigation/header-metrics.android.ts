// 헤더 기하는 iOS 내비 바를 그대로 따른다. iOS(다이내믹 아일랜드 기종)의 내비 바는 안전영역보다
// 5⅓ 위에서 시작하는 44 높이다 (react-navigation getDefaultHeaderHeight와 같은 값).
// 안드로이드 기본 툴바(56dp, 상태바 바로 밑)를 쓰면 헤더가 12dp 두꺼워 본문이 통째로 내려간다
const NAV_BAR_HEIGHT = 44;
export const headerBarTop = (topInset: number): number | undefined =>
  Math.max(topInset - (5 + 1 / 3), 0);

// 헤더 제목 글자 위치 보정 — 같은 44 바 가운데에 두어도 iOS 내비 바 제목(네이티브·JS 헤더 모두)이
// 3 아래에 그려진다 (시뮬레이터·에뮬레이터 실측: 글자 윗변이 안전영역 + 10.2 / + 7.2)
export const headerTitleOffset = { top: 3 };

// 푸시 화면 헤더(stack-header.android.tsx)가 iOS와 같은 44 바라 보정도 iOS와 같다
export const headerButtonLift = { marginBottom: 6 };
// 모달은 시트 헤더(modal-presentation.android.tsx, 56dp)에 그린다 — iOS 모달과 같은 자리
// (시트 위에서 31pt)에 오도록 iOS와 같은 값으로 내린다
export const headerButtonLiftModal = { marginTop: 6 };

// 기본 헤더를 쓰는 탭(MY)의 높이 — iOS 내비 바와 같은 자리·높이
export const tabHeaderHeight = (topInset: number): number | undefined =>
  (headerBarTop(topInset) ?? topInset) + NAV_BAR_HEIGHT;

// 드로어 제목 위 여백 — iOS는 72로 고정인데 그건 상태바(안전영역 62) 바로 밑 10이다.
// 상태바가 낮은 안드로이드에서 72를 그대로 쓰면 제목이 13dp 내려가 보인다
export const drawerHeaderTop = (topInset: number): number => topInset + 10;
