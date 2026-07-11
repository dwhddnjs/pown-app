import { useRef, useState } from "react";
// component
import { Pressable, StyleSheet } from "react-native";
import { Text, View } from "@/components/Themed";
//expo
import { CameraType, CameraView } from "expo-camera";
import { useRouter } from "expo-router";
import { useVideoPlayer, VideoView } from "expo-video";
// icon
import { FontAwesome6 } from "@expo/vector-icons";
// hook
import useCurrentThemeColor from "@/hooks/use-current-theme-color";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useShortsStore } from "@/hooks/use-shorts-store";
import * as VideoThumbnails from "expo-video-thumbnails";
import { toast } from "sonner-native";
import * as MediaLibrary from "expo-media-library";
import * as FileSystem from "expo-file-system";

export default function Video() {
  const ref = useRef<CameraView>(null);
  const [uri, setUri] = useState<string | null>(null);
  const [facing, setFacing] = useState<CameraType>("back");
  const themeColor = useCurrentThemeColor();
  const router = useRouter();
  const { setAddVideo } = useShortsStore();
  const [isRecording, setIsRecording] = useState(false);
  const player = useVideoPlayer(uri, (player) => {
    player.loop = true;
    player.play();
  });
  const isSquare = useSharedValue(false);

  const animatedShutterStyle = useAnimatedStyle(() => {
    return {
      width: withTiming(isSquare.value ? 32 : 64, { duration: 300 }),
      height: withTiming(isSquare.value ? 32 : 64, { duration: 300 }),
      borderRadius: withTiming(isSquare.value ? 6 : 50, { duration: 300 }),
    };
  });

  const onStartRecording = async () => {
    if (!ref.current) return;
    try {
      setIsRecording(true);
      const data = await ref.current.recordAsync();
      setUri(data?.uri as string);
    } catch (error) {
      toast.error("녹화 중 오류가 발생했습니다.");
    } finally {
      setIsRecording(false);
    }
  };

  const onStopRecording = () => {
    if (!ref.current) return;
    ref.current.stopRecording();
  };

  const toggleFacing = () => {
    setFacing((prev) => (prev === "back" ? "front" : "back"));
  };

  const selectImageUri = async () => {
    try {
      if (uri) {
        const id = Date.now();
        // recordAsync가 주는 캐시 경로는 iOS가 언제든 비울 수 있어 영구 경로로 옮겨 저장한다
        const asset = await MediaLibrary.createAssetAsync(uri);
        const assetInfo = await MediaLibrary.getAssetInfoAsync(asset);
        const thumbnail = await VideoThumbnails.getThumbnailAsync(uri, {
          time: 0,
        });
        const thumbnailUri = `${FileSystem.documentDirectory}shorts-thumbnail-${id}.jpg`;
        await FileSystem.copyAsync({ from: thumbnail.uri, to: thumbnailUri });
        setAddVideo({
          id,
          video: assetInfo.localUri ?? asset.uri,
          thumbnail: thumbnailUri,
          createdAt: new Date().toISOString(),
        });
        setUri(null);
      }
      router.back();
      toast.success("숏츠가 추가 되었습니다");
    } catch (error) {
      toast.error("숏츠 저장 중 오류가 발생했습니다.");
    }
  };

  const renderVideo = () => {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <VideoView style={styles.video} player={player} allowsFullscreen />
        <View
          style={[
            {
              height: 60,
              flexDirection: "row",
              justifyContent: "space-between",
              paddingHorizontal: 24,
              backgroundColor: themeColor.hard,
            },
          ]}
        >
          <Pressable style={{ paddingTop: 18 }} onPress={() => setUri(null)}>
            <Text
              style={{
                fontSize: 16,
              }}
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
              비디오 사용
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  };

  const renderCamera = () => {
    return (
      <CameraView
        ref={ref}
        facing={facing}
        style={{
          flex: 1,
        }}
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
              isSquare.value = !isSquare.value;
              isRecording ? onStopRecording() : onStartRecording();
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
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: themeColor.hard }]}>
      {uri ? renderVideo() : renderCamera()}
    </View>
  );
}

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
});
