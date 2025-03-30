import React from "react"
// component
import { Pressable, StyleSheet } from "react-native"
import { Text, View } from "../Themed"
import { Image } from "expo-image"
// hook
import { useImageUriStore } from "@/hooks/use-image-uri-store"

const ImageModal = () => {
  const { uri, onResetImageUri } = useImageUriStore()
  return (
    <Pressable onPress={() => onResetImageUri()} style={styles.overlay}>
      <View style={styles.imageContainer}>
        <Image
          source={{ uri }}
          contentFit="contain"
          style={{ flex: 1, aspectRatio: 1 }}
        />
      </View>
    </Pressable>
  )
}

export default ImageModal

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
    alignSelf: "center",
    backgroundColor: "transparent",
    opacity: 1,
    paddingVertical: 120,
  },
})
