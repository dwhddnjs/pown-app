// component
import {
  Dimensions,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
} from "react-native";
import { View } from "@/components/themed";
// expo
import { useRouter } from "expo-router";
// hooks
import useCurrentThemeColor from "@/hooks/use-current-theme-color";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useShortsStore } from "@/hooks/use-shorts-store";
// lib
import { resolveMediaUri } from "@/lib/media";
// icons
import Entypo from "@expo/vector-icons/Entypo";
import { EmptyVideos } from "@/components/shorts/empty-videos";

export default function TabTwoScreen() {
  const themeColor = useCurrentThemeColor();
  const screenWidth = Dimensions.get("window").width;
  const { videos } = useShortsStore();

  const { push } = useRouter();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();

  return (
    <View style={{ flex: 1, backgroundColor: themeColor.background }}>
      {videos.length === 0 ? (
        <EmptyVideos />
      ) : (
        <FlatList
          data={videos}
          numColumns={3}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
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
              <Image
                source={{ uri: resolveMediaUri(item.thumbnail) }}
                style={styles.image}
              />
            </TouchableOpacity>
          )}
        />
      )}
      <TouchableOpacity
        style={[
          styles.addVideo,
          {
            borderColor: themeColor.tint,
            bottom: tabBarHeight + 20,
          },
        ]}
        onPress={() => push("/shorts/video")}
      >
        <Entypo name="video-camera" size={28} color={themeColor.tintText} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  image: {
    width: "100%",
    aspectRatio: 9 / 16,
    resizeMode: "cover",
  },
  addVideo: {
    width: 56,
    height: 56,
    borderWidth: 2,
    position: "absolute",
    opacity: 0.8,
    right: 20,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    paddingLeft: 4,
  },
});
