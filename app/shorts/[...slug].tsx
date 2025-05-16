import { Text, View } from "@/components/Themed"
import { useShortsStore } from "@/hooks/use-shorts-store"
import { useEvent } from "expo"
import { useLocalSearchParams, useNavigation } from "expo-router"
import { useVideoPlayer, VideoView } from "expo-video"
import React from "react"
import { StyleSheet } from "react-native"
import PagerView from "react-native-pager-view"

export default function ShortsView() {
  const { slug } = useLocalSearchParams<any>()
  const { videos } = useShortsStore()
  const uri = slug.join("/")

  return (
    <View style={{ flex: 1 }}>
      <PagerView style={{ flex: 1 }} initialPage={0} orientation={"vertical"}>
        {videos.map((item) => {
          const player = useVideoPlayer(item.video, (player) => {
            player.loop = true
            player.play()
          })
          const { isPlaying } = useEvent(player, "playingChange", {
            isPlaying: player.playing,
          })
          return (
            <VideoView
              key={item.id}
              style={styles.video}
              player={player}
              allowsFullscreen
              allowsPictureInPicture
            />
          )
        })}
      </PagerView>
    </View>
  )
}

const styles = StyleSheet.create({
  video: {
    flex: 1,
    // width: 350,
    // height: 275,
  },
  page: {
    justifyContent: "center",
    alignItems: "center",
  },
})
