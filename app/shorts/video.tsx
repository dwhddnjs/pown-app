import { useRef, useState } from "react"
// component
import { Pressable, StyleSheet } from "react-native"
import { Text, View } from "@/components/Themed"
//expo
import { CameraMode, CameraType, CameraView } from "expo-camera"
import { Image } from "expo-image"
import { useRouter } from "expo-router"
import { useEvent } from "expo"
import { useVideoPlayer, VideoView } from "expo-video"
// icon
import { FontAwesome6 } from "@expo/vector-icons"
// hook
import useCurrneThemeColor from "@/hooks/use-current-theme-color"
import { SafeAreaView } from "react-native-safe-area-context"
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated"
import { useShortsStore } from "@/hooks/use-shorts-store"
import * as VideoThumbnails from "expo-video-thumbnails"
import { toast } from "sonner-native"

const Video = () => {
  const ref = useRef<CameraView>(null)
  const [uri, setUri] = useState<string | null>(null)
  const [facing, setFacing] = useState<CameraType>("back")
  const themeColor = useCurrneThemeColor()
  const router = useRouter()
  const { setAddVideo, videos } = useShortsStore()
  const [isRecording, setIsRecording] = useState(false)
  const player = useVideoPlayer(uri, (player) => {
    player.loop = true
    player.play()
  })
  const { isPlaying } = useEvent(player, "playingChange", {
    isPlaying: player.playing,
  })
  const isSquare = useSharedValue(false)

  const animatedShutterStyle = useAnimatedStyle(() => {
    return {
      width: withTiming(isSquare.value ? 32 : 64, { duration: 300 }),
      height: withTiming(isSquare.value ? 32 : 64, { duration: 300 }),
      borderRadius: withTiming(isSquare.value ? 6 : 50, { duration: 300 }),
    }
  })

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

  const toggleFacing = () => {
    setFacing((prev) => (prev === "back" ? "front" : "back"))
  }

  const selectImageUri = async () => {
    try {
      if (uri) {
        const thumbnail = await VideoThumbnails.getThumbnailAsync(uri, {
          time: 15000,
        })
        setAddVideo({
          id: videos.length > 0 ? videos[videos.length - 1].id + 1 : 1,
          video: uri,
          thumbnail: thumbnail.uri,
        })
        setUri("")
      }
      router.back()
      toast.success("숏츠가 추가 되었습니다")
    } catch (error) {
      console.log(error)
    }
  }

  const renderVideo = () => {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <VideoView
          style={styles.video}
          player={player}
          allowsFullscreen
          allowsPictureInPicture
        />

        <View
          style={{
            backgroundColor: "transparents",
            height: 60,
            flexDirection: "row",
            justifyContent: "space-between",
            paddingHorizontal: 24,
            // paddingTop: 24,
          }}
        >
          <Pressable style={{ paddingTop: 18 }}>
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
            style={{ paddingTop: 18 }}
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
        mode="video"
        mute={false}
        responsiveOrientationWhenOrientationLocked
      >
        <View style={styles.shutterContainer}>
          <Pressable onPress={() => router.back()}>
            <Text style={styles.cancelText}>취소</Text>
          </Pressable>

          <Pressable
            onPress={() => {
              isSquare.value = !isSquare.value
              isRecording ? onStopRecording() : onStartRecording()
            }}
          >
            {({ pressed }) => (
              <View
                style={[
                  styles.shutterBtn,
                  {
                    opacity: pressed ? 0.5 : 1,
                  },
                ]}
              >
                <Animated.View
                  style={[
                    // styles.shutterBtnInner,
                    animatedShutterStyle,
                    { backgroundColor: themeColor.fail },
                  ]}
                />
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
      {uri ? renderVideo() : renderCamera()}
    </View>
  )
}

export default Video

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // paddingTop: 24,
  },
  camera: {
    flex: 1,
    width: "100%",
  },

  video: {
    flex: 1,
    // width: 350,
    // height: 275,
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
  // shutterBtnInner: {
  //   width: 64,
  //   height: 64,
  //   borderRadius: 50,
  // },
  cancelText: {
    fontSize: 16,
    color: "white",
    fontFamily: "sb-m",
  },
})
