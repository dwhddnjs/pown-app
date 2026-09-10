import { StyleProp, StyleSheet, ViewStyle } from "react-native";
import { HeaderIconButton } from "@/components/header-icon-button";
// expo
import { BlurView } from "expo-blur";

// 루트 Stack의 화면 옵션 조각들. 화면 15개가 같은 헤더 설정을 통째로 복사해 들고
// 있어서 헤더 모양을 한 번 바꾸려면 _layout.tsx를 열다섯 군데 고쳐야 했다.
//
// app/ 아래에 두면 Expo Router가 라우트로 인식하므로 여기(components/)에 둔다.

// options 콜백이 넘겨주는 값 중 여기서 쓰는 부분만
type NavigationLike = { goBack: () => void };

export type ScreenOptionsArgs = { navigation: NavigationLike };

// 헤더 버튼(36pt)을 헤더 하단에서 7pt 띄우는 마진. 네비게이션 바의 콘텐츠 높이는
// iOS가 정하고 headerStyle.height는 무시되는데, 푸시 화면은 44pt·모달은 56pt로 다르다.
// 그래서 같은 하단 간격을 얻는 방향이 서로 반대다 (실측: 시뮬레이터 @3x 기준).
//   푸시 44pt: 박스 36+6=42 → 중앙 top 1  → 아래 7
//   모달 56pt: 박스 6+36=42 → 중앙 top 7 +6 → 아래 7
export const headerButtonLift = { marginBottom: 6 };
export const headerButtonLiftModal = { marginTop: 6 };

// 그림자·구분선 없이 배경색만 깔린 헤더 — 이 앱의 기본 헤더 모양
export const flatHeader = (background: string) => ({
  headerStyle: {
    borderBottomWidth: 0,
    elevation: 0,
    shadowOpacity: 0,
    backgroundColor: background,
  },
  headerShadowVisible: false,
});

// headerLeft는 컴포넌트가 아니라 렌더 콜백이다 — 내비게이션이 함수로 직접 호출한다.
// 그래서 이름도 render*로 둔다: 컴포넌트처럼 대문자로 두면 언젠가 <X />로 마운트하게 되고,
// 그러면 options가 평가될 때마다 새 타입이 되어 헤더 버튼이 통째로 다시 마운트된다.
export const headerBackButton = (
  type: "close" | "back" | "down",
  navigation: NavigationLike,
  style?: StyleProp<ViewStyle>,
) => {
  const renderBackButton = () => (
    <HeaderIconButton
      type={type}
      onPress={() => navigation.goBack()}
      style={style}
    />
  );
  return renderBackButton;
};

// 아래에서 위로 올라오는 모달 — 타이틀 없이 닫기 버튼만
export const modalScreen =
  (background: string) =>
  ({ navigation }: ScreenOptionsArgs) => ({
    presentation: "modal" as const,
    headerTitle: "",
    ...flatHeader(background),
    headerLeft: headerBackButton("close", navigation, headerButtonLiftModal),
  });

// MY 하위 설정 화면 — 제목 + 아래로 내리는 닫기 버튼
export const settingsScreen =
  (title: string) =>
  ({ navigation }: ScreenOptionsArgs) => ({
    headerTitle: title,
    headerTitleStyle: { fontFamily: "sb-m" },
    headerShadowVisible: false,
    animation: "slide_from_bottom" as const,
    headerLeft: headerBackButton("down", navigation),
  });

// 자체 헤더를 그리는 전체화면(카메라·영상) — 기본 헤더는 감추고 옵션만 유지한다
export const fullScreen =
  (title: string) =>
  ({ navigation }: ScreenOptionsArgs) => ({
    headerTitle: title,
    headerShown: false,
    headerTitleStyle: { fontFamily: "sb-m" },
    animation: "slide_from_bottom" as const,
    headerLeft: headerBackButton("down", navigation),
  });

// 계획 작성/수정 폼 — 저장 버튼(headerRight)은 각 화면이 직접 붙인다.
// 헤더 배경은 workout 탭과 같은 BlurView. 맨 위에서는 뒤에 배경색밖에 없어서
// 구분이 안 보이고, 스크롤하면 콘텐츠가 지나가며 blur가 드러난다.
// 폼 본문(ScrollView)은 useHeaderHeight()만큼 paddingTop을 잡아 헤더 아래로 내려간다.
export const planFormScreen = ({ navigation }: ScreenOptionsArgs) => ({
  headerTitle: "",
  headerTransparent: true,
  // 루트 screenOptions가 헤더에 배경색을 깔아둔다 — 여기서 지우지 않으면
  // 그 불투명 색이 아래 BlurView를 덮어 blur가 아예 보이지 않는다
  headerStyle: { backgroundColor: "transparent" },
  headerBackground: () => (
    <BlurView intensity={80} tint="default" style={StyleSheet.absoluteFill} />
  ),
  headerLeft: headerBackButton("back", navigation, headerButtonLift),
});
