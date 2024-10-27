import React from "react"
import FontAwesome from "@expo/vector-icons/FontAwesome"
import { Link, router, Tabs } from "expo-router"
import { Pressable, SafeAreaView, useColorScheme } from "react-native"
// import { GiMuscleUp } from "react-icons/gi"
import DumbelIcon from "@expo/vector-icons/FontAwesome5"
import UserIcon from "@expo/vector-icons/FontAwesome"
import PlusIcon from "@expo/vector-icons/EvilIcons"
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons"
import { SymbolView, SymbolViewProps, SFSymbol } from "expo-symbols"

import Colors from "@/constants/Colors"
import ModalScreen from "../(modals)/select-type"
import { BlurView } from "expo-blur"
import { Text } from "@/components/Themed"
import { useHeaderHeight } from "@react-navigation/elements"
// import { useColorScheme } from '@/components/useColorScheme';
// import { useClientOnlyValue } from '@/components/useClientOnlyValue';

// You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>["name"]
  color: string
}) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />
}

export default function TabLayout() {
  const colorScheme = useColorScheme()

  return (
    <Tabs
      screenOptions={{
        headerStyle: {
          backgroundColor: Colors[colorScheme ?? "light"].background,
        },
        headerTitleStyle: {
          fontFamily: "sb-m",
        },
        tabBarStyle: {
          backgroundColor: Colors[colorScheme ?? "light"].tabBar,
        },
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        tabBarItemStyle: {
          paddingBottom: 3,
          paddingTop: 3,
        },
        tabBarLabelStyle: {
          fontFamily: "sb-m",
        },
      }}
    >
      <Tabs.Screen
        name="workout"
        options={{
          title: "운동",
          tabBarIcon: ({ color }) => (
            // <DumbelIcon name="dumbbell" size={20} color={color} />
            <SymbolView
              name="dumbbell.fill"
              type="hierarchical"
              tintColor={color}
              //   size={24}
            />
          ),
          header: ({ navigation, route, options }) => {
            return (
              <BlurView
                intensity={80}
                tint="default"
                style={{
                  width: "100%",
                  paddingBottom: 10,
                  alignItems: "center",
                }}
              >
                <SafeAreaView>
                  <Text style={{ fontSize: 18, textAlign: "center" }}>
                    🔥 오늘의 운동
                  </Text>
                </SafeAreaView>
              </BlurView>
            )
          },
          headerTransparent: true,
        }}
      />
      <Tabs.Screen
        name="add"
        options={{
          tabBarIcon: ({ color }) => (
            <PlusIcon
              name="plus"
              size={54}
              color={colorScheme === "dark" ? "#ffffff" : "#000000"}
            />
          ),
          tabBarLabel: () => null,
        }}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            e.preventDefault()
            router.push("/(modals)/select-type")
          },
        })}
      />
      <Tabs.Screen
        name="mypage"
        options={{
          title: "내 정보",
          tabBarIcon: ({ color }) => (
            <UserIcon name="user" size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  )
}
