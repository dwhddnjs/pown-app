import { useEffect, useRef, useState } from "react";
// component
import { Pressable, StyleSheet } from "react-native";
import { Text, View } from "@/components/themed";
//expo
import {
  CameraType,
  CameraView,
  useCameraPermissions,
  useMicrophonePermissions,
} from "expo-camera";
import { useRouter } from "expo-router";
import { useT } from "@/hooks/use-t";
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
import { persistMediaLocally } from "@/lib/media";

export default function Video() {
  const ref = useRef<CameraView>(null);
  const [uri, setUri] = useState<string | null>(null);
  const [facing, setFacing] = useState<CameraType>("back");
  const themeColor = useCurrentThemeColor();
  const t = useT();
  const router = useRouter();
  const { setAddVideo } = useShortsStore();
  const [isRecording, setIsRecording] = useState(false);
  const player = useVideoPlayer(uri, (player) => {
    player.loop = true;
    player.play();
  });
  const isSquare = useSharedValue(false);
  // 카메라·마이크 권한은 녹화 화면에 진입한 이 시점에 요청한다
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [micPermission, requestMicPermission] = useMicrophonePermissions();

  useEffect(() => {
    if (
      cameraPermission &&
      !cameraPermission.granted &&
      cameraPermission.canAskAgain
    ) {
      requestCameraPermission();
    }
  }, [cameraPermission, requestCameraPermission]);

  useEffect(() => {
    if (
      cameraPermission?.granted &&
      micPermission &&
      !micPermission.granted &&
      micPermission.canAskAgain
    ) {
      requestMicPermission();
    }
  }, [cameraPermission, micPermission, requestMicPermission]);

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
      toast.error(t("shorts.recordFailed"));
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
        // recordAsync가 주는 캐시 경로는 iOS가 언제든 비울 수 있어 앱 내부 저장소로 옮긴다
        const asset = await MediaLibrary.createAssetAsync(uri);
        const assetInfo = await MediaLibrary.getAssetInfoAsync(asset);
        const thumbnail = await VideoThumbnails.getThumbnailAsync(uri, {
          time: 0,
        });
        setAddVideo({
          id,
          video: await persistMediaLocally(
            assetInfo.localUri ?? asset.uri,
            `shorts-${id}.mp4`,
          ),
          thumbnail: await persistMediaLocally(
            thumbnail.uri,
            `shorts-thumb-${id}.jpg`,
          ),
          createdAt: new Date().toISOString(),
        });
        setUri(null);
      }
      router.back();
      toast.success(t("shorts.added"));
    } catch (error) {
      toast.error(t("shorts.addFailed"));
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
              {t("shorts.retake")}
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
              {t("shorts.useVideo")}
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
            <Text style={styles.cancelText}>{t("common.cancel")}</Text>
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

  if (!cameraPermission?.granted || !micPermission?.granted) {
    return (
      <View style={[styles.container, { backgroundColor: themeColor.hard }]}>
        <View style={styles.permissionContainer}>
          <Text style={styles.cancelText}>
            {t("shorts.permission")}
          </Text>
          <Pressable
            onPress={() =>
              !cameraPermission?.granted
                ? requestCameraPermission()
                : requestMicPermission()
            }
          >
            <Text style={[styles.cancelText, { color: themeColor.tintText }]}>
              {t("common.allowPermission")}
            </Text>
          </Pressable>
          <Pressable onPress={() => router.back()}>
            <Text style={styles.cancelText}>{t("common.goBack")}</Text>
          </Pressable>
        </View>
      </View>
    );
  }

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
  permissionContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 20,
    paddingHorizontal: 24,
    backgroundColor: "transparent",
  },
});
