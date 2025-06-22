import { ShortsVideoTypes, useShortsStore } from "@/hooks/use-shorts-store"
import { useEvent } from "expo"
import { useVideoPlayer, VideoView } from "expo-video"
import React, { useEffect, useRef } from "react"
import { StyleSheet, Dimensions } from "react-native"

const { height: SCREEN_HEIGHT } = Dimensions.get("window")

interface ShortsPlayerProps {
  video: ShortsVideoTypes
  isActive?: boolean
  height?: number
}

export const ShortsPlayer = ({
  video,
  isActive,
  height,
}: ShortsPlayerProps) => {
  const player = useVideoPlayer(video.video, (player) => {
    player.loop = true
  })

  const { isPlaying } = useEvent(player, "playingChange", {
    isPlaying: player.playing,
  })

  console.log("video: ", video)

  useEffect(() => {
    if (isActive) {
      player.play()
    } else {
      player.pause()
    }
  }, [isActive])

  return (
    <VideoView
      key={video.id}
      style={[
        {
          height: height,
          width: "100%",
          aspectRatio: 9 / 16,
        },
      ]}
      contentFit="fill"
      player={player}
      allowsFullscreen
    />
  )
}

const styles = StyleSheet.create({
  page: {
    justifyContent: "center",
    alignItems: "center",
  },
})
