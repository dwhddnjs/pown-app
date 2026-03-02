import React, { useEffect, useState } from "react";
// compoents
import { StyleSheet } from "react-native";
import { View } from "@/components/Themed";
import WorkoutTabHeader from "@/components/workout-plan/workout-tab-header";
import { ChartHeader } from "@/components/chart";
// expo
import { Tabs } from "expo-router";
import { BlurView } from "expo-blur";
// icon
import AntDesign from "@expo/vector-icons/AntDesign";
import { SymbolView } from "expo-symbols";
import Entypo from "@expo/vector-icons/Entypo";
// hook
import useCurrentThemeColor from "@/hooks/use-current-theme-color";
import { CalendarHeader } from "@/components/calendar";
import { useImageUriStore } from "@/hooks/use-image-uri-store";
import ImageModal from "@/components/workout-plan/image-modal";
import ShortsTabHeader from "@/components/shorts/shorts-tab-header";
import { FontAwesome6 } from "@expo/vector-icons";
import FabOverlay from "@/components/fab-menu/fab-overlay";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
  Easing,
} from "react-native-reanimated";

export default function TabLayout() {
  const themColor = useCurrentThemeColor();
  const { uri } = useImageUriStore();
  const [fabOpen, setFabOpen] = useState(false);
  const fabProgress = useSharedValue(0);

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

  const tabOption = {
    headerStyle: {
      backgroundColor: themColor.background,
    },
    headerTitleStyle: {
      fontFamily: "sb-m",
      color: themColor.text,
    },
    tabBarStyle: {
      backgroundColor: "transparent",
      borderTopWidth: 0,
      paddingHorizontal: 12,
      position: "absolute" as const,
      zIndex: 200,
    },
    tabBarBackground: () => (
      <BlurView
        intensity={80}
        tint="systemChromeMaterial"
        style={StyleSheet.absoluteFill}
      />
    ),
    tabBarActiveTintColor: themColor.tabIconSelected,
    tabBarItemStyle: {
      paddingBottom: 3,
      paddingTop: 3,
    },
    tabBarLabelStyle: {
      fontFamily: "sb-m",
      fontSize: 8,
    },
  };

  return (
    <View style={{ flex: 1 }}>
      <Tabs screenOptions={tabOption}>
        <Tabs.Screen
          name="workout"
          options={{
            tabBarIcon: ({ color }) => (
              <SymbolView
                name="dumbbell.fill"
                type="hierarchical"
                tintColor={color}
                size={32}
              />
            ),
            tabBarLabel: "운동계획",
            header: ({ navigation, route, options }) => (
              <WorkoutTabHeader title={options.title} />
            ),
            headerTransparent: true,
          }}
        />
        <Tabs.Screen
          name="chart"
          options={{
            title: "차트",
            tabBarIcon: ({ color }) => (
              <AntDesign name="piechart" size={24} color={color} />
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
                    size={30}
                    color={themColor.background}
                  />
                </Animated.View>
              </View>
            ),
            tabBarLabel: () => null,
          }}
          listeners={({ navigation }) => ({
            tabPress: (e) => {
              e.preventDefault();
              setFabOpen((prev) => !prev);
            },
          })}
        />
        <Tabs.Screen
          name="calendar"
          options={{
            title: "캘린더",
            tabBarIcon: ({ color }) => (
              <Entypo name="calendar" size={24} color={color} />
            ),
            header: ({ navigation, route, options }) => {
              return <CalendarHeader />;
            },
            headerTransparent: true,
          }}
        />
        <Tabs.Screen
          name="shorts"
          options={{
            title: "내 숏츠",
            tabBarIcon: ({ color }) => (
              <Entypo name="video" size={24} color={color} />
            ),
            header: ({ navigation, route, options }) => {
              return <ShortsTabHeader />;
            },
            headerTransparent: true,
          }}
        />
        <Tabs.Screen name="index" redirect />
      </Tabs>
      {uri && <ImageModal />}
      <FabOverlay isOpen={fabOpen} onClose={() => setFabOpen(false)} />
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
