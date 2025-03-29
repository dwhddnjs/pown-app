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
// hook
import useCurrneThemeColor from "@/hooks/use-current-theme-color"
import { usePlanStore } from "@/hooks/use-plan-store"
// icon
import AntDesign from "@expo/vector-icons/AntDesign"
import { toast } from "sonner-native"

interface CameraImageProps {}

export const CameraImage = ({}: CameraImageProps) => {
  const themeColor = useCurrneThemeColor()
  const router = useRouter()
  const [permission, requestPermission] = useCameraPermissions()
  const { imageUri, setRemoveImageUri } = usePlanStore()

  const onRemoveImageUri = (id: number) => {
    setRemoveImageUri(id)
  }

  if (!permission) {
    return null
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={{ textAlign: "center" }}>카메라 허용이 필요합니다!</Text>
        <Button onPress={requestPermission} type={"solid"}>
          허용
        </Button>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        <IconTitle style={{ paddingLeft: 20 }}>
          <AntDesign name="camera" size={20} color={themeColor.tint} />
          <Text style={{ fontSize: 16 }}>사진 추가</Text>
        </IconTitle>
        <Text style={[styles.subText, { color: themeColor.tint }]}>(선택)</Text>
      </View>
      <Button
        type="bordered"
        onPress={() => {
          if (imageUri.length === 4) {
            return toast.error("최대 4개까지 가능합니다")
          }
          router.push("/add-plan/camera")
        }}
      >
        사진찍기
      </Button>
      <View
        style={{
          paddingHorizontal: 20,
          paddingVertical: 12,
          flexDirection: "row",
          gap: 8,
          flexWrap: "nowrap",
        }}
      >
        {imageUri.map((item) => (
          <View style={{ flex: 4, position: "relative" }}>
            <Image
              key={item.id}
              source={{ uri: item.imageUri }}
              contentFit="cover"
              style={{
                aspectRatio: 1,
                borderRadius: 16,
                borderWidth: 1,
                borderColor: themeColor.itemColor,
              }}
            />
            <TouchableOpacity
              onPress={() => onRemoveImageUri(item.id)}
              style={{
                flex: 4,
                position: "absolute",
                right: -4,
                top: -4,
              }}
            >
              <AntDesign
                name="closecircle"
                size={24}
                color={themeColor.pressed}
              />
            </TouchableOpacity>
          </View>
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
