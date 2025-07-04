import { useEffect, useState } from "react"
// component
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native"
import {
  Alert,
  Appearance,
  TouchableOpacity,
  useColorScheme,
} from "react-native"
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet"
import { toast, Toaster } from "sonner-native"
//expo
import { useFonts } from "expo-font"
import { Stack, useGlobalSearchParams, useRouter } from "expo-router"
import * as SplashScreen from "expo-splash-screen"
import { ActionSheetProvider } from "@expo/react-native-action-sheet"
import * as MediaLibrary from "expo-media-library"
import { Camera } from "expo-camera"
// icons
import XIcon from "@expo/vector-icons/Feather"
import ArrowIcon from "@expo/vector-icons/AntDesign"
import Checkcircle from "@expo/vector-icons/AntDesign"
// lib
import { GestureHandlerRootView } from "react-native-gesture-handler"
import { format } from "date-fns"
// zustand
import { useNoteStore } from "@/hooks/use-note-store"
import { usePlanStore } from "@/hooks/use-plan-store"
import { useUserStore } from "@/hooks/use-user-store"
import { userWorkoutPlanStore } from "@/hooks/use-workout-plan-store"
// hooks
import useCurrneThemeColor from "@/hooks/use-current-theme-color"

export { ErrorBoundary } from "expo-router"

export const unstable_settings = {
  initialRouteName: "(drawer)/(tabs)/workout",
}
SplashScreen.preventAutoHideAsync()

SplashScreen.setOptions({
  duration: 1000,
  fade: true,
})

export default function RootLayout() {
  const [loaded, error] = useFonts({
    "sb-b": require("../assets/fonts/SB_B.otf"),
    "sb-l": require("../assets/fonts/SB_L.otf"),
    "sb-m": require("../assets/fonts/SB_M.otf"),
  })
  const colorScheme = useColorScheme()
  const { theme, setUser } = useUserStore()

  useEffect(() => {
    if (loaded) {
      SplashScreen.hide()
    }
  }, [loaded])

  // useEffect(() => {
  //   ;(async () => {
  //     await AsyncStorage.clear()
  //   })()
  // }, [])

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

  useEffect(() => {
    ;(async () => {
      try {
        const { status: cameraStatus } =
          await Camera.requestCameraPermissionsAsync()
        const { status: mediaStatus } =
          await MediaLibrary.requestPermissionsAsync()
        const { status: micStatus } =
          await Camera.requestMicrophonePermissionsAsync()

        if (cameraStatus === "granted") {
          setUser("camera", true)
        }
        if (mediaStatus === "granted") {
          setUser("mediaLibrary", true)
        }
        if (micStatus === "granted") {
          setUser("microphone", true)
        }
      } catch (error) {
        console.log("error: ", error)
      }
    })()
  }, [])

  useEffect(() => {
    if (error) throw error
  }, [error])

  if (!loaded) {
    return null
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
  )
}

