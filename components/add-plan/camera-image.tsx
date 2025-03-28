// component
import { StyleSheet, TouchableOpacity, useColorScheme } from "react-native"
import { Text, View } from "../Themed"
import { Button } from "../Button"
import { IconTitle } from "../IconTitle"
// expo
import { useRouter } from "expo-router"
import { Image } from "expo-image"
import {
  CameraMode,
  CameraType,
  CameraView,
  useCameraPermissions,
} from "expo-camera"
import AntDesign from "@expo/vector-icons/AntDesign"
// hook
import useCurrneThemeColor from "@/hooks/use-current-theme-color"
import { useImageUriStore } from "@/hooks/use-image-uri-store"

interface CameraImageProps {}

export const CameraImage = ({}: CameraImageProps) => {
  const themeColor = useCurrneThemeColor()
  const router = useRouter()
  const [permission, requestPermission] = useCameraPermissions()
  const { uri } = useImageUriStore()
  console.log("uri: ", uri)

  if (!permission) {
    return null
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={{ textAlign: "center" }}>카메라 허용이 필요합니다!</Text>
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
          router.push("/add-plan/camera")
        }}
      >
        선택하기
      </Button>
      <View
        style={{
          // paddingHorizontal: 20,
          paddingVertical: 12,
          flexDirection: "row",
          gap: 12,
          flexWrap: "nowrap",
          borderWidth: 1,
        }}
      >
        {uri.map((item) => (
          <Image
            key={item.id}
            source={{ uri: item.uri }}
            contentFit="cover"
            style={{ width: "50%", aspectRatio: 1, borderRadius: 16 }}
          />
        ))}
      </View>
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
