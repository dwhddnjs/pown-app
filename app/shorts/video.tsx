import { useEffect, useRef, useState } from "react";
// component
import { Linking, Pressable, StyleSheet } from "react-native";
import { Text, View } from "@/components/themed";
import { ShortsPlayer } from "@/components/shorts/shorts-player";
import { AiGuideSheet } from "@/components/shorts/ai-guide-sheet";
import { PressScale } from "@/components/press-scale";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { toast } from "sonner-native";
// zustand
import { useShortsStore } from "@/hooks/use-shorts-store";
// hook
import useCurrentThemeColor from "@/hooks/use-current-theme-color";
import { useT } from "@/hooks/use-t";
// lib
import { persistMediaLocally } from "@/lib/media";
//expo
import {
  CameraType,
  CameraView,
  useCameraPermissions,
  useMicrophonePermissions,
} from "expo-camera";
import * as FileSystem from "expo-file-system";
import { useNavigation, useRouter } from "expo-router";
import * as VideoThumbnails from "expo-video-thumbnails";
import { StatusBar } from "expo-status-bar";
// icon
import { FontAwesome6 } from "@expo/vector-icons";

// ponytail: 녹화 상한은 knob이다. AI가 영상 전체를 최대 20장으로 훑으므로(lib/ai-identify.ts)
// 60초면 3초 간격이다 — 더 길면 1RM 같은 짧은 동작이 프레임 사이로 빠진다. 촬영 가이드의
// "1분 안쪽"과 맞춘 값이라, 바꾸면 가이드 문구(ai.guideReps)도 같이 바꾼다.
const MAX_RECORD_SEC = 60;

const toClock = (sec: number) =>
  `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, "0")}`;

