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
import { useT } from "@/hooks/use-t";
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
  const t = useT();
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
          headerTitle: t("header.addRoutine"),
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
          headerTitle: t("header.userInfo"),
          headerTitleStyle: {
            fontFamily: "sb-m",
          },
          headerShadowVisible: false,
          animation: "slide_from_bottom",
          headerLeft: () => (
            <HeaderIconButton type="down" onPress={() => navigation.goBack()} />
          ),
        })}
      />
      <Stack.Screen
        name="mypage/theme-mode"
        options={({ navigation }) => ({
          headerTitle: t("header.themeMode"),
          headerTitleStyle: {
            fontFamily: "sb-m",
          },
          headerShadowVisible: false,
          animation: "slide_from_bottom",
          headerLeft: () => (
            <HeaderIconButton type="down" onPress={() => navigation.goBack()} />
          ),
        })}
      />
      <Stack.Screen
        name="mypage/language"
        options={({ navigation }) => ({
          headerTitle: t("header.language"),
          headerTitleStyle: {
            fontFamily: "sb-m",
          },
          headerShadowVisible: false,
          animation: "slide_from_bottom",
          headerLeft: () => (
            <HeaderIconButton type="down" onPress={() => navigation.goBack()} />
          ),
        })}
      />
      <Stack.Screen
        name="mypage/reset-data"
        options={({ navigation }) => ({
          headerTitle: t("header.dataManage"),
          headerTitleStyle: {
            fontFamily: "sb-m",
          },
          headerShadowVisible: false,
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
            headerTitle: t("header.search"),
            headerShadowVisible: false,
            gestureEnabled: false,
            // 네이티브 서치바가 헤더 아래에 붙는다. margin은 헤더 높이를 바꿔 타이틀까지
            // 밀리므로, 레이아웃에 영향 없는 translateY로 백 버튼만 위로 올려 서치바와 여백을 준다.
            headerLeft: () => (
              <HeaderIconButton
                type="back"
                onPress={() => navigation.goBack()}
                style={{ marginBottom: 8 }}
              />
            ),
          };
        }}
      />
      <Stack.Screen
        name="workout/calendar"
        options={({ navigation }) => ({
          // headerTitle은 화면에서 보고 있는 달로 설정한다 (workout/calendar.tsx)
          headerShadowVisible: false,
          headerLeft: () => (
            <HeaderIconButton
              type="back"
              onPress={() => navigation.goBack()}
            />
          ),
        })}
      />
      <Stack.Screen
        name="add-plan/camera"
        options={({ navigation }) => ({
          headerTitle: t("header.camera"),
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
        name="shorts/video"
        options={({ navigation }) => ({
          headerTitle: t("header.video"),
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
