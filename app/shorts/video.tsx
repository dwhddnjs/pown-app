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

const Video = () => {
  const ref = useRef<CameraView>(null)
  const [uri, setUri] = useState<string | null>(null)
  console.log("uri: ", uri)
  const [facing, setFacing] = useState<CameraType>("back")
  const themeColor = useCurrneThemeColor()
  const router = useRouter()
  const { imageUri, setImageUri } = usePlanStore()
  const [isRecording, setIsRecording] = useState(false)

  const onStartRecording = async () => {
    if (!ref.current) return
    try {
      setIsRecording(true)
      const data = await ref.current.recordAsync()
      setUri(data?.uri as string)
    } catch (error) {
      console.log(error)
    } finally {
      setIsRecording(false)
    }
  }

  const onStopRecording = () => {
    if (!ref.current) return
    ref.current.stopRecording()
  }

  const takeVideo = async () => {
    try {
      const data = await ref.current?.recordAsync()
      console.log("data: ", data)
    } catch (error) {
      console.log(error)
    }
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
      <View
        style={{ flex: 1, justifyContent: "space-between", paddingTop: 150 }}
      >
        <Image
          source={{ uri } as any}
          contentFit="contain"
          style={{ width: "100%", aspectRatio: 1 }}
        />
        <View
          style={{
            backgroundColor: themeColor.itemColor,
            height: 100,
            flexDirection: "row",
            justifyContent: "space-between",
            paddingHorizontal: 20,
            // paddingTop: 24,
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
      </View>
    )
  }

  const renderCamera = () => {
    return (
      <CameraView
        style={styles.camera}
        ref={ref}
        facing={facing}
        mode="video"
        mute={false}
        responsiveOrientationWhenOrientationLocked
      >
        <View style={styles.shutterContainer}>
          <Pressable onPress={() => router.back()}>
            <Text style={styles.cancelText}>취소</Text>
          </Pressable>

          <Pressable onPress={isRecording ? onStopRecording : onStartRecording}>
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
    <View
      style={[styles.container, { backgroundColor: themeColor.background }]}
    >
      {uri ? renderPicture() : renderCamera()}
    </View>
  )
}

export default Video

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
    borderWidth: 6,
    borderColor: "white",
    width: 80,
    height: 80,
    borderRadius: 45,
    alignItems: "center",
    justifyContent: "center",
  },
  shutterBtnInner: {
    width: 70,
    height: 70,
    borderRadius: 50,
  },
  cancelText: {
    fontSize: 16,
    color: "white",
    fontFamily: "sb-m",
  },
})
