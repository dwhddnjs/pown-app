import { ShortsPlayer } from "@/components/shorts/shorts-player"
import { Text, View } from "@/components/Themed"
import { useShortsStore } from "@/hooks/use-shorts-store"
import { useEvent } from "expo"
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router"
import { useVideoPlayer, VideoView } from "expo-video"
import React, { useMemo } from "react"
import { StyleSheet, TouchableOpacity } from "react-native"
import PagerView from "react-native-pager-view"
import { SafeAreaView } from "react-native-safe-area-context"
import ArrowIcon from "@expo/vector-icons/AntDesign"
import useCurrneThemeColor from "@/hooks/use-current-theme-color"

export default function ShortsView() {
  const { slug } = useLocalSearchParams<any>()
  const { videos } = useShortsStore()
  const themeColor = useCurrneThemeColor()
  const { back } = useRouter()
  // const uri = slug.join("/")

  const initailPage = useMemo(() => {
    const index = videos.findIndex((v) => v.id === parseInt(slug[0]))
    return index >= 0 ? index : 0
  }, [slug[0]])

  return (
    <SafeAreaView style={{ flex: 1, position: "relative" }}>
      {/* <View>
        <TouchableOpacity
          style={{
            paddingRight: 16,
          }}
          onPress={() => {
            back()
          }}
        >
          <ArrowIcon name="left" size={28} color={themeColor.text} />
        </TouchableOpacity>
      </View> */}
      <PagerView
        style={{
          flex: 1,
          position: "relative",
        }}
        initialPage={initailPage}
        orientation={"vertical"}
      >
        {videos.map((item) => (
          <ShortsPlayer video={item} key={item.id} />
        ))}
      </PagerView>
    </SafeAreaView>
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
