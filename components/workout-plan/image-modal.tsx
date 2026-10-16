import React, { useEffect } from "react";
// component
import { Modal, Pressable, StyleSheet } from "react-native";
import { Image } from "expo-image";
import { ViewerStatusBar } from "./viewer-status-bar";
// hook
import { useImageUriStore } from "@/hooks/use-image-uri-store";

// 네이티브 Modal로 띄운다 — 그냥 절대배치 View로 두면 presentation:"modal" 화면
// (달력 히스토리·노트)이 별도 네이티브 컨트롤러라 그 아래 깔려 안 보인다.
// 그런데 루트의 Modal은 iOS에서 이미 시트를 띄운 루트 컨트롤러가 띄우려다 실패하고("already
// presenting"), 시트를 닫은 뒤 앱이 터치를 안 받았다 — 사진이 있는 시트 화면은 ImageModalHost를
// 깔아 자기 컨트롤러에서 띄우고, 그동안 루트는 쉰다(_layout.tsx)
export const ImageModal = () => {
  const { uri, onResetImageUri } = useImageUriStore();
  return (
    <ViewerStatusBar>
      <Modal
        visible
        transparent
        animationType="fade"
        statusBarTranslucent
        navigationBarTranslucent
        onRequestClose={onResetImageUri}
      >
        <Pressable onPress={() => onResetImageUri()} style={styles.overlay}>
          <Image source={{ uri }} contentFit="contain" style={styles.image} />
        </Pressable>
      </Modal>
    </ViewerStatusBar>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
  },
  image: {
    // 화면 중앙 기준으로 상하 대칭. flex:1 + padding으로 채우면 헤더·탭바 높이가
    // 섞여 들어와 미묘하게 위로 치우친다.
    width: "100%",
    height: "80%",
  },
});

// 사진을 보여 주는 시트 화면(presentation: "modal")에 깐다 — 뷰어를 그 시트 위에서 띄운다
export const ImageModalHost = () => {
  const uri = useImageUriStore((state) => state.uri);
  const addHost = useImageUriStore((state) => state.addHost);
  const removeHost = useImageUriStore((state) => state.removeHost);

  useEffect(() => {
    addHost();
    return removeHost;
  }, [addHost, removeHost]);

  return uri ? <ImageModal /> : null;
};
