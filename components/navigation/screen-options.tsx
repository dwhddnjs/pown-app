import { StyleProp, ViewStyle } from "react-native";
import { HeaderIconButton } from "@/components/header-icon-button";

// 루트 Stack의 화면 옵션 조각들. 화면 15개가 같은 헤더 설정을 통째로 복사해 들고
// 있어서 헤더 모양을 한 번 바꾸려면 _layout.tsx를 열다섯 군데 고쳐야 했다.
//
// app/ 아래에 두면 Expo Router가 라우트로 인식하므로 여기(components/)에 둔다.

// options 콜백이 넘겨주는 값 중 여기서 쓰는 부분만
type NavigationLike = { goBack: () => void };

export type ScreenOptionsArgs = { navigation: NavigationLike };

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

export const headerBackButton = (
  type: "close" | "back" | "down",
  navigation: NavigationLike,
  style?: StyleProp<ViewStyle>,
) => {
  const Button = () => (
    <HeaderIconButton
      type={type}
      onPress={() => navigation.goBack()}
      style={style}
    />
  );
  return Button;
};

// 아래에서 위로 올라오는 모달 — 타이틀 없이 닫기 버튼만.
// 모달은 헤더가 화면 상단에서 10pt 내려와 시작하므로 버튼도 같이 내린다.
export const modalScreen =
  (background: string) =>
  ({ navigation }: ScreenOptionsArgs) => ({
    presentation: "modal" as const,
    headerTitle: "",
    ...flatHeader(background),
    headerLeft: headerBackButton("close", navigation, { marginTop: 10 }),
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

// 계획 작성/수정 폼 — 저장 버튼(headerRight)은 각 화면이 직접 붙인다
export const planFormScreen =
  (background: string) =>
  ({ navigation }: ScreenOptionsArgs) => ({
    headerTitle: "",
    ...flatHeader(background),
    headerLeft: headerBackButton("back", navigation),
  });
