import React from "react"
// component
import { Pressable, StyleSheet } from "react-native"
import { View } from "../themed"
import { Image } from "expo-image"
// hook
import { useImageUriStore } from "@/hooks/use-image-uri-store"

export const ImageModal = () => {
  const { uri, onResetImageUri } = useImageUriStore()
  return (
    <Pressable onPress={() => onResetImageUri()} style={styles.overlay}>
      <View style={styles.imageContainer}>
        <Image source={{ uri }} contentFit="contain" style={{ flex: 1 }} />
      </View>
    </Pressable>
  )
}


const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    position: "absolute",
    justifyContent: "center",
  },
  imageContainer: {
    flex: 1,
    backgroundColor: "transparent",
    paddingVertical: 100,
    paddingHorizontal: 12,
  },
})
