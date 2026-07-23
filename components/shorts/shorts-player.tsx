import React, { useEffect, useState } from "react"
import { Pressable, StyleSheet, View } from "react-native"
import { resolveMediaUri } from "@/lib/media"
import { useEvent, useEventListener } from "expo"
import { useVideoPlayer, VideoView } from "expo-video"
import Feather from "@expo/vector-icons/Feather"

interface ShortsPlayerProps {
  uri: string
  isActive?: boolean
  height?: number
}

export const ShortsPlayer = ({ uri, isActive, height }: ShortsPlayerProps) => {
  const [progress, setProgress] = useState(0)
  // loop 재시작 때 playingChange가 튀며 아이콘이 깜빡이므로, 유저가 멈췄는지를 직접 들고 있는다
  const [paused, setPaused] = useState(false)
  const player = useVideoPlayer(resolveMediaUri(uri), (player) => {
    player.loop = true
    // 기본값 0이면 timeUpdate 이벤트가 오지 않는다
    player.timeUpdateEventInterval = 0.25
  })

  const { muted } = useEvent(player, "mutedChange", {
    muted: player.muted,
  })

  useEventListener(player, "timeUpdate", ({ currentTime }) => {
    setProgress(player.duration ? currentTime / player.duration : 0)
  })

  useEffect(() => {
    if (isActive) {
      player.play()
      setPaused(false)
    } else {
      player.pause()
    }
  }, [isActive, player])

  return (
    <Pressable
      style={[{ width: "100%" }, height ? { height } : { flex: 1 }]}
      onPress={() => {
        if (player.playing) {
          player.pause()
          setPaused(true)
        } else {
          player.play()
          setPaused(false)
        }
      }}
    >
      <VideoView
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        player={player}
        nativeControls={false}
        // 일시정지 시 우하단에 뜨는 iOS Live Text(텍스트 복사) 버튼 비활성화
        allowsVideoFrameAnalysis={false}
      />
      {paused && (
        <View style={styles.playOverlay} pointerEvents="none">
          <View style={styles.playBadge}>
            <Feather name="play" size={40} color="rgba(255,255,255,0.9)" />
          </View>
        </View>
      )}
      <Pressable
        style={styles.muteButton}
        hitSlop={12}
        onPress={() => (player.muted = !player.muted)}
      >
        <Feather
          name={muted ? "volume-x" : "volume-2"}
          size={22}
          color="white"
        />
      </Pressable>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
      </View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  playOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
  },
  playBadge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(0,0,0,0.2)",
    justifyContent: "center",
    alignItems: "center",
    paddingLeft: 6,
  },
  muteButton: {
    position: "absolute",
    right: 16,
    bottom: 24,
    padding: 8,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  progressTrack: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 3,
    backgroundColor: "rgba(255,255,255,0.25)",
  },
  progressFill: {
    height: 3,
    backgroundColor: "white",
  },
})
