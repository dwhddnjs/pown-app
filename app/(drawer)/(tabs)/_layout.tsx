import React, { useCallback, useEffect, useState } from "react";
// compoents
import { StyleSheet } from "react-native";
import { View } from "@/components/themed";
import WorkoutTabHeader from "@/components/workout-plan/workout-tab-header";
import { ChartHeader } from "@/components/chart";
import { BarBackground } from "@/components/bar-background";
import { WorkoutTabIcon } from "@/components/navigation/workout-tab-icon";
import {
  headerBarTop,
  headerTitleOffset,
  tabHeaderHeight,
} from "@/components/navigation/header-metrics";
import { headerTitleFont } from "@/components/navigation/screen-options";
import { useSafeAreaInsets } from "react-native-safe-area-context";
// lib
import { hapticMedium, hapticSelection } from "@/lib/haptics";
// expo
import { Tabs } from "expo-router";
// icon
import Entypo from "@expo/vector-icons/Entypo";
import Ionicons from "@expo/vector-icons/Ionicons";
// hook
import useCurrentThemeColor from "@/hooks/use-current-theme-color";
import { useT } from "@/hooks/use-t";
import { useBackToClose } from "@/hooks/use-back-to-close";
import ShortsTabHeader from "@/components/shorts/shorts-tab-header";
import { FontAwesome6 } from "@expo/vector-icons";
import { FabOverlay } from "@/components/fab-menu/fab-overlay";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
  Easing,
} from "react-native-reanimated";

export default function TabLayout() {
  const t = useT();
  const themColor = useCurrentThemeColor();
  const insets = useSafeAreaInsets();
  const [fabOpen, setFabOpen] = useState(false);
  const fabProgress = useSharedValue(0);
  const closeFab = useCallback(() => setFabOpen(false), []);
  useBackToClose(fabOpen, closeFab);

  useEffect(() => {
    fabProgress.value = withTiming(fabOpen ? 1 : 0, {
      duration: 250,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    });
  }, [fabOpen]);

  const fabIconStyle = useAnimatedStyle(() => ({
    transform: [
      { rotate: `${interpolate(fabProgress.value, [0, 1], [0, 45])}deg` },
    ],
  }));

  // FAB 오버레이(60% 검정)가 탭바 뒤에 깔리면 iOS blur가 그걸 그대로 빨아들여
  // 라이트 모드에서 탭바가 어두워지고 어두운 아이콘이 묻힌다 → 열릴 때만 불투명 배경으로 덮는다
  // (안드로이드 탭바는 원래 같은 색으로 불투명이라 덮어도 달라지는 게 없다)
  const tabBarSolidStyle = useAnimatedStyle(() => ({
    opacity: fabProgress.value,
  }));

  const tabOption = {
    headerStyle: {
      backgroundColor: themColor.background,
    },
    // 안드로이드 기본은 왼쪽 정렬이다 (iOS는 원래 가운데)
    headerTitleAlign: "center" as const,
    headerTitleStyle: { ...headerTitleFont, color: themColor.text },
    tabBarStyle: {
      backgroundColor: "transparent",
      borderTopWidth: 0,
      paddingHorizontal: 12,
      position: "absolute" as const,
      zIndex: 200,
    },
    tabBarBackground: () => (
      <>
        <BarBackground bar="tab" style={StyleSheet.absoluteFill} />
        <Animated.View
          pointerEvents="none"
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: themColor.tabBar },
            tabBarSolidStyle,
          ]}
        />
      </>
    ),
    tabBarActiveTintColor: themColor.tabIconSelected,
    // iOS 탭바가 반투명 블러라 RN 기본 회색으로는 어두운 콘텐츠 위에서 묻힌다
    tabBarInactiveTintColor: themColor.tabIconDefault,
    tabBarItemStyle: {
      paddingBottom: 3,
      paddingTop: 3,
    },
    tabBarLabelStyle: {
      fontFamily: "sb-m",
      fontSize: 10,
    },
  };

  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={tabOption}
        screenListeners={({ route }) => ({
          tabPress: () => {
            // add는 자체 리스너에서 Medium 임팩트를 준다
            if (route.name !== "add") hapticSelection();
          },
        })}
      >
        <Tabs.Screen
          name="workout"
          options={{
            tabBarIcon: ({ color }) => <WorkoutTabIcon color={color} />,
            tabBarLabel: t("tab.workout"),
            header: () => <WorkoutTabHeader />,
            headerTransparent: true,
          }}
        />
        <Tabs.Screen
          name="record"
          options={{
            title: t("tab.record"),
            tabBarIcon: ({ color }) => (
              <Entypo name="calendar" size={22} color={color} />
            ),
            header: ({ navigation, route, options }) => {
              return <ChartHeader />;
            },
            headerTransparent: true,
          }}
        />

        <Tabs.Screen
          name="add"
          options={{
            tabBarIcon: ({ color }) => (
              <View
                style={[
                  styles.addButton,
                  {
                    backgroundColor: themColor.tint,
                    marginBottom: 8,
                  },
                ]}
              >
                <Animated.View style={fabIconStyle}>
                  <FontAwesome6
                    name="plus"
                    size={28}
                    color={themColor.fabIcon}
                  />
                </Animated.View>
              </View>
            ),
            tabBarLabel: () => null,
          }}
          listeners={({ navigation }) => ({
            tabPress: (e) => {
              e.preventDefault();
              hapticMedium();
              setFabOpen((prev) => !prev);
            },
          })}
        />
        <Tabs.Screen
          name="shorts"
          options={{
            title: t("tab.shorts"),
            tabBarIcon: ({ color }) => (
              <Entypo name="video" size={26} color={color} />
            ),
            header: ({ navigation, route, options }) => {
              return <ShortsTabHeader />;
            },
            headerTransparent: true,
          }}
        />
        <Tabs.Screen
          name="my"
          options={{
            title: t("tab.my"),
            tabBarIcon: ({ color }) => (
              <Ionicons name="person" size={23} color={color} />
            ),
            headerShadowVisible: false,
            // 다른 탭들과 동일한 blur 헤더. 커스텀 header 대신 배경만 갈아끼우면
            // 타이틀 중앙 정렬은 기본 헤더가 그대로 맡는다
            headerTransparent: true,
            headerStyle: {
              backgroundColor: "transparent",
              height: tabHeaderHeight(insets.top),
            },
            // 바가 시작하는 높이 — 안드로이드는 iOS 내비 바 자리(안전영역 − 5⅓)에 맞춘다
            headerStatusBarHeight: headerBarTop(insets.top),
            headerTitleStyle: [tabOption.headerTitleStyle, headerTitleOffset],
            headerBackground: () => (
              <BarBackground style={StyleSheet.absoluteFill} />
            ),
          }}
        />
        <Tabs.Screen name="index" redirect />
      </Tabs>
      <FabOverlay isOpen={fabOpen} onClose={closeFab} />
    </View>
  );
}

const styles = StyleSheet.create({
  addButton: {
    width: 48,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
    borderRadius: 50,
  },
});
