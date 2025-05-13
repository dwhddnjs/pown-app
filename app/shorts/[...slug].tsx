import { Text, View } from "@/components/Themed"
import { useEvent } from "expo"
import { useLocalSearchParams, useNavigation } from "expo-router"
import { useVideoPlayer, VideoView } from "expo-video"
import React from "react"
import { StyleSheet } from "react-native"

export default function ShortsView() {
  const { slug } = useLocalSearchParams<any>()
  const uri = slug.join("/")
  const player = useVideoPlayer(uri, (player) => {
    player.loop = true
    player.play()
  })
  const { isPlaying } = useEvent(player, "playingChange", {
    isPlaying: player.playing,
  })

  return (
    // <View style={{ flex: 1 }}>
    <VideoView
      style={styles.video}
      player={player}
      allowsFullscreen
      allowsPictureInPicture
    />
    // </View>
  )
}

const styles = StyleSheet.create({
  video: {
    flex: 1,
    // width: 350,
    // height: 275,
  },
})
