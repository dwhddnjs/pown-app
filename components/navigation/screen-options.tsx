import { StyleProp, ViewStyle } from "react-native";
import { HeaderIconButton } from "@/components/header-icon-button";
import { blurHeader } from "@/components/navigation/stack-header";
import {
  headerButtonLift,
  headerButtonLiftModal,
} from "@/components/navigation/header-metrics";
import type { useModalPresentation } from "@/components/navigation/modal-presentation";

// 루트 Stack의 화면 옵션 조각들. 화면 15개가 같은 헤더 설정을 통째로 복사해 들고
// 있어서 헤더 모양을 한 번 바꾸려면 _layout.tsx를 열다섯 군데 고쳐야 했다.
//
// app/ 아래에 두면 Expo Router가 라우트로 인식하므로 여기(components/)에 둔다.

// options 콜백이 넘겨주는 값 중 여기서 쓰는 부분만
type NavigationLike = { goBack: () => void };

export type ScreenOptionsArgs = { navigation: NavigationLike };

// 헤더 버튼 세로 위치 보정은 플랫폼마다 다르다 (header-metrics.ios/.android)
export { headerButtonLift, headerButtonLiftModal };

// 헤더 제목 글꼴. 17은 iOS 기본 크기다 — 안드로이드 기본(20)은 커스텀 헤더를 쓰는 탭·화면보다
// 커 보여서 명시한다
export const headerTitleFont = { fontFamily: "sb-m", fontSize: 17 };

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

// 아래에서 위로 올라오는 모달 — 타이틀 없이 닫기 버튼만.
// 띄우는 방식은 플랫폼마다 다르다 (modal-presentation.ios/.android)
export const modalScreen =
  (background: string, presentation: ReturnType<typeof useModalPresentation>) =>
  ({ navigation }: ScreenOptionsArgs) => ({
    ...presentation,
    headerTitle: "",
    ...flatHeader(background),
    headerLeft: headerBackButton("close", navigation, headerButtonLiftModal),
  });

// MY 하위 설정 화면 — 제목 + 아래로 내리는 닫기 버튼
export const settingsScreen =
  (title: string) =>
  ({ navigation }: ScreenOptionsArgs) => ({
    headerTitle: title,
    headerTitleStyle: headerTitleFont,
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
    headerTitleStyle: headerTitleFont,
    animation: "slide_from_bottom" as const,
    headerLeft: headerBackButton("down", navigation),
  });

// 계획 작성/수정 폼 — 저장 버튼(headerRight)은 각 화면이 직접 붙인다.
// 헤더 배경은 workout 탭과 같은 BarBackground(iOS는 투명 헤더 + blur, stack-header.ios/.android).
// 폼 본문(ScrollView)은 useBlurHeaderInset()만큼 paddingTop을 잡아 헤더 아래로 내려간다.
export const planFormScreen = ({ navigation }: ScreenOptionsArgs) => ({
  headerTitle: "",
  ...blurHeader,
  headerLeft: headerBackButton("back", navigation, headerButtonLift),
});
