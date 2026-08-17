import React from "react";
// component
import { Pressable, StyleSheet } from "react-native";
import { Image } from "expo-image";
// hook
import { useImageUriStore } from "@/hooks/use-image-uri-store";

export const ImageModal = () => {
  const { uri, onResetImageUri } = useImageUriStore();
  return (
    <Pressable onPress={() => onResetImageUri()} style={styles.overlay}>
      <Image source={{ uri }} contentFit="contain" style={styles.image} />
    </Pressable>
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
