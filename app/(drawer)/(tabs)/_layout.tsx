import React from "react"
// compoents
import { Pressable, StyleSheet, TouchableOpacity } from "react-native"
import { View } from "@/components/Themed"
import WorkoutTabHeader from "@/components/workout-plan/workout-tab-header"
import { ChartHeader } from "@/components/chart"
// expo
import { router, Tabs } from "expo-router"
import { Image } from "expo-image"
// icon
import UserIcon from "@expo/vector-icons/FontAwesome"
import AntDesign from "@expo/vector-icons/AntDesign"
import { SymbolView } from "expo-symbols"
import Entypo from "@expo/vector-icons/Entypo"
// hook
import useCurrneThemeColor from "@/hooks/use-current-theme-color"
import { CalendarHeader } from "@/components/calendar"
import { useImageUriStore } from "@/hooks/use-image-uri-store"
import ImageModal from "@/components/workout-plan/image-modal"
import ShortsTabHeader from "@/components/shorts/shorts-tab-header"

export default function TabLayout() {
  const themColor = useCurrneThemeColor()
  const { uri, onResetImageUri } = useImageUriStore()

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
      paddingHorizontal: 12,
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
            header: ({ navigation, route, options }) => {
              return <CalendarHeader />
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
              return <ShortsTabHeader />
            },
            headerTransparent: true,
          }}
        />
        <Tabs.Screen name="index" redirect />
      </Tabs>
      {uri && <ImageModal />}
    </View>
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
