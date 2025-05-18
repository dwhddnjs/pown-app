import { useEffect, useRef } from "react"
// component
import {
  AppState,
  Dimensions,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
} from "react-native"
import { Text, View } from "@/components/Themed"
// expo
import { useRouter } from "expo-router"
// zustand
import { useUserStore } from "@/hooks/use-user-store"
// hooks
import useCurrneThemeColor from "@/hooks/use-current-theme-color"
import { useHeaderHeight } from "@react-navigation/elements"
import { useShortsStore } from "@/hooks/use-shorts-store"
// icons
import Entypo from "@expo/vector-icons/Entypo"

export default function TabTwoScreen() {
  const { onReset, ...result } = useUserStore()
  const themeColor = useCurrneThemeColor()
  const screenWidth = Dimensions.get("window").width
  const { videos } = useShortsStore()
  const { push } = useRouter()
  const headerHeight = useHeaderHeight()

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={videos}
        numColumns={3}
        style={{ paddingTop: headerHeight }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={{
              flex: 1,
              flexDirection: "column",
              alignSelf: "flex-start",
              maxWidth: screenWidth / 3,
            }}
            onPress={() => push(`/shorts/${item.id}`)}
          >
            <Image source={{ uri: item.thumbnail }} style={styles.image} />
          </TouchableOpacity>
        )}
      />
      <TouchableOpacity
        style={[
          styles.addVideo,
          {
            borderColor: themeColor.subText,
          },
        ]}
        onPress={() => push("/shorts/video")}
      >
        <Entypo name="video-camera" size={32} color={themeColor.tint} />
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  box: {
    borderWidth: 1,
    borderColor: "white",
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: "100%",
    aspectRatio: 9 / 16,
    resizeMode: "cover",
  },
  addVideo: {
    width: 64,
    height: 64,
    borderWidth: 2,
    position: "absolute",

    bottom: 20,
    right: 20,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    paddingLeft: 4,
  },
})
