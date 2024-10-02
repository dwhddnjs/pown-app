import React from "react"
import FontAwesome from "@expo/vector-icons/FontAwesome"
import { Link, router, Tabs } from "expo-router"
import { Pressable, useColorScheme } from "react-native"
// import { GiMuscleUp } from "react-icons/gi"
import DumbelIcon from "@expo/vector-icons/FontAwesome5"
import UserIcon from "@expo/vector-icons/FontAwesome"
import PlusIcon from "@expo/vector-icons/EvilIcons"

import Colors from "@/constants/Colors"
import ModalScreen from "../(modals)/select-type"
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
            <DumbelIcon name="dumbbell" size={20} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="add"
        options={{
          tabBarIcon: ({ color }) => (
            <PlusIcon
              name="plus"
              size={50}
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
            <UserIcon name="user" size={20} color={color} />
          ),
        }}
      />
    </Tabs>
  )
}
