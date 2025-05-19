import { ShortsPlayer } from "@/components/shorts/shorts-player"
import { Text, View } from "@/components/Themed"
import { useShortsStore } from "@/hooks/use-shorts-store"
import { useEvent } from "expo"
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router"
import { useVideoPlayer, VideoView } from "expo-video"
import React, { useEffect, useMemo, useState } from "react"
import {
  Dimensions,
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  StyleSheet,
  TouchableOpacity,
} from "react-native"
import PagerView from "react-native-pager-view"
import { SafeAreaView } from "react-native-safe-area-context"
import ArrowIcon from "@expo/vector-icons/AntDesign"
import useCurrneThemeColor from "@/hooks/use-current-theme-color"
import Feather from "@expo/vector-icons/Feather"
import { format } from "date-fns"
import { Dialog } from "@/components/Dialog"
import { Button } from "@/components/Button"
import { RemoveShortsDialog } from "@/components/shorts/remove-shorts-dialog"
const { height: SCREEN_HEIGHT } = Dimensions.get("window")

export default function ShortsView() {
  const { slug } = useLocalSearchParams<any>()

  const { videos, setRemoveVideo } = useShortsStore()
  const themeColor = useCurrneThemeColor()
  const { back } = useRouter()
  const initailPage = () => {
    const index = videos.findIndex((v) => v.id === parseInt(slug[0]))
    return index >= 0 ? index : 0
  }
  const [position, setPosition] = useState(initailPage())
  console.log("position: ", position)
  const [isOpen, setIsOpen] = useState(false)

  return (
    <SafeAreaView style={{ flex: 1, position: "relative" }}>
      <PagerView
        style={{ flex: 1, position: "relative" }}
        // initialPage={initailPage()}
        orientation={"vertical"}
        onPageScroll={(e) => console.log(e.nativeEvent.position)}
        // onPageSelected={(e) => console.log(e.nativeEvent.position)}
        // onPageScrollStateChanged={(e) =>

        // }
        // offscreenPageLimit={0}
      >
        {videos.map((item, index) => {
          return (
            <ShortsPlayer
              video={item}
              key={item.id}
              isActive={index === position}
            />
          )
        })}
      </PagerView>
      <View style={styles.backButtonContainer}>
        <TouchableOpacity style={{ paddingRight: 16 }} onPress={() => back()}>
          <ArrowIcon name="left" size={24} color={themeColor.text} />
        </TouchableOpacity>
        <Text style={{ fontSize: 16 }}>
          {format(videos[position].createdAt, "yyyy년 MM월 dd일")}
        </Text>
        <TouchableOpacity
          style={{ paddingRight: 16 }}
          onPress={() => setIsOpen(true)}
        >
          <Feather name="trash" size={24} color={themeColor.text} />
        </TouchableOpacity>
      </View>
      <RemoveShortsDialog
        open={isOpen}
        setIsOpen={() => setIsOpen(false)}
        position={position}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  video: {
    flex: 1,
  },
  page: {
    justifyContent: "center",
    alignItems: "center",
  },
  backButtonContainer: {
    paddingVertical: 20,
    paddingHorizontal: 24,
    backgroundColor: "black",
    justifyContent: "space-between",
    flexDirection: "row",
    alignItems: "center",
  },
})
