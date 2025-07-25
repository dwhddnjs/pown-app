import { useRef, useState } from "react"
// component
import { Pressable, StyleSheet } from "react-native"
import { Text, View } from "@/components/Themed"
//expo
import { CameraMode, CameraType, CameraView } from "expo-camera"
import { Image } from "expo-image"
import { useRouter } from "expo-router"
// icon
import { FontAwesome6 } from "@expo/vector-icons"
// hook
import useCurrneThemeColor from "@/hooks/use-current-theme-color"
import { usePlanStore } from "@/hooks/use-plan-store"
import { SafeAreaView } from "react-native-safe-area-context"

const Camera = () => {
  const ref = useRef<CameraView>(null)
  const [uri, setUri] = useState<string | null>(null)

  const [facing, setFacing] = useState<CameraType>("back")
  const themeColor = useCurrneThemeColor()
  const router = useRouter()
  const { imageUri, setImageUri } = usePlanStore()

  const takePicture = async () => {
    const photo = await ref.current?.takePictureAsync()
    setUri(photo?.uri as string)
  }
  const toggleFacing = () => {
    setFacing((prev) => (prev === "back" ? "front" : "back"))
  }

  const selectImageUri = () => {
    if (uri) {
      setImageUri({
        id: imageUri.length > 0 ? imageUri[imageUri.length - 1].id + 1 : 1,
        imageUri: uri,
      })
      setUri("")
    }
    router.back()
  }

  const renderPicture = () => {
    return (
      <SafeAreaView
        style={{
          flex: 1,
        }}
      >
        <Image
          source={{ uri } as any}
          contentFit="fill"
          style={{ width: "100%", aspectRatio: 9 / 16 }}
        />
        <View
          style={{
            backgroundColor: themeColor.itemColor,
            height: 100,
            flexDirection: "row",
            justifyContent: "space-between",
            paddingHorizontal: 20,
          }}
        >
          <Pressable style={{ paddingTop: 24 }}>
            <Text
              style={{
                fontSize: 16,
              }}
              onPress={() => setUri(null)}
            >
              다시 찍기
            </Text>
          </Pressable>
          <Pressable
            style={{ paddingTop: 24 }}
            onPress={() => selectImageUri()}
          >
            <Text
              style={{
                fontSize: 16,
              }}
            >
              사진 사용
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    )
  }

  const renderCamera = () => {
    return (
      <CameraView
        style={styles.camera}
        ref={ref}
        facing={facing}
        mute={false}
        responsiveOrientationWhenOrientationLocked
      >
        <View style={styles.shutterContainer}>
          <Pressable onPress={() => router.back()}>
            <Text style={styles.cancelText}>취소</Text>
          </Pressable>

          <Pressable onPress={takePicture}>
            {({ pressed }) => (
              <View
                style={[
                  styles.shutterBtn,
                  {
                    opacity: pressed ? 0.5 : 1,
                  },
                ]}
              >
                <View style={[styles.shutterBtnInner]} />
              </View>
            )}
          </Pressable>
          <Pressable onPress={toggleFacing} style={{ paddingVertical: 24 }}>
            <FontAwesome6 name="rotate-left" size={24} color="white" />
          </Pressable>
        </View>
      </CameraView>
    )
  }

  return (
    <View style={[styles.container, { backgroundColor: themeColor.hard }]}>
      {uri ? renderPicture() : renderCamera()}
    </View>
  )
}

export default Camera

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  camera: {
    flex: 1,

    width: "100%",
  },
  shutterContainer: {
    position: "absolute",
    bottom: 44,
    left: 0,
    width: "100%",
    backgroundColor: "transparent",
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 44,
  },
  shutterBtn: {
    backgroundColor: "transparent",
    borderWidth: 4,
    borderColor: "white",
    width: 80,
    height: 80,
    borderRadius: 45,
    alignItems: "center",
    justifyContent: "center",
  },
  shutterBtnInner: {
    width: 60,
    height: 60,
    borderRadius: 50,
    backgroundColor: "white",
  },
  cancelText: {
    fontSize: 16,
    color: "white",
    fontFamily: "sb-m",
  },
})
