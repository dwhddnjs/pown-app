import { ShortsPlayer } from "@/components/shorts/shorts-player"
import { Text, View } from "@/components/Themed"
import { useShortsStore } from "@/hooks/use-shorts-store"
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router"
import React, { useEffect, useMemo, useRef, useState } from "react"
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import ArrowIcon from "@expo/vector-icons/AntDesign"
import useCurrneThemeColor from "@/hooks/use-current-theme-color"
import Feather from "@expo/vector-icons/Feather"
import { format } from "date-fns"
import { RemoveShortsDialog } from "@/components/shorts/remove-shorts-dialog"

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
  const ref = useRef<ScrollView>(null)

  const [height, setHeight] = useState(0)

  useEffect(() => {
    if (!ref.current || height === 0) {
      return
    }
    ref.current.scrollTo({
      y: position * height,
      animated: false,
    })
  }, [height])

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: themeColor.hard }}>
      <ScrollView
        ref={ref}
        pagingEnabled
        horizontal={false}
        showsVerticalScrollIndicator={false}
        style={{ backgroundColor: "black" }}
        onLayout={(e) => setHeight(e.nativeEvent.layout.height)}
        onScroll={(e) => {
          const offsetY = e.nativeEvent.contentOffset.y
          const index = Math.round(offsetY / height)
          if (index !== position) {
            setPosition(index)
          }
        }}
      >
        {videos.map((item, index) => {
          return (
            <ShortsPlayer
              video={item}
              key={item.id}
              height={height}
              isActive={index === position}
            />
          )
        })}
      </ScrollView>
      <View
        style={[
          styles.backButtonContainer,
          { backgroundColor: themeColor.hard },
        ]}
      >
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
    justifyContent: "space-between",
    flexDirection: "row",
    alignItems: "center",
  },
})
