import Colors from "@/constants/Colors"
import FontAwesome from "@expo/vector-icons/FontAwesome"
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native"
import { useFonts } from "expo-font"
import {
  Stack,
  useGlobalSearchParams,
  useLocalSearchParams,
  useRouter,
} from "expo-router"
import * as SplashScreen from "expo-splash-screen"
import { useEffect, useState } from "react"
import {
  Appearance,
  Keyboard,
  NativeSyntheticEvent,
  TextInputFocusEventData,
  TouchableOpacity,
  useColorScheme,
} from "react-native"
import XIcon from "@expo/vector-icons/Feather"
import "react-native-reanimated"
import ArrowIcon from "@expo/vector-icons/AntDesign"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet"
import Checkcircle from "@expo/vector-icons/AntDesign"
import { useNoteStore } from "@/hooks/use-note-store"
import { usePlanStore } from "@/hooks/use-plan-store"
import { toast, Toaster } from "sonner-native"
import { useUserStore } from "@/hooks/use-user-store"
import { SearchBarProps } from "react-native-screens"
import { useSearchInputStore } from "@/hooks/use-search-input-store"
import { useKeyboardVisible } from "@/hooks/use-keyboard-visible"
import * as Updates from "expo-updates"
import { ActionSheetProvider } from "@expo/react-native-action-sheet"
import { userWorkoutPlanStore } from "@/hooks/use-workout-plan-store"
import { format } from "date-fns"

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from "expo-router"

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: "(drawer)/(tabs)/workout",
}

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync()

export default function RootLayout() {
  const { replace } = useRouter()

  const [loaded, error] = useFonts({
    "sb-b": require("../assets/fonts/SB_B.otf"),
    "sb-l": require("../assets/fonts/SB_L.otf"),
    "sb-m": require("../assets/fonts/SB_M.otf"),
  })

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error
  }, [error])

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync()
    }
  }, [loaded])

  if (!loaded) {
    return null
  }

  return <RootLayoutNav />
}

