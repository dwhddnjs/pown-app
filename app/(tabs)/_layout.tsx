import React from "react"
import { router, Tabs } from "expo-router"
import { SafeAreaView, useColorScheme } from "react-native"
import UserIcon from "@expo/vector-icons/FontAwesome"
import PlusIcon from "@expo/vector-icons/EvilIcons"
import { SymbolView } from "expo-symbols"
import Colors from "@/constants/Colors"
import { BlurView } from "expo-blur"
import { Text } from "@/components/Themed"

// You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/

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
          color: Colors[colorScheme ?? "light"].text,
        },

        // headerShadowVisible: false,
        tabBarStyle: {
          backgroundColor: Colors[colorScheme ?? "light"].tabBar,
          borderTopWidth: 0,
        },
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tabIconSelected,
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
          tabBarIcon: ({ color }) => (
            <SymbolView
              name="dumbbell.fill"
              type="hierarchical"
              tintColor={color}
            />
          ),
          tabBarLabel: "운동",

          header: ({ navigation, route, options }) => {
            return (
              <BlurView
                intensity={80}
                tint="dark"
                style={{
                  width: "100%",
                  paddingBottom: 10,
                  alignItems: "center",
                }}
              >
                <SafeAreaView>
                  <Text style={{ fontSize: 18, textAlign: "center" }}>
                    {options.title}
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
          title: "마이페이지",
          tabBarIcon: ({ color }) => (
            <UserIcon name="user" size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  )
}
