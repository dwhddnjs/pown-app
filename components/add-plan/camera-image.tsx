import { StyleSheet, TouchableOpacity, useColorScheme } from "react-native"
import { Text, View } from "../Themed"
import AntDesign from "@expo/vector-icons/AntDesign"

import Colors from "@/constants/Colors"
import { Button } from "../Button"
import { IconTitle } from "../IconTitle"
import { usePlanStore } from "@/hooks/use-plan-store"
import { useRef, useState } from "react"
import { InputRefObject } from "@/app/add-plan/[slug]"
import useCurrneThemeColor from "@/hooks/use-current-theme-color"
import { useRouter } from "expo-router"
import {
  CameraMode,
  CameraType,
  CameraView,
  useCameraPermissions,
} from "expo-camera"

interface CameraImageProps {}

export const CameraImage = ({}: CameraImageProps) => {
  const themeColor = useCurrneThemeColor()
  const router = useRouter()
  const [permission, requestPermission] = useCameraPermissions()

  if (!permission) {
    return null
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={{ textAlign: "center" }}>
          We need your permission to use the camera
        </Text>
        <Button onPress={requestPermission} type={"solid"}>
          saddsa
        </Button>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        <IconTitle style={{ paddingLeft: 20 }}>
          <AntDesign name="camera" size={20} color={themeColor.tint} />
          <Text style={{ fontSize: 16 }}>사진 올리기</Text>
        </IconTitle>
        <Text style={[styles.subText, { color: themeColor.tint }]}>(선택)</Text>
      </View>
      <Button
        type="bordered"
        onPress={() => {
          console.log("asdadsdas")
          router.push("/add-plan/camera")
        }}
      >
        선택하기
      </Button>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
    gap: 10,
  },

  subText: {
    fontFamily: "sb-l",
    fontSize: 12,
  },
  titleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingRight: 20,
    alignItems: "flex-end",
  },
})