export default function Video() {
  const ref = useRef<CameraView>(null);
  const [uri, setUri] = useState<string | null>(null);
  const [facing, setFacing] = useState<CameraType>("back");
  const themeColor = useCurrentThemeColor();
  const t = useT();
  const router = useRouter();
  const navigation = useNavigation();
  const { setAddVideo } = useShortsStore();
  const [isRecording, setIsRecording] = useState(false);
  // 녹화 경과 초 — 60초에 저절로 끊기므로 얼마나 남았는지 보여야 한다
  const [elapsed, setElapsed] = useState(0);
  // 카메라 세션 준비 전 recordAsync 호출은 네이티브 크래시를 낼 수 있다
  const [isCameraReady, setIsCameraReady] = useState(false);
  // 연타 시 isRecording state 반영 전에 recordAsync가 중복 호출되는 레이스 방지
  const isRecordingRef = useRef(false);
  // "비디오 사용"은 썸네일 추출·영상 복사를 표시 없이 몇 초 기다린다 — 그새 다시
  // 누르면 같은 숏츠가 두 개 저장된다
  const isSavingRef = useRef(false);
  const isSquare = useSharedValue(false);
  // 카메라·마이크 권한은 녹화 화면에 진입한 이 시점에 요청한다. 마이크는 선택이다 —
  // 거부하면 소리 없이 찍는다(AI는 소리를 안 쓴다). 예전엔 마이크까지 막았는데, iOS는
  // 한 번 거부한 권한을 다시 묻지 않아 "권한 허용"이 먹통인 채로 숏츠를 영영 못 찍었다.
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [micPermission, requestMicPermission] = useMicrophonePermissions();
  // 촬영 가이드는 분석 화면과 같은 시트를 읽기 전용으로 연다 — 각도를 바꿀 수
  // 있는 건 아직 찍지 않은 지금뿐이다
  const guideRef = useRef<BottomSheetModal>(null);
  // 이 화면엔 상단 SafeAreaView가 없다 — 가이드 버튼만 직접 인셋을 받는다
  const insets = useSafeAreaInsets();

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

  useEffect(() => {
    if (!isRecording) return;
    const startedAt = Date.now();
    setElapsed(0);
    const timer = setInterval(
      () => setElapsed(Math.floor((Date.now() - startedAt) / 1000)),
      250,
    );
    return () => clearInterval(timer);
  }, [isRecording]);

  const onStartRecording = async () => {
    if (!ref.current || !isCameraReady || isRecordingRef.current) return;
    isRecordingRef.current = true;
    try {
      setIsRecording(true);
      // 상한에 닿으면 에러가 아니라 정상 종료로 resolve된다 — 그대로 미리보기로 간다
      const data = await ref.current.recordAsync({
        maxDuration: MAX_RECORD_SEC,
      });
      setUri(data?.uri as string);
    } catch {
      // 녹화 중에 X·뒤로가기로 나가면 카메라가 녹화를 끊으며 reject한다 — 사용자가
      // 취소한 것이지 오류가 아니다. 떠난 화면은 focus가 없으므로 그걸로 가른다
      if (navigation.isFocused()) toast.error(t("shorts.recordFailed"));
    } finally {
      isRecordingRef.current = false;
      setIsRecording(false);
      // 상한·전화 같은 인터럽트로 끝나면 정지 버튼을 거치지 않아 셔터가 네모로 남는다
      isSquare.value = false;
    }
  };

  const onStopRecording = () => {
    if (!ref.current) return;
    ref.current.stopRecording();
  };

  const toggleFacing = () => {
    if (isRecording) return;
    setFacing((prev) => (prev === "back" ? "front" : "back"));
  };

  const selectImageUri = async () => {
    if (isSavingRef.current) return;
    isSavingRef.current = true;
    try {
      if (uri) {
        const id = Date.now();
        // recordAsync가 주는 캐시 경로는 iOS가 언제든 비울 수 있어 앱 내부 저장소로 옮긴다
        // 기본 quality가 1.0이라 그리드 타일(화면 1/3 폭)에 비해 몇 배 무겁고 백업에도
        // 그대로 들어간다
        const thumbnail = await VideoThumbnails.getThumbnailAsync(uri, {
          time: 0,
          quality: 0.7,
        });
        setAddVideo({
          id,
          video: await persistMediaLocally(uri, `shorts-${id}.mp4`),
          thumbnail: await persistMediaLocally(
            thumbnail.uri,
            `shorts-thumb-${id}.jpg`,
          ),
          createdAt: new Date().toISOString(),
        });
      }
      // uri를 비우지 않는다 — active={!uri}라서 화면이 닫히는 애니메이션 내내
      // 카메라 세션이 마이크까지 물고 다시 켜진다. 어차피 곧 언마운트된다.
      router.back();
      toast.success(t("shorts.added"));
    } catch {
      // 실패했을 때만 푼다 — 성공하면 화면이 닫히는 애니메이션 중에도 막아둔다
      isSavingRef.current = false;
      toast.error(t("shorts.addFailed"));
    }
  };

  // 버린 녹화는 캐시에 수십 MB짜리 임시 파일로 남는다(iOS는 저장공간이 모자랄 때만
  // 비운다) — 다시 찍을 때마다 쌓이므로 여기서 지운다
  const onRetake = () => {
    setUri(null);
    if (uri) {
      FileSystem.deleteAsync(uri, { idempotent: true }).catch(() => {});
    }
  };

  const renderVideo = () => {
    return (
      <SafeAreaView edges={["bottom"]} style={{ flex: 1 }}>
        {/* 진행바 손잡이(점)의 아래 절반이 플레이어 밖으로 나간다 —
            나중에 그려지는 하단 바에 덮이지 않게 위로 올린다 */}
        <View style={{ flex: 1, zIndex: 1, backgroundColor: "transparent" }}>
          <ShortsPlayer uri={uri as string} isActive />
        </View>
        <View style={[styles.previewBar, { backgroundColor: themeColor.hard }]}>
          <Pressable style={styles.previewAction} onPress={onRetake}>
            <Text style={styles.previewActionText}>{t("shorts.retake")}</Text>
          </Pressable>
          <Pressable style={styles.previewAction} onPress={selectImageUri}>
            <Text style={styles.previewActionText}>{t("shorts.useVideo")}</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  };

  const renderCamera = () => {
    return (
      <View style={{ flex: 1 }}>
        <CameraView
          ref={ref}
          facing={facing}
          // 미리보기 중에도 뷰는 살려두고 세션만 끈다 — 아래 렌더 주석 참고
          active={!uri}
          style={StyleSheet.absoluteFill}
          mode="video"
          // 마이크 권한이 없으면 오디오 입력 없이 영상만 녹화한다
          mute={!micPermission?.granted}
          onCameraReady={() => setIsCameraReady(true)}
          responsiveOrientationWhenOrientationLocked
        />
        <View style={styles.shutterContainer}>
          <PressScale
            onPress={() => router.back()}
            style={{ paddingVertical: 24 }}
            accessibilityRole="button"
            accessibilityLabel={t("common.cancel")}
          >
            <FontAwesome6 name="xmark" size={28} color="white" />
          </PressScale>

          <Pressable
            onPress={() => {
              if (isRecording) {
                isSquare.value = false;
                onStopRecording();
              } else if (isCameraReady && !isRecordingRef.current) {
                isSquare.value = true;
                onStartRecording();
              }
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
                    animatedShutterStyle,
                    { backgroundColor: themeColor.fail },
                  ]}
                />
              </View>
            )}
          </Pressable>
          <PressScale onPress={toggleFacing} style={{ paddingVertical: 24 }}>
            <FontAwesome6 name="rotate-left" size={24} color="white" />
          </PressScale>
        </View>
      </View>
    );
  };

  if (!cameraPermission?.granted) {
    return (
      <View style={[styles.container, { backgroundColor: themeColor.hard }]}>
        <View style={styles.permissionContainer}>
          <Text style={styles.cancelText}>{t("shorts.permission")}</Text>
          <Pressable
            // 한 번 거부하면 iOS가 다시 묻지 않는다 — 요청해봐야 아무 일도 없으니 설정으로 보낸다
            onPress={() =>
              cameraPermission?.canAskAgain === false
                ? Linking.openSettings()
                : requestCameraPermission()
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
      <StatusBar style="light" />
      {/* 미리보기를 카메라 위에 덮는다. 갈아끼우면 CameraView가 언마운트되면서
          AVCaptureSession(마이크 입력 포함)을 매번 새로 세우는데, 이전 세션 정리는
          비동기라 촬영↔다시찍기를 반복하면 세션이 겹쳐 네이티브에서 죽는다.
          뷰가 계속 살아 있으니 isCameraReady도 그대로 true로 둔다 — active 토글은
          onCameraReady를 다시 쏘지 않으므로(expo-camera CameraView.swift) 여기서
          false로 되돌리면 셔터가 영영 잠긴다. */}
      {renderCamera()}
      {isRecording && (
        <View
          pointerEvents="none"
          style={[styles.timerRow, { top: insets.top + 8 }]}
        >
          <View style={styles.timer}>
            <View
              style={[styles.timerDot, { backgroundColor: themeColor.fail }]}
            />
            <Text style={styles.timerText}>
              {toClock(elapsed)} / {toClock(MAX_RECORD_SEC)}
            </Text>
          </View>
        </View>
      )}
      {uri ? (
        <View
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: themeColor.hard },
          ]}
        >
          {renderVideo()}
        </View>
      ) : null}
      {/* 촬영 전이든 미리보기 중이든 항상 닿을 수 있게 오버레이 뒤에 그린다 */}
      <PressScale
        // 아이콘이 아니라 글자가 든 알약이라 기본 배율(1.25)은 과하다
        scaleTo={1.05}
        onPress={() => guideRef.current?.present()}
        style={[styles.guideButton, { top: insets.top + 8 }]}
        accessibilityRole="button"
        accessibilityLabel={t("ai.guideOpen")}
      >
        <FontAwesome6 name="circle-info" size={14} color="white" />
        <Text style={styles.guideText}>{t("ai.guideOpen")}</Text>
      </PressScale>
      <AiGuideSheet ref={guideRef} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  // 가이드 버튼(오른쪽 위)과 같은 높이·모양의 알약을 가운데에 띄운다
  timerRow: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
    backgroundColor: "transparent",
  },
  timer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  timerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  timerText: {
    fontSize: 13,
    color: "white",
  },
  guideButton: {
    position: "absolute",
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  guideText: {
    fontSize: 13,
    color: "white",
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
  cancelText: {
    fontSize: 16,
    color: "white",
    fontFamily: "sb-m",
  },
  previewBar: {
    height: 60,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 24,
  },
  previewAction: {
    paddingTop: 18,
  },
  previewActionText: {
    fontSize: 16,
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
