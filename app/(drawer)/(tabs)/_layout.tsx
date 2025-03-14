import React from "react"
// compoents
import { StyleSheet } from "react-native"
import { View } from "@/components/Themed"
import WorkoutTabHeader from "@/components/workout-plan/workout-tab-header"
import { ChartHeader } from "@/components/chart"
// expo
import { router, Tabs } from "expo-router"
// icon
import UserIcon from "@expo/vector-icons/FontAwesome"
import AntDesign from "@expo/vector-icons/AntDesign"
import { SymbolView } from "expo-symbols"
import Entypo from "@expo/vector-icons/Entypo"
// hook
import useCurrneThemeColor from "@/hooks/use-current-theme-color"

export default function TabLayout() {
  const themColor = useCurrneThemeColor()

  const tabOption = {
    headerStyle: {
      backgroundColor: themColor.background,
    },
    headerTitleStyle: {
      fontFamily: "sb-m",
      color: themColor.text,
    },
    tabBarStyle: {
      backgroundColor: themColor.tabBar,
      borderTopWidth: 0,
    },
    tabBarActiveTintColor: themColor.tabIconSelected,
    tabBarItemStyle: {
      paddingBottom: 3,
      paddingTop: 3,
    },
    tabBarLabelStyle: {
      fontFamily: "sb-m",
      fontSize: 8,
    },
  }

  return (
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
            return <ChartHeader />
          },
          headerTransparent: true,
        }}
      />

      <Tabs.Screen
        name="add"
        options={{
          tabBarIcon: ({ color }) => (
            <View style={styles.addButton}>
              <AntDesign name="pluscircle" size={48} color={themColor.tint} />
            </View>
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
        name="calendar"
        options={{
          title: "캘린더",
          tabBarIcon: ({ color }) => (
            <Entypo name="calendar" size={24} color={color} />
          ),
        }}
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
      <Tabs.Screen name="index" redirect />
    </Tabs>
  )
}

const styles = StyleSheet.create({
  addButton: {
    width: 48,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
  },
})
