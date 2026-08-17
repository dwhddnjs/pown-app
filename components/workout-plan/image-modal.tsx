import React from "react";
// component
import { Modal, Pressable, StyleSheet } from "react-native";
import { Image } from "expo-image";
// hook
import { useImageUriStore } from "@/hooks/use-image-uri-store";

// 네이티브 Modal로 띄운다 — 그냥 절대배치 View로 두면 presentation:"modal" 화면
// (달력 히스토리·노트)이 별도 네이티브 컨트롤러라 그 아래 깔려 안 보인다.
export const ImageModal = () => {
  const { uri, onResetImageUri } = useImageUriStore();
  return (
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
