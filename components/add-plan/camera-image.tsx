import { useState } from "react"
// component
import { StyleSheet, TouchableOpacity } from "react-native"
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

// 가로/세로 간격을 같게 하려면 칸 폭을 퍼센트가 아니라 실제 폭에서 gap을 뺀 px로 잡아야 한다
const IMAGE_GAP = 8
const LIST_PADDING = 20

interface CameraImageProps {}

export const CameraImage = ({}: CameraImageProps) => {
  const themeColor = useCurrentThemeColor()
  const t = useT()
  const router = useRouter()
  const { imageUri, setRemoveImageUri } = usePlanStore()
  const [gridWidth, setGridWidth] = useState(0)

  const onRemoveImageUri = (id: number) => {
    setRemoveImageUri(id)
  }

  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        <IconTitle style={{ paddingLeft: 20 }}>
          <AntDesign name="camera" size={20} color={themeColor.tintText} />
          <Text style={{ fontSize: 16 }}>{t("plan.photo")}</Text>
        </IconTitle>
        <Text style={[styles.subText, { color: themeColor.tintText }]}>{t("common.optional")}</Text>
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
      <View
        style={styles.imageListContainer}
        onLayout={(e) => setGridWidth(e.nativeEvent.layout.width)}
      >
        {imageUri.map((item) => (
          <View
            style={{
              position: "relative",
              width:
                imageUri.length === 1 || !gridWidth
                  ? "100%"
                  : (gridWidth - LIST_PADDING * 2 - IMAGE_GAP) / 2,
            }}
            key={item.id}
          >
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
    paddingHorizontal: LIST_PADDING,
    paddingVertical: 12,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: IMAGE_GAP,
  },
  image: {
    aspectRatio: 1,
    borderRadius: 18,
    borderCurve: "continuous",
    borderWidth: 1,
  },
  closeButton: {
    position: "absolute",
    right: -4,
    top: -4,
  },
})