function RootLayoutNav() {
  const colorScheme = useColorScheme()
  const isKeyboardVisible = useKeyboardVisible()

  //   const { setUser } = useUser()

  const { theme } = useUserStore()

  useEffect(() => {
    if (theme === "system") {
      Appearance.setColorScheme(null)
    }

    if (theme == "dark") {
      Appearance.setColorScheme("dark")
    }

    if (theme == "light") {
      Appearance.setColorScheme("light")
    }
  }, [])

  //   useEffect(() => {
  //     supabase.auth.onAuthStateChange((_event, session) => {
  //       setUser(session)
  //     })
  //   }, [])

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <ActionSheetProvider>
          <BottomSheetModalProvider>
            <Stack
              screenOptions={{
                headerStyle: {
                  backgroundColor: Colors[colorScheme ?? "light"].background,
                },
                headerTitleStyle: {
                  color: Colors[colorScheme ?? "light"].text,
                  fontFamily: "sb-m",
                },
              }}
            >
              <Stack.Screen name="(drawer)" options={{ headerShown: false }} />
              <Stack.Screen
                name="(modals)/select-type"
                options={({ navigation }) => ({
                  presentation: "modal",
                  headerTitle: "",
                  headerStyle: {
                    borderBottomWidth: 0,
                    elevation: 0,
                    shadowOpacity: 0,
                    backgroundColor: Colors[colorScheme ?? "light"].background,
                  },
                  headerShadowVisible: false,

                  headerLeft: () => (
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                      <XIcon
                        name="x"
                        size={30}
                        color={Colors[colorScheme ?? "light"].subText}
                      />
                    </TouchableOpacity>
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
                    backgroundColor: Colors[colorScheme ?? "light"].background,
                  },
                  headerShadowVisible: false,

                  headerLeft: () => (
                    <TouchableOpacity
                      style={{ marginLeft: 3, marginTop: 18 }}
                      onPress={() => navigation.goBack()}
                    >
                      <XIcon
                        name="x"
                        size={30}
                        color={Colors[colorScheme ?? "light"].subText}
                      />
                    </TouchableOpacity>
                  ),
                  headerRight: () => {
                    const { title, content } = useNoteStore()
                    const { setPlanValue, onReset } = usePlanStore()

                    return (
                      <TouchableOpacity
                        onPress={() => {
                          setPlanValue("title", title)
                          setPlanValue("content", content)
                          navigation.goBack()
                        }}
                        style={{ marginRight: 8, marginTop: 18 }}
                      >
                        <Checkcircle
                          name="checkcircle"
                          size={30}
                          color={Colors[colorScheme ?? "light"].tint}
                        />
                      </TouchableOpacity>
                    )
                  },
                })}
              />
              <Stack.Screen
                name="add-plan/[slug]"
                options={({ navigation, route }) => ({
                  headerTitle: "",
                  headerStyle: {
                    borderBottomWidth: 0,
                    elevation: 0,
                    shadowOpacity: 0,
                    backgroundColor: Colors[colorScheme ?? "light"].background,
                  },
                  headerShadowVisible: false,
                  // headerBlurEffect: "regular",
                  // headerTransparent: true,

                  headerLeft: () => {
                    const { onReset } = usePlanStore()
                    return (
                      <TouchableOpacity
                        onPress={() => {
                          onReset()
                          navigation.goBack()
                        }}
                      >
                        <ArrowIcon
                          name="left"
                          size={28}
                          color={Colors[colorScheme ?? "light"].subText}
                        />
                      </TouchableOpacity>
                    )
                  },
                  headerRight: () => {
                    const { workoutPlanList, setWorkoutPlan } =
                      userWorkoutPlanStore()
                    const { onReset, ...result } = usePlanStore()
                    const { onReset: onResetNote } = useNoteStore()
                    const { slug } = useGlobalSearchParams()

                    return (
                      <TouchableOpacity
                        onPress={() => {
                          if (result.weight && result.workout && route.params) {
                            setWorkoutPlan({
                              id: workoutPlanList.length + 1,
                              workout: result.workout,
                              type: slug as string,
                              equipment: result.equipment,
                              weight: result.weight,
                              condition: result.condition,
                              content: result.content,
                              title: result.title,
                              setWithCount: result.setWithCount,
                              createdAt: format(
                                new Date(),
                                "yyyy.MM.dd HH:mm:ss"
                              ),

                              updatedAt: format(
                                new Date(),
                                "yyyy.MM.dd HH:mm:ss"
                              ),
                            })
                            onReset()
                            navigation.goBack()
                            onResetNote()
                            return toast.success("운동 계획을 추가되었습니다!!")
                          }
                          return toast.error("운동과 목표 중량은 필수에요..")
                        }}
                        style={{ marginRight: 8 }}
                      >
                        <Checkcircle
                          name="checkcircle"
                          size={30}
                          color={Colors[colorScheme ?? "light"].tint}
                        />
                      </TouchableOpacity>
                    )
                  },
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
                    backgroundColor: Colors[colorScheme ?? "light"].background,
                  },
                  headerShadowVisible: false,
                  //   gestureEnabled: false,
                  //   gestureDirection: "horizaltal",
                  // headerBlurEffect: "regular",
                  // headerTransparent: true,

                  headerLeft: () => {
                    const { onReset } = usePlanStore()
                    return (
                      <TouchableOpacity
                        onPress={() => {
                          onReset()
                          navigation.goBack()
                        }}
                      >
                        <ArrowIcon
                          name="left"
                          size={28}
                          color={Colors[colorScheme ?? "light"].subText}
                        />
                      </TouchableOpacity>
                    )
                  },
                  headerRight: () => {
                    const { workoutPlanList, setWorkoutPlan, setEditPlan } =
                      userWorkoutPlanStore()
                    const { back } = useRouter()
                    const { onReset, setPrevPlanValue, ...result } =
                      usePlanStore()
                    const { onReset: onResetNote } = useNoteStore()
                    const { slug } = useGlobalSearchParams()
                    const getWorkoutPlan = workoutPlanList.filter(
                      (item) => slug && item.id === parseInt(slug[1])
                    )[0]
                    return (
                      <TouchableOpacity
                        onPress={() => {
                          if (result.weight && result.workout) {
                            setEditPlan({
                              id: parseInt(slug[1]),
                              workout: result.workout,
                              type: slug[0],
                              equipment: result.equipment,
                              weight: result.weight,
                              condition: result.condition,
                              content: result.content,
                              title: result.title,
                              setWithCount: result.setWithCount.map(
                                (item, index) => ({
                                  ...item,
                                  id: index + 1,
                                })
                              ),
                              createdAt: getWorkoutPlan.createdAt,
                              updatedAt: getWorkoutPlan.updatedAt,
                            })
                            onReset()
                            back()
                            onResetNote()
                            return toast.success("운동 계획을 수정되었습니다!!")
                          }
                          return toast.error("운동과 목표 중량은 필수에요..")
                        }}
                        style={{ marginRight: 8 }}
                      >
                        <Checkcircle
                          name="checkcircle"
                          size={30}
                          color={Colors[colorScheme ?? "light"].tint}
                        />
                      </TouchableOpacity>
                    )
                  },
                })}
              />
              <Stack.Screen
                name="auth/sign-in"
                options={({ navigation }) => ({
                  headerTitle: "",
                  headerStyle: {
                    borderBottomWidth: 0,
                    elevation: 0,
                    shadowOpacity: 0,
                    backgroundColor: Colors[colorScheme ?? "light"].background,
                  },
                  headerShadowVisible: false,
                  animation: "slide_from_bottom",

                  headerLeft: () => (
                    <TouchableOpacity
                      style={{ marginLeft: 4 }}
                      onPress={() => {
                        navigation.goBack()
                      }}
                    >
                      <XIcon
                        name="x"
                        size={30}
                        color={Colors[colorScheme ?? "light"].subText}
                      />
                    </TouchableOpacity>
                  ),
                })}
              />
              <Stack.Screen
                name="auth/sign-up"
                options={({ navigation }) => ({
                  headerTitle: "회원가입",
                  headerStyle: {
                    borderBottomWidth: 0,
                    elevation: 0,
                    shadowOpacity: 0,
                    backgroundColor: Colors[colorScheme ?? "light"].background,
                  },
                  headerTitleStyle: {
                    fontFamily: "sb-m",
                  },
                  // headerShadowVisible: false,

                  headerLeft: () => (
                    <TouchableOpacity
                      style={{ marginLeft: 6 }}
                      onPress={() => navigation.goBack()}
                    >
                      <ArrowIcon
                        name="left"
                        size={24}
                        color={Colors[colorScheme ?? "light"].subText}
                      />
                    </TouchableOpacity>
                  ),
                  // headerRight: () => (
                  //   <TouchableOpacity
                  //     onPress={() => navigation.goBack()}
                  //     style={{ marginRight: 8 }}
                  //   >
                  //     <Checkcircle
                  //       name="checkcircle"
                  //       size={30}
                  //       color={Colors[colorScheme ?? "light"].tint}
                  //     />
                  //   </TouchableOpacity>
                  // ),
                })}
              />
              <Stack.Screen
                name="mypage/user-info"
                options={({ navigation }) => ({
                  headerTitle: "내정보 작성",
                  headerTitleStyle: {
                    fontFamily: "sb-m",
                  },
                  // headerShadowVisible: false,
                  animation: "slide_from_bottom",

                  headerLeft: () => (
                    <TouchableOpacity
                      style={{ marginLeft: 4 }}
                      onPress={() => navigation.goBack()}
                    >
                      <ArrowIcon
                        name="down"
                        size={30}
                        color={Colors[colorScheme ?? "light"].subText}
                      />
                    </TouchableOpacity>
                  ),
                  // headerRight: () => (
                  //   <TouchableOpacity
                  //     onPress={() => navigation.goBack()}
                  //     style={{ marginRight: 8 }}
                  //   >
                  //     <Checkcircle
                  //       name="checkcircle"
                  //       size={30}
                  //       color={Colors[colorScheme ?? "light"].tint}
                  //     />
                  //   </TouchableOpacity>
                  // ),
                })}
              />
              <Stack.Screen
                name="mypage/max-weights"
                options={({ navigation }) => ({
                  headerTitle: "3대 중량",
                  // headerShadowVisible: false,
                  animation: "slide_from_bottom",
                  headerLeft: () => (
                    <TouchableOpacity
                      style={{ marginLeft: 4 }}
                      onPress={() => navigation.goBack()}
                    >
                      <ArrowIcon
                        name="down"
                        size={30}
                        color={Colors[colorScheme ?? "light"].subText}
                      />
                    </TouchableOpacity>
                  ),
                  // headerRight: () => (
                  //   <TouchableOpacity
                  //     onPress={() => navigation.goBack()}
                  //     style={{ marginRight: 8 }}
                  //   >
                  //     <Checkcircle
                  //       name="checkcircle"
                  //       size={30}
                  //       color={Colors[colorScheme ?? "light"].tint}
                  //     />
                  //   </TouchableOpacity>
                  // ),
                })}
              />
              <Stack.Screen
                name="mypage/theme-mode"
                options={({ navigation }) => ({
                  headerTitle: "컬러 모드 선택",
                  // headerShadowVisible: false,
                  animation: "slide_from_bottom",
                  headerLeft: () => (
                    <TouchableOpacity
                      style={{ marginLeft: 4 }}
                      onPress={() => navigation.goBack()}
                    >
                      <ArrowIcon
                        name="down"
                        size={30}
                        color={Colors[colorScheme ?? "light"].subText}
                      />
                    </TouchableOpacity>
                  ),
                  // headerRight: () => (
                  //   <TouchableOpacity
                  //     onPress={() => navigation.goBack()}
                  //     style={{ marginRight: 8 }}
                  //   >
                  //     <Checkcircle
                  //       name="checkcircle"
                  //       size={30}
                  //       color={Colors[colorScheme ?? "light"].tint}
                  //     />
                  //   </TouchableOpacity>
                  // ),
                })}
              />
              <Stack.Screen
                name="mypage/reset-data"
                options={({ navigation }) => ({
                  headerTitle: "데이터 초기화",
                  animation: "slide_from_bottom",
                  headerLeft: () => (
                    <TouchableOpacity
                      style={{ marginLeft: 4 }}
                      onPress={() => navigation.goBack()}
                    >
                      <ArrowIcon
                        name="down"
                        size={30}
                        color={Colors[colorScheme ?? "light"].subText}
                      />
                    </TouchableOpacity>
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

                    //   headerShown: false,
                    headerLeft: () => (
                      <TouchableOpacity
                        style={{ marginLeft: 4 }}
                        onPress={() => navigation.goBack()}
                      >
                        <ArrowIcon
                          name="left"
                          size={24}
                          color={Colors[colorScheme ?? "light"].subText}
                        />
                      </TouchableOpacity>
                    ),
                  }
                }}
              />
            </Stack>
            <Toaster />
          </BottomSheetModalProvider>
        </ActionSheetProvider>
      </GestureHandlerRootView>
    </ThemeProvider>
  )
}