function RootLayoutNav() {
  const themeColor = useCurrneThemeColor()
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

          headerLeft: () => {
            return (
              <TouchableOpacity
                onPress={() => {
                  navigation.goBack()
                }}
              >
                <XIcon name="x" size={30} color={themeColor.subText} />
              </TouchableOpacity>
            )
          },
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
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <XIcon name="x" size={30} color={themeColor.subText} />
            </TouchableOpacity>
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
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <XIcon name="x" size={30} color={themeColor.subText} />
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
            backgroundColor: themeColor.background,
          },
          headerShadowVisible: false,

          headerLeft: () => (
            <TouchableOpacity
              style={{ paddingLeft: 3, paddingTop: 18 }}
              onPress={() => navigation.goBack()}
            >
              <XIcon name="x" size={30} color={themeColor.subText} />
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
                style={{ paddingRight: 8, paddingTop: 18 }}
              >
                <Checkcircle
                  name="checkcircle"
                  size={30}
                  color={themeColor.tint}
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
            backgroundColor: themeColor.background,
          },
          headerShadowVisible: false,
          headerLeft: () => {
            const { onReset } = usePlanStore()
            return (
              <TouchableOpacity
                style={{
                  paddingRight: 16,
                }}
                onPress={() => {
                  onReset()
                  navigation.goBack()
                }}
              >
                <ArrowIcon name="left" size={28} color={themeColor.subText} />
              </TouchableOpacity>
            )
          },
          headerRight: () => {
            const { workoutPlanList, setWorkoutPlan } = userWorkoutPlanStore()
            const { onReset, ...result } = usePlanStore()
            const { onReset: onResetNote } = useNoteStore()
            const { slug } = useGlobalSearchParams()
            const { mediaLibrary } = useUserStore()

            const onSubmitWorkoutPlan = async () => {
              try {
                const imageUri =
                  mediaLibrary &&
                  (await Promise.all(
                    result.imageUri.map(async (item) => {
                      const asset = await MediaLibrary.createAssetAsync(
                        item.imageUri as string
                      )
                      const photoLib = await MediaLibrary.getAssetsAsync({
                        mediaType: "photo",
                      })
                      const findAsset = photoLib.assets.find(
                        (a) => a.uri === asset.uri
                      )
                      const assetInfo =
                        findAsset &&
                        (await MediaLibrary.getAssetInfoAsync(findAsset.id))

                      return {
                        id: item.id,
                        imageUri: assetInfo?.localUri,
                      }
                    })
                  ))
                if (result.weight && result.workout && route.params) {
                  setWorkoutPlan({
                    id: workoutPlanList.length + 1,
                    workout: result.workout,
                    type: slug as string,
                    equipment: result.equipment,
                    weight:
                      result.weightType === "lb"
                        ? Math.round(
                            parseInt(result.weight) / 2.20462
                          ).toString()
                        : result.weight,
                    condition: result.condition,
                    content: result.content,
                    title: result.title,
                    setWithCount: result.setWithCount,
                    createdAt: format(result.date, "yyyy.MM.dd HH:mm:ss"),
                    updatedAt: format(result.date, "yyyy.MM.dd HH:mm:ss"),
                    imageUri: imageUri ? imageUri : [],
                  })
                  onReset()
                  navigation.goBack()
                  onResetNote()
                  return toast.success("운동 계획을 추가되었습니다!!")
                }
                return toast.error("운동과 목표 중량은 필수에요..")
              } catch (error) {
                console.log("error: ", error)
              }
            }

            return (
              <TouchableOpacity
                onPress={() => onSubmitWorkoutPlan()}
                style={{
                  paddingRight: 8,
                  paddingLeft: 16,
                }}
              >
                <Checkcircle
                  name="checkcircle"
                  size={30}
                  color={themeColor.tint}
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
            backgroundColor: themeColor.background,
          },
          headerShadowVisible: false,
          headerLeft: () => {
            const { onReset } = usePlanStore()
            return (
              <TouchableOpacity
                style={{
                  paddingRight: 16,
                }}
                onPress={() => {
                  onReset()
                  navigation.goBack()
                }}
              >
                <ArrowIcon name="left" size={28} color={themeColor.subText} />
              </TouchableOpacity>
            )
          },
          headerRight: () => {
            const { workoutPlanList, setWorkoutPlan, setEditPlan } =
              userWorkoutPlanStore()
            const { back } = useRouter()
            const { onReset, setPrevPlanValue, ...result } = usePlanStore()

            const { onReset: onResetNote } = useNoteStore()
            const { slug } = useGlobalSearchParams()
            const getWorkoutPlan = workoutPlanList.filter(
              (item) => slug && item.id === parseInt(slug[1])
            )[0]
            const { mediaLibrary } = useUserStore()

            const onSubmitWorkoutPlan = async () => {
              try {
                const alreadySavedImages = result.imageUri?.filter((item) =>
                  item.imageUri?.includes("/DCIM/")
                )

                const newImages = result.imageUri?.filter(
                  (item) => !item.imageUri?.includes("/DCIM/")
                )

                const imageUri =
                  mediaLibrary &&
                  (await Promise.all(
                    newImages.map(async (item) => {
                      const asset = await MediaLibrary.createAssetAsync(
                        item.imageUri as string
                      )
                      const photoLib = await MediaLibrary.getAssetsAsync({
                        mediaType: "photo",
                      })
                      const findAsset = photoLib.assets.find(
                        (a) => a.uri === asset.uri
                      )
                      const assetInfo =
                        findAsset &&
                        (await MediaLibrary.getAssetInfoAsync(findAsset.id))
                      return {
                        id: item.id,
                        imageUri: assetInfo?.localUri,
                      }
                    })
                  ))

                const newImagesList = [
                  ...alreadySavedImages,
                  ...(imageUri as any),
                ]

                if (result.weight && result.workout) {
                  setEditPlan({
                    id: parseInt(slug[1]),
                    workout: result.workout,
                    type: slug[0],
                    equipment: result.equipment,
                    weight:
                      result.weightType === "lb"
                        ? Math.round(
                            parseInt(result.weight) / 2.20462
                          ).toString()
                        : result.weight,
                    condition: result.condition,
                    content: result.content,
                    title: result.title,
                    setWithCount: result.setWithCount.map((item, index) => ({
                      ...item,
                      id: index + 1,
                    })),
                    createdAt: getWorkoutPlan.createdAt,
                    updatedAt: getWorkoutPlan.updatedAt,
                    imageUri: newImagesList ? newImagesList : [],
                  })
                  onReset()
                  back()
                  onResetNote()
                  return toast.success("운동 계획을 수정되었습니다!!")
                }
                return toast.error("운동과 목표 중량은 필수에요..")
              } catch (error) {
                console.log("error: ", error)
              }
            }

            return (
              <TouchableOpacity
                onPress={() => {
                  onSubmitWorkoutPlan()
                }}
                style={{
                  paddingRight: 8,
                  paddingLeft: 16,
                }}
              >
                <Checkcircle
                  name="checkcircle"
                  size={30}
                  color={themeColor.tint}
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
            backgroundColor: themeColor.background,
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
              <XIcon name="x" size={30} color={themeColor.subText} />
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
            backgroundColor: themeColor.background,
          },
          headerTitleStyle: {
            fontFamily: "sb-m",
          },
          headerLeft: () => (
            <TouchableOpacity
              style={{ marginLeft: 6 }}
              onPress={() => navigation.goBack()}
            >
              <ArrowIcon name="left" size={24} color={themeColor.subText} />
            </TouchableOpacity>
          ),
        })}
      />
      <Stack.Screen
        name="mypage/user-info"
        options={({ navigation }) => ({
          headerTitle: "내정보 작성",
          headerTitleStyle: {
            fontFamily: "sb-m",
          },
          animation: "slide_from_bottom",
          headerLeft: () => (
            <TouchableOpacity
              style={{
                paddingLeft: 4,
                paddingRight: 12,
                paddingVertical: 4,
              }}
              onPress={() => navigation.goBack()}
            >
              <ArrowIcon name="down" size={30} color={themeColor.subText} />
            </TouchableOpacity>
          ),
        })}
      />
      <Stack.Screen
        name="mypage/theme-mode"
        options={({ navigation }) => ({
          headerTitle: "컬러 모드 선택",
          animation: "slide_from_bottom",
          headerLeft: () => (
            <TouchableOpacity
              style={{
                paddingLeft: 4,
                paddingRight: 12,
                paddingVertical: 4,
              }}
              onPress={() => navigation.goBack()}
            >
              <ArrowIcon name="down" size={30} color={themeColor.subText} />
            </TouchableOpacity>
          ),
        })}
      />
      <Stack.Screen
        name="mypage/reset-data"
        options={({ navigation }) => ({
          headerTitle: "데이터 관리",
          animation: "slide_from_bottom",
          headerLeft: () => (
            <TouchableOpacity
              style={{
                paddingLeft: 4,
                paddingRight: 12,
                paddingVertical: 4,
              }}
              onPress={() => navigation.goBack()}
            >
              <ArrowIcon name="down" size={30} color={themeColor.subText} />
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
            headerLeft: () => (
              <TouchableOpacity
                style={{ paddingLeft: 4, paddingVertical: 12 }}
                onPress={() => navigation.goBack()}
              >
                <ArrowIcon name="left" size={24} color={themeColor.subText} />
              </TouchableOpacity>
            ),
          }
        }}
      />
      <Stack.Screen
        name="add-plan/camera"
        options={({ navigation }) => ({
          headerTitle: "사진 찍기",
          headerShown: false,
          headerTitleStyle: {
            fontFamily: "sb-m",
          },
          animation: "slide_from_bottom",
          headerLeft: () => (
            <TouchableOpacity
              style={{
                paddingLeft: 4,
                paddingRight: 12,
                paddingVertical: 4,
              }}
              onPress={() => navigation.goBack()}
            >
              <ArrowIcon name="down" size={30} color={themeColor.subText} />
            </TouchableOpacity>
          ),
        })}
      />
      <Stack.Screen
        name="mypage/settings"
        options={({ navigation }) => ({
          title: "설정",
          headerLeft: () => (
            <TouchableOpacity
              style={{
                paddingLeft: 4,
                paddingRight: 12,
                paddingVertical: 4,
              }}
              onPress={() => navigation.goBack()}
            >
              <ArrowIcon name="left" size={30} color={themeColor.subText} />
            </TouchableOpacity>
          ),
        })}
      />
      <Stack.Screen
        name="shorts/video"
        options={({ navigation }) => ({
          headerTitle: "비디오 촬영",
          headerShown: false,
          headerTitleStyle: {
            fontFamily: "sb-m",
          },
          animation: "slide_from_bottom",
          headerLeft: () => (
            <TouchableOpacity
              style={{
                paddingLeft: 4,
                paddingRight: 12,
                paddingVertical: 4,
              }}
              onPress={() => navigation.goBack()}
            >
              <ArrowIcon name="down" size={30} color={themeColor.subText} />
            </TouchableOpacity>
          ),
        })}
      />
      <Stack.Screen
        name="shorts/[...slug]"
        options={({ navigation }) => ({
          headerTitle: "",
          // headerStyle: {
          //   borderBottomWidth: 0,
          //   elevation: 0,
          //   shadowOpacity: 0,
          //   backgroundColor: themeColor.background,
          // },

          // headerShadowVisible: false,
          headerShown: false,
          headerLeft: () => {
            return (
              <TouchableOpacity
                style={{
                  paddingRight: 16,
                }}
                onPress={() => {
                  navigation.goBack()
                }}
              >
                <ArrowIcon name="left" size={28} color={themeColor.subText} />
              </TouchableOpacity>
            )
          },
        })}
      />
    </Stack>
  )
}
