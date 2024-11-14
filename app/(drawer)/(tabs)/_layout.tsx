import React from "react"
import { router, Tabs, useRouter } from "expo-router"
import { SafeAreaView, TouchableOpacity, useColorScheme } from "react-native"
import UserIcon from "@expo/vector-icons/FontAwesome"
import PlusIcon from "@expo/vector-icons/EvilIcons"
import { SymbolView } from "expo-symbols"
import Colors from "@/constants/Colors"
import { BlurView } from "expo-blur"
import { Text, View } from "@/components/Themed"
import FontAwesome from "@expo/vector-icons/FontAwesome"
import { DrawerToggleButton } from "@react-navigation/drawer"

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
          tabBarLabel: "운동계획",

          header: ({ navigation, route, options }) => {
            const { push } = useRouter()
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
                  <View
                    style={{
                      backgroundColor: "transparent",
                      width: "100%",
                      paddingVertical: 2,
                      paddingLeft: 8,
                      paddingRight: 25,
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                      //   borderColor: 1,
                    }}
                  >
                    <DrawerToggleButton
                      tintColor={Colors[colorScheme ?? "light"].text}
                    />
                    {/* <TouchableOpacity>
                      <FontAwesome
                        name="navicon"
                        size={24}
                        color={Colors[colorScheme ?? "light"].text}
                      />
                    </TouchableOpacity> */}
                    <Text style={{ fontSize: 18, textAlign: "center" }}>
                      {options.title}
                    </Text>
                    <TouchableOpacity onPress={() => push("/workout/search")}>
                      <FontAwesome
                        name="search"
                        size={20}
                        color={Colors[colorScheme ?? "light"].text}
                      />
                    </TouchableOpacity>
                  </View>
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
