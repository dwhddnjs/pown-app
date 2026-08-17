const Colors = {
  light: {
    text: "#27272a",
    subText: "#767680",
    background: "#EFEEF3",
    tint: "#00BAAB",
    // 채워진 배경(버튼/막대)에는 tint, 글자·아이콘에는 tintText.
    // 라이트의 tint는 흰 배경 대비 2.4:1 뿐이라 텍스트로 쓰면 WCAG AA에 한참 못 미친다.
    tintText: "#00BAAB",
    // tintText: "#00786E",
    pressed: "#15e5d3",
    // tint로 채운 면 위에 올리는 글자·아이콘 색 (양 테마 모두 7:1 이상)
    onTint: "#1a1a1a",
    // 탭바 FAB 플러스 전용 — 항상 tint 원 위라 양 테마 흰색 계열로 통일
    fabIcon: "#fff",
    divider: "#D8D7DE",
    // 선택색은 다크와 동일한 #00ccbb로 통일(기존 #009488).
    // 비선택은 선택색보다 확실히 연하게 빼서 두 상태를 명도로 가른다.
    // 주의: 두 색의 상호 대비는 1.07:1로 여전히 낮다 — 실제 구분은 색상(hue)에 의존한다.
    // 탭바(#ffffff) 대비도 각각 1.89:1 / 2.03:1로 WCAG 비텍스트 3:1 미달. 별도 개선 필요.
    tabIconDefault: "#BCBCC0",
    tabIconSelected: "#00ccbb",
    tabBar: "#ffffff",
    itemColor: "#ffffff",
    success: "#3A76E2",
    fail: "#F13C33",
    empty: "#EFEEF3",
    hard: "#ffffff",
  },
  dark: {
    text: "#fff",
    subText: "#9a9aa0",
    background: "#1a1a1a",
    tint: "#00ccbb",
    tintText: "#00ccbb",
    pressed: "#12b5a7",
    onTint: "#1a1a1a",
    // 라이트만 흰색, 다크는 기존대로 background(어두움) 유지
    fabIcon: "#1a1a1a",
    divider: "#555555",
    tabIconDefault: "#8E8E93",
    tabIconSelected: "#00ccbb",
    tabBar: "#1e1e1e",
    itemColor: "#27272a",
    success: "#3A76E2",
    fail: "#F13C33",
    empty: "#1e1e1e",
    hard: "#000000",
  },
} as const;

export type ThemeColorType = (typeof Colors)["light"] | (typeof Colors)["dark"];
export default Colors;
