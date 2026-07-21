// component
import { StyleSheet, TouchableOpacity, useColorScheme } from "react-native"
import { Text, View } from "../themed"
import { Button } from "../button"
import { IconTitle } from "../icon-title"
// expo
import { useRouter } from "expo-router"
import { Image } from "expo-image"
// hook
import useCurrentThemeColor from "@/hooks/use-current-theme-color"
import { useT } from "@/hooks/use-t"
import { usePlanStore } from "@/hooks/use-plan-store"
// lib
import { resolveMediaUri } from "@/lib/media"
// icon
import AntDesign from "@expo/vector-icons/AntDesign"
import { toast } from "sonner-native"

interface CameraImageProps {}

export const CameraImage = ({}: CameraImageProps) => {
  const themeColor = useCurrentThemeColor()
  const t = useT()
  const router = useRouter()
  const { imageUri, setRemoveImageUri } = usePlanStore()

  const onRemoveImageUri = (id: number) => {
    setRemoveImageUri(id)
  }

  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        <IconTitle style={{ paddingLeft: 20 }}>
          <AntDesign name="camera" size={20} color={themeColor.tint} />
          <Text style={{ fontSize: 16 }}>{t("plan.photo")}</Text>
        </IconTitle>
        <Text style={[styles.subText, { color: themeColor.tint }]}>{t("common.optional")}</Text>
      </View>
      <Button
        type="bordered"
        onPress={() => {
          // 카메라 권한은 카메라 화면이 열릴 때 그 화면에서 직접 요청한다
          if (imageUri.length === 4) {
            return toast.error(t("plan.photoMax"))
          }
          router.push("/add-plan/camera")
        }}
      >
        {t("plan.takePhoto")}
      </Button>
      <View style={styles.imageListContainer}>
        {imageUri.map((item) => (
          <View style={{ flex: 4, position: "relative" }} key={item.id}>
            <Image
              key={item.id}
              source={{ uri: resolveMediaUri(item.imageUri) }}
              contentFit="cover"
              style={[
                styles.image,
                {
                  borderColor: themeColor.itemColor,
                },
              ]}
            />
            <TouchableOpacity
              onPress={() => onRemoveImageUri(item.id)}
              style={styles.closeButton}
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
  imageListContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    flexDirection: "row",
    gap: 8,
    flexWrap: "nowrap",
  },
  image: {
    aspectRatio: 1,
    borderRadius: 16,
    borderWidth: 1,
  },
  closeButton: {
    flex: 4,
    position: "absolute",
    right: -4,
    top: -4,
  },
})
