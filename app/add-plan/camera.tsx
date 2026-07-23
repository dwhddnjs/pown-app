import { useEffect, useRef, useState } from "react";
// component
import { Pressable, StyleSheet } from "react-native";
import { Text, View } from "@/components/themed";
//expo
import { CameraType, CameraView, useCameraPermissions } from "expo-camera";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useT } from "@/hooks/use-t";
// icon
import { FontAwesome6 } from "@expo/vector-icons";
// hook
import useCurrentThemeColor from "@/hooks/use-current-theme-color";
import { usePlanStore } from "@/hooks/use-plan-store";
import { SafeAreaView } from "react-native-safe-area-context";

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
    const photo = await ref.current?.takePictureAsync();
    setUri(photo?.uri as string);
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
      setUri("");
    }
    router.back();
  };

  const renderPicture = () => {
    return (
      <SafeAreaView
        style={{
          flex: 1,
        }}
      >
        <Image
          source={{ uri: uri ?? undefined }}
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
          <Pressable style={{ paddingTop: 24 }} onPress={() => setUri(null)}>
            <Text
              style={{
                fontSize: 16,
              }}
            >
              {t("camera.retake")}
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
              {t("camera.usePhoto")}
            </Text>
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
          mute={false}
          responsiveOrientationWhenOrientationLocked
        />
        <View style={styles.shutterContainer}>
          {/* 텍스트로 두면 영어("Cancel")에서 길어져 셔터가 밀린다 — 아이콘으로 폭을 고정한다 */}
          <Pressable
            onPress={() => router.back()}
            style={{ paddingVertical: 24 }}
            accessibilityRole="button"
            accessibilityLabel={t("common.cancel")}
          >
            <FontAwesome6 name="xmark" size={28} color="white" />
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
      </View>
    );
  };

  if (!permission?.granted) {
    return (
      <View style={[styles.container, { backgroundColor: themeColor.hard }]}>
        <View style={styles.permissionContainer}>
          <Text style={styles.cancelText}>
            {t("camera.permission")}
          </Text>
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
      {uri ? renderPicture() : renderCamera()}
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
  permissionContainer: {
    alignItems: "center",
    gap: 20,
    backgroundColor: "transparent",
  },
});
