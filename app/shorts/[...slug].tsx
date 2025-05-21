import { ShortsPlayer } from "@/components/shorts/shorts-player"
import { Text, View } from "@/components/Themed"
import { useShortsStore } from "@/hooks/use-shorts-store"
import { useEvent } from "expo"
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router"
import { useVideoPlayer, VideoView } from "expo-video"
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
import {
  Animated,
  Dimensions,
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  StyleSheet,
  TouchableOpacity,
} from "react-native"
import PagerView from "react-native-pager-view"
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context"
import ArrowIcon from "@expo/vector-icons/AntDesign"
import useCurrneThemeColor from "@/hooks/use-current-theme-color"
import Feather from "@expo/vector-icons/Feather"
import { format } from "date-fns"
import { Dialog } from "@/components/Dialog"
import { Button } from "@/components/Button"
import { RemoveShortsDialog } from "@/components/shorts/remove-shorts-dialog"

const { height: SCREEN_HEIGHT } = Dimensions.get("screen")

export default function ShortsView() {
  const { slug } = useLocalSearchParams<any>()
  const { videos, setRemoveVideo } = useShortsStore()
  const themeColor = useCurrneThemeColor()
  const { back } = useRouter()
  const initailPage = useMemo(() => {
    const index = videos.findIndex((v) => v.id === parseInt(slug[0]))
    return index >= 0 ? index : 0
  }, [])
  const [position, setPosition] = useState(initailPage)
  const [isOpen, setIsOpen] = useState(false)
  const ref = useRef<PagerView>(null)

  // console.log("position: ", position)

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <PagerView
        ref={ref}
        style={{ flex: 1 }}
        initialPage={position}
        orientation={"vertical"}
        // onPageScroll={(e) => {
        //   console.log(e.nativeEvent.position)
        //   setPosition((prev) => prev + 1)
        // }}
        onPageScrollStateChanged={(e) => {
          const state = e.nativeEvent.pageScrollState

          if (state === "idle" && ref.current) {
            const page = ref.current
            console.log("page: ", page)
          }
        }}
        // onPageSelected={(e) => {
        //   setPosition(e.nativeEvent.position)
        // }}
        offscreenPageLimit={1}
      >
        {videos.map((item, index) => {
          return (
            <ShortsPlayer
              video={item}
              key={index}
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
          {format(videos[position]?.createdAt, "yyyy년 MM월 dd일")}
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
