import { useEffect } from "react";
// component
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Appearance, useColorScheme } from "react-native";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { Toaster } from "sonner-native";
import { PlanMenu } from "@/components/workout-plan/plan-menu";
import {
  flatHeader,
  fullScreen,
  headerBackButton,
  modalScreen,
  planFormScreen,
  ScreenOptionsArgs,
  settingsScreen,
} from "@/components/navigation/screen-options";
//expo
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
// lib
import { GestureHandlerRootView } from "react-native-gesture-handler";
import {
  configureReanimatedLogger,
  ReanimatedLogLevel,
} from "react-native-reanimated";
// zustand
import { useUserStore } from "@/hooks/use-user-store";
// hooks
import useCurrentThemeColor from "@/hooks/use-current-theme-color";
import { useT } from "@/hooks/use-t";

export { ErrorBoundary } from "expo-router";

export const unstable_settings = {
  initialRouteName: "(drawer)/(tabs)/workout",
};
// @gorhom/bottom-sheet v4가 렌더 중 shared value를 읽어 발생하는 오탐 경고를
// 막기 위해 Reanimated strict 모드만 끈다 (warn 레벨 로깅은 유지).
configureReanimatedLogger({
  level: ReanimatedLogLevel.warn,
  strict: false,
});

SplashScreen.preventAutoHideAsync();

SplashScreen.setOptions({
  duration: 1000,
  fade: true,
});

export default function RootLayout() {
  const [loaded, error] = useFonts({
    "sb-b": require("../assets/fonts/SB_B.otf"),
    "sb-l": require("../assets/fonts/SB_L.otf"),
    "sb-m": require("../assets/fonts/SB_M.otf"),
  });
  const colorScheme = useColorScheme();
  const { theme } = useUserStore();

  useEffect(() => {
    if (loaded) {
      SplashScreen.hide();
    }
  }, [loaded]);

  useEffect(() => {
    // "system"이면 null을 넣어 기기 설정을 따라가게 되돌린다
    Appearance.setColorScheme(theme === "system" ? null : theme);
  }, [theme]);

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  if (!loaded) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <BottomSheetModalProvider>
          <RootLayoutNav />
        </BottomSheetModalProvider>
        <PlanMenu />
        <Toaster />
      </GestureHandlerRootView>
    </ThemeProvider>
  );
}

function RootLayoutNav() {
  const t = useT();
  const themeColor = useCurrentThemeColor();
  const background = themeColor.background;

  const modal = modalScreen(background);
  const planForm = planFormScreen(background);

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: background,
        },
        headerTitleStyle: {
          color: themeColor.text,
          fontFamily: "sb-m",
        },
      }}
    >
      <Stack.Screen name="(drawer)" options={{ headerShown: false }} />

      {/* 모달 */}
      <Stack.Screen name="(modals)/calculate" options={modal} />
      <Stack.Screen name="(modals)/calendar-workout" options={modal} />
      <Stack.Screen name="(modals)/select-type" options={modal} />
      <Stack.Screen name="(modals)/note" options={modal} />

      {/* 계획 작성·수정 — 저장 버튼은 각 화면이 headerRight로 붙인다.
          폼 리셋은 화면의 beforeRemove 리스너가 담당한다. */}
      <Stack.Screen
        name="add-plan/[slug]"
        options={({ navigation }: ScreenOptionsArgs) => {
          const options = planForm({ navigation });
          return {
            ...options,
            headerStyle: { ...options.headerStyle, borderWidth: 2 },
          };
        }}
      />
      <Stack.Screen name="edit-plan/[...slug]" options={planForm} />
      <Stack.Screen
        name="workout/add-multi-plan"
        options={({ navigation }: ScreenOptionsArgs) => ({
          presentation: "modal" as const,
          headerTitle: "",
          ...flatHeader(background),
          headerLeft: headerBackButton("back", navigation, { marginTop: 10 }),
        })}
      />
      <Stack.Screen
        name="workout/multi-plan"
        options={({ navigation }: ScreenOptionsArgs) => ({
          headerTitle: t("header.addRoutine"),
          ...flatHeader(background),
          animation: "slide_from_bottom" as const,
          headerLeft: headerBackButton("close", navigation),
        })}
      />

      {/* MY 하위 설정 */}
      <Stack.Screen
        name="mypage/user-info"
        options={settingsScreen(t("header.userInfo"))}
      />
      <Stack.Screen
        name="mypage/theme-mode"
        options={settingsScreen(t("header.themeMode"))}
      />
      <Stack.Screen
        name="mypage/language"
        options={settingsScreen(t("header.language"))}
      />
      <Stack.Screen
        name="mypage/reset-data"
        options={settingsScreen(t("header.dataManage"))}
      />

      {/* 검색·달력 */}
      <Stack.Screen
        name="workout/search"
        options={({ navigation }: ScreenOptionsArgs) => ({
          headerTitle: t("header.search"),
          headerShadowVisible: false,
          gestureEnabled: false,
          headerLeft: headerBackButton("back", navigation, { borderWidth: 0 }),
        })}
      />
      <Stack.Screen
        name="workout/calendar"
        options={({ navigation }: ScreenOptionsArgs) => ({
          // headerTitle은 화면에서 보고 있는 달로 설정한다 (workout/calendar.tsx)
          headerShadowVisible: false,
          headerLeft: headerBackButton("back", navigation),
        })}
      />

      {/* 자체 헤더를 그리는 전체화면 */}
      <Stack.Screen
        name="add-plan/camera"
        options={fullScreen(t("header.camera"))}
      />
      <Stack.Screen
        name="shorts/video"
        options={fullScreen(t("header.video"))}
      />
      <Stack.Screen
        name="shorts/[...slug]"
        options={({ navigation }: ScreenOptionsArgs) => ({
          headerTitle: "",
          headerShown: false,
          headerLeft: headerBackButton("back", navigation),
        })}
      />
    </Stack>
  );
}
