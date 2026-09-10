import { useEffect, useRef, useState } from "react";
// component
import { Pressable, StyleSheet } from "react-native";
import { Text, View } from "@/components/themed";
import { PressScale } from "@/components/press-scale";
import { SafeAreaView } from "react-native-safe-area-context";
import { toast } from "sonner-native";
//expo
import { CameraType, CameraView, useCameraPermissions } from "expo-camera";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
// icon
import { FontAwesome6 } from "@expo/vector-icons";
// hook
import useCurrentThemeColor from "@/hooks/use-current-theme-color";
import { usePlanStore } from "@/hooks/use-plan-store";
import { useT } from "@/hooks/use-t";

const Camera = () => {
  const t = useT();
  const ref = useRef<CameraView>(null);
  const [uri, setUri] = useState<string | null>(null);

  const [facing, setFacing] = useState<CameraType>("back");
  const themeColor = useCurrentThemeColor();
  const router = useRouter();
  const { setImageUri } = usePlanStore();
  // 카메라 권한은 앱 시작이 아닌 카메라를 실제로 여는 이 시점에 요청한다
  const [permission, requestPermission] = useCameraPermissions();

  useEffect(() => {
    if (permission && !permission.granted && permission.canAskAgain) {
      requestPermission();
    }
  }, [permission, requestPermission]);

  const takePicture = async () => {
    try {
      const photo = await ref.current?.takePictureAsync();
      // 세션이 아직 준비 전이면 네이티브가 reject하거나 빈 결과를 준다 — 둘 다 알린다
      if (!photo?.uri) {
        return toast.error(t("camera.captureFailed"));
      }
      setUri(photo.uri);
    } catch {
      toast.error(t("camera.captureFailed"));
    }
  };
  const toggleFacing = () => {
    setFacing((prev) => (prev === "back" ? "front" : "back"));
  };

  const selectImageUri = () => {
    if (uri) {
      setImageUri({
        id: Date.now(),
        imageUri: uri,
      });
    }
    // uri를 비우지 않는다 — active={!uri}라서 화면이 닫히는 애니메이션 내내
    // 카메라 세션이 다시 켜진다. 어차피 곧 언마운트된다.
    router.back();
  };

  const renderPicture = () => {
    return (
      <SafeAreaView edges={["bottom"]} style={{ flex: 1 }}>
        <Image
          source={{ uri: uri ?? undefined }}
          contentFit="cover"
          style={{ flex: 1 }}
        />
        <View style={[styles.previewBar, { backgroundColor: themeColor.hard }]}>
          <Pressable style={styles.previewAction} onPress={() => setUri(null)}>
            <Text style={styles.previewActionText}>{t("camera.retake")}</Text>
          </Pressable>
          <Pressable style={styles.previewAction} onPress={selectImageUri}>
            <Text style={styles.previewActionText}>{t("camera.usePhoto")}</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  };

  const renderCamera = () => {
    return (
      <View style={styles.camera}>
        <CameraView
          style={StyleSheet.absoluteFill}
          ref={ref}
          facing={facing}
          // 미리보기 중에도 뷰는 살려두고 세션만 끈다 — 아래 렌더 주석 참고
          active={!uri}
          mute={false}
          responsiveOrientationWhenOrientationLocked
        />
        <View style={styles.shutterContainer}>
          {/* 텍스트로 두면 영어("Cancel")에서 길어져 셔터가 밀린다 — 아이콘으로 폭을 고정한다 */}
          <PressScale
            onPress={() => router.back()}
            style={{ paddingVertical: 24 }}
            accessibilityRole="button"
            accessibilityLabel={t("common.cancel")}
          >
            <FontAwesome6 name="xmark" size={28} color="white" />
          </PressScale>

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
          <PressScale onPress={toggleFacing} style={{ paddingVertical: 24 }}>
            <FontAwesome6 name="rotate-left" size={24} color="white" />
          </PressScale>
        </View>
      </View>
    );
  };

  if (!permission?.granted) {
    return (
      <View style={[styles.container, { backgroundColor: themeColor.hard }]}>
        <View style={styles.permissionContainer}>
          <Text style={styles.cancelText}>{t("camera.permission")}</Text>
          <Pressable onPress={requestPermission}>
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
      {/* 카메라·사진이 상태바 밑까지 꽉 차므로 글자를 흰색으로 고정한다 */}
      <StatusBar style="light" />
      {/* 미리보기를 카메라 위에 덮는다. 갈아끼우면 CameraView가 언마운트되면서
          AVCaptureSession을 매번 새로 세우는데 이전 세션 정리는 비동기라,
          촬영↔다시찍기를 반복하면 세션이 겹쳐 네이티브에서 죽는다. */}
      {renderCamera()}
      {uri ? (
        <View
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: themeColor.hard },
          ]}
        >
          {renderPicture()}
        </View>
      ) : null}
    </View>
  );
};

export default Camera;

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
    alignItems: "center",
    gap: 20,
    backgroundColor: "transparent",
  },
});
