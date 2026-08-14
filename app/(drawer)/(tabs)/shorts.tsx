import { useEffect, useMemo, useState } from "react";
// component
import {
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
  useWindowDimensions,
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

// 탭바 위로 띄우는 간격 — 운동 탭의 계산기 버튼과 같은 값을 쓴다(workout.tsx)
const FAB_TAB_GAP = 15;

// 복구도 실패한 썸네일(예: 사진첩에서 지운 구 데이터)은 투명하게 비는 대신
// 대체 타일로 그린다 — 눌러서 재생·삭제까지 갈 수 있어야 한다.
// 색은 부모가 넘긴다 — 셀마다 테마를 구독하면 그리드 전체가 같이 리렌더된다.
const Thumbnail = ({
  uri,
  fallbackColor,
  iconColor,
}: {
  uri: string;
  fallbackColor: string;
  iconColor: string;
}) => {
  const [isFailed, setIsFailed] = useState(false);

  if (isFailed) {
    return (
      <View style={[styles.fallback, { backgroundColor: fallbackColor }]}>
        <Entypo name="video-camera" size={20} color={iconColor} />
      </View>
    );
  }

  return (
    <Image
      source={{ uri: resolveMediaUri(uri) }}
      style={styles.image}
      onError={() => setIsFailed(true)}
    />
  );
};

export default function TabTwoScreen() {
  const themeColor = useCurrentThemeColor();
  const { width: screenWidth } = useWindowDimensions();
  const { videos, onRepairVideos } = useShortsStore();

  const { push } = useRouter();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();

  // 하이드레이션이 늦으면(구버전 저장소에서 옮겨오는 첫 실행) 첫 렌더의 목록이 비어 있다.
  // 목록이 바뀔 때마다 불러 두면 데이터가 도착한 뒤에도 한 번은 돈다 — 실제 실행 여부는
  // 스토어가 판단하므로 여기서 도는 건 대부분 즉시 반환이다.
  useEffect(() => {
    onRepairVideos();
  }, [videos, onRepairVideos]);

  // 매 렌더마다 새 객체를 넘기면 그때마다 리스트가 레이아웃을 다시 잡는다
  // (workout.tsx의 listPadding과 같은 이유)
  const listStyle = useMemo(
    () => ({ paddingTop: headerHeight }),
    [headerHeight],
  );
  // 탭바가 absolute라 마지막 줄이 그 아래로 들어간다 — 그만큼 아래를 띄운다
  const listContentStyle = useMemo(
    () => ({ paddingBottom: tabBarHeight }),
    [tabBarHeight],
  );

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
          style={listStyle}
          contentContainerStyle={listContentStyle}
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
              {/* 복구로 썸네일이 바뀌면 다시 마운트시켜 실패 상태를 푼다 */}
              <Thumbnail
                key={item.thumbnail}
                uri={item.thumbnail}
                fallbackColor={themeColor.itemColor}
                iconColor={themeColor.subText}
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
            // 기기마다 탭바 높이(+홈 인디케이터)가 달라 고정값을 쓰면 위치가 어긋난다
            bottom: tabBarHeight + FAB_TAB_GAP,
          },
        ]}
        onPress={() => push("/shorts/video")}
      >
        <Entypo name="video-camera" size={26} color={themeColor.tintText} />
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
  fallback: {
    width: "100%",
    aspectRatio: 9 / 16,
    justifyContent: "center",
    alignItems: "center",
  },
  addVideo: {
    width: 50,
    height: 50,
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
