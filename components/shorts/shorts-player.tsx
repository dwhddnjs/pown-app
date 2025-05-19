import { ShortsVideoTypes, useShortsStore } from "@/hooks/use-shorts-store"
import { useEvent } from "expo"
import { useVideoPlayer, VideoView } from "expo-video"
import React, { useEffect, useRef } from "react"
import { StyleSheet, Dimensions } from "react-native"

interface ShortsPlayerProps {
  video: ShortsVideoTypes
  isActive?: boolean
}

export const ShortsPlayer = ({ video, isActive }: ShortsPlayerProps) => {
  const player = useVideoPlayer(video.video, (player) => {
    player.loop = true
    // player.play()
  })

  const { isPlaying } = useEvent(player, "playingChange", {
    isPlaying: player.playing,
  })

  // useEffect(() => {
  //   if (isActive) {
  //     player.play()
  //   } else {
  //     player.pause()
  //   }
  // }, [isActive])

  return (
    <VideoView
      key={video.id}
      style={[styles.video]}
      player={player}
      allowsFullscreen
      allowsPictureInPicture
    />
  )
}

const styles = StyleSheet.create({
  video: {
    flex: 1,
    // width: 350,
    // height: 275,
    borderWidth: 1,
    // position: "absolute",
    // top: 0,
    // left: 0,
    // right: 0,
    // bottom: 0,
    // width: "100%",
    // height: "100%",
  },
  page: {
    justifyContent: "center",
    alignItems: "center",
  },
})
