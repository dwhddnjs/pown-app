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
import { HeaderIconButton } from "@/components/header-icon-button";
//expo
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { ActionSheetProvider } from "@expo/react-native-action-sheet";
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
import { View } from "@/components/themed";

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
    if (theme === "system") {
      Appearance.setColorScheme(null);
    }

    if (theme == "dark") {
      Appearance.setColorScheme("dark");
    }

    if (theme == "light") {
      Appearance.setColorScheme("light");
    }
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
        <ActionSheetProvider>
          <BottomSheetModalProvider>
            <RootLayoutNav />
          </BottomSheetModalProvider>
        </ActionSheetProvider>
        <Toaster />
      </GestureHandlerRootView>
    </ThemeProvider>
  );
}

function RootLayoutNav() {
  const themeColor = useCurrentThemeColor();
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: themeColor.background,
        },
        headerTitleStyle: {
          color: themeColor.text,
          fontFamily: "sb-m",
        },
      }}
    >
      <Stack.Screen name="(drawer)" options={{ headerShown: false }} />
      <Stack.Screen
        name="(modals)/calculate"
        options={({ navigation }) => ({
          presentation: "modal",
          headerTitle: "",
          headerStyle: {
            borderBottomWidth: 0,
            elevation: 0,
            shadowOpacity: 0,
            backgroundColor: themeColor.background,
          },
          headerShadowVisible: false,

          headerLeft: () => (
            <HeaderIconButton
              type="close"
              onPress={() => navigation.goBack()}
              style={{ marginTop: 16 }}
            />
          ),
        })}
      />
      <Stack.Screen
        name="(modals)/calendar-workout"
        options={({ navigation }) => ({
          presentation: "modal",
          headerTitle: "",
          headerStyle: {
            borderBottomWidth: 0,
            elevation: 0,
            shadowOpacity: 0,
            backgroundColor: themeColor.background,
          },
          headerShadowVisible: false,

          headerLeft: () => (
            <HeaderIconButton
              type="close"
              onPress={() => navigation.goBack()}
              style={{ marginTop: 16 }}
            />
          ),
        })}
      />
      <Stack.Screen
        name="(modals)/select-type"
        options={({ navigation }) => ({
          presentation: "modal",
          headerTitle: "",
          headerStyle: {
            borderBottomWidth: 0,
            elevation: 0,
            shadowOpacity: 0,
            backgroundColor: themeColor.background,
          },
          headerShadowVisible: false,

          headerLeft: () => (
            <HeaderIconButton
              type="close"
              onPress={() => navigation.goBack()}
              style={{ marginTop: 16 }}
            />
          ),
        })}
      />
      <Stack.Screen
        name="workout/multi-plan"
        options={({ navigation }) => ({
          headerTitle: "루틴 추가",
          headerStyle: {
            borderBottomWidth: 0,
            elevation: 0,
            shadowOpacity: 0,
            backgroundColor: themeColor.background,
          },
          headerShadowVisible: false,
          animation: "slide_from_bottom",

          headerLeft: () => (
            <HeaderIconButton
              type="close"
              onPress={() => navigation.goBack()}
              style={{ marginTop: 16 }}
            />
          ),
        })}
      />
      <Stack.Screen
        name="(modals)/note"
        options={({ navigation }) => ({
          presentation: "modal",
          headerTitle: "",
          headerStyle: {
            borderBottomWidth: 0,
            elevation: 0,
            shadowOpacity: 0,
            backgroundColor: themeColor.background,
          },
          headerShadowVisible: false,

          headerLeft: () => (
            <HeaderIconButton
              type="close"
              onPress={() => navigation.goBack()}
              style={{ marginTop: 16 }}
            />
          ),
        })}
      />
      <Stack.Screen
        name="add-plan/[slug]"
        options={({ navigation }) => ({
          headerTitle: "",
          headerStyle: {
            borderBottomWidth: 0,
            elevation: 0,
            shadowOpacity: 0,
            backgroundColor: themeColor.background,
            borderWidth: 2,
          },
          headerShadowVisible: false,
          // 폼 리셋은 화면의 beforeRemove 리스너가, 저장 버튼(headerRight)은 화면 파일이 담당한다
          headerLeft: () => (
            <HeaderIconButton
              type="back"
              onPress={() => navigation.goBack()}
              style={{ marginTop: 16 }}
            />
          ),
        })}
      />
      <Stack.Screen
        name="edit-plan/[...slug]"
        options={({ navigation }) => ({
          headerTitle: "",
          headerStyle: {
            borderBottomWidth: 0,
            elevation: 0,
            shadowOpacity: 0,
            backgroundColor: themeColor.background,
          },
          headerShadowVisible: false,
          headerLeft: () => (
            <HeaderIconButton
              type="back"
              onPress={() => navigation.goBack()}
              style={{ marginTop: 16 }}
            />
          ),
        })}
      />
      <Stack.Screen
        name="workout/add-multi-plan"
        options={({ navigation }) => ({
          presentation: "modal",
          headerTitle: "",
          headerStyle: {
            borderBottomWidth: 0,
            elevation: 0,
            shadowOpacity: 0,
            backgroundColor: themeColor.background,
          },
          headerShadowVisible: false,
          headerLeft: () => (
            <HeaderIconButton
              type="back"
              onPress={() => navigation.goBack()}
              style={{ marginTop: 16 }}
            />
          ),
        })}
      />
      <Stack.Screen
        name="mypage/user-info"
        options={({ navigation }) => ({
          headerTitle: "내정보 작성",
          headerTitleStyle: {
            fontFamily: "sb-m",
          },
          animation: "slide_from_bottom",
          headerLeft: () => (
            <HeaderIconButton type="down" onPress={() => navigation.goBack()} />
          ),
        })}
      />
      <Stack.Screen
        name="mypage/theme-mode"
        options={({ navigation }) => ({
          headerTitle: "컬러 모드 선택",
          animation: "slide_from_bottom",
          headerLeft: () => (
            <HeaderIconButton type="down" onPress={() => navigation.goBack()} />
          ),
        })}
      />
      <Stack.Screen
        name="mypage/reset-data"
        options={({ navigation }) => ({
          headerTitle: "데이터 관리",
          animation: "slide_from_bottom",
          headerLeft: () => (
            <HeaderIconButton type="down" onPress={() => navigation.goBack()} />
          ),
        })}
      />
      <Stack.Screen
        name="workout/search"
        options={({ navigation }) => {
          return {
            headerTitle: "운동 검색",
            headerShadowVisible: false,
            gestureEnabled: false,
            headerLeft: () => (
              <HeaderIconButton
                type="back"
                onPress={() => navigation.goBack()}
                style={{ marginTop: 16 }}
              />
            ),
          };
        }}
      />
      <Stack.Screen
        name="add-plan/camera"
        options={({ navigation }) => ({
          headerTitle: "사진 찍기",
          headerShown: false,
          headerTitleStyle: {
            fontFamily: "sb-m",
          },
          animation: "slide_from_bottom",
          headerLeft: () => (
            <HeaderIconButton type="down" onPress={() => navigation.goBack()} />
          ),
        })}
      />
      <Stack.Screen
        name="mypage/settings"
        options={({ navigation }) => ({
          title: "설정",
          headerLeft: () => (
            <HeaderIconButton
              type="back"
              onPress={() => navigation.goBack()}
              style={{ marginTop: 16 }}
            />
          ),
        })}
      />
      <Stack.Screen
        name="shorts/video"
        options={({ navigation }) => ({
          headerTitle: "비디오 촬영",
          headerShown: false,
          headerTitleStyle: {
            fontFamily: "sb-m",
          },
          animation: "slide_from_bottom",
          headerLeft: () => (
            <HeaderIconButton type="down" onPress={() => navigation.goBack()} />
          ),
        })}
      />
      <Stack.Screen
        name="shorts/[...slug]"
        options={({ navigation }) => ({
          headerTitle: "",
          headerShown: false,
          headerLeft: () => (
            <HeaderIconButton
              type="back"
              onPress={() => navigation.goBack()}
              style={{ marginTop: 16 }}
            />
          ),
        })}
      />
    </Stack>
  );
}
