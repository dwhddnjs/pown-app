import { ShortsPlayer } from "@/components/shorts/shorts-player";
import { ShortsMemoSheet } from "@/components/shorts/shorts-memo-sheet";
import { Text, View } from "@/components/themed";
import { useShortsStore } from "@/hooks/use-shorts-store";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Keyboard,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ArrowIcon from "@expo/vector-icons/AntDesign";
import useCurrentThemeColor from "@/hooks/use-current-theme-color";
import Feather from "@expo/vector-icons/Feather";
import BottomSheet from "@gorhom/bottom-sheet";
import Animated, {
  runOnJS,
  useAnimatedReaction,
  useAnimatedRef,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { format } from "date-fns";
import { formatDate } from "@/lib/date";
import { useLanguage } from "@/hooks/use-user-store";
import { RemoveShortsDialog } from "@/components/shorts/remove-shorts-dialog";
import { StatusBar } from "expo-status-bar";

const KNOB = 12;
const BAR_HEIGHT = 3;

export default function ShortsView() {
  const { slug } = useLocalSearchParams<any>();

  const { videos } = useShortsStore();
  // 아이패드는 회전하므로 모듈 로드 시점 폭을 고정하면 안 된다
  const { width: screenWidth } = useWindowDimensions();
  const themeColor = useCurrentThemeColor();
  const lang = useLanguage();
  const { back } = useRouter();
  const initialPage = useMemo(() => {
    const index = videos.findIndex((v) => v.id === parseInt(slug?.[0]));
    return index >= 0 ? index : 0;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [position, setPosition] = useState(initialPage);
  const [isOpen, setIsOpen] = useState(false);
  const [isMemoOpen, setIsMemoOpen] = useState(false);
  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const memoRef = useRef<BottomSheet>(null);

  // 영상 한 페이지의 원래 높이 — JS쪽 페이지 인덱스 계산용
  const [fullHeight, setFullHeight] = useState(0);
  // 메모 시트의 상단 Y. 시트가 스프링·손가락으로 움직이는 매 프레임이 그대로 영상 높이가 된다.
  // (닫혀 있으면 컨테이너 높이라서 영상 높이보다 크다 → clamp 되어 원래 높이)
  const sheetTop = useSharedValue(0);
  const fullHeightSV = useSharedValue(0);
  // 재생 중인 영상의 진행률 — 손잡이(점)를 여기서 그린다
  const progressSV = useSharedValue(0);
  // 스크롤 중에는 진행바·손잡이를 숨긴다
  const barOpacity = useSharedValue(1);

  const pageHeight = useDerivedValue(() =>
    fullHeightSV.value === 0 || sheetTop.value <= 0
      ? fullHeightSV.value
      : Math.min(sheetTop.value, fullHeightSV.value),
  );

  // 페이지 높이는 절대 변하지 않는다. 예전엔 시트에 맞춰 페이지와 스크롤뷰 높이를
  // 같이 줄였는데, iOS는 contentSize·bounds가 바뀌는 프레임에 contentOffset을
  // (contentSize - bounds)로 잘라낸다 — 둘이 같은 프레임에 반영되지 않는 순간
  // 최대 오프셋이 거의 0이 되어 보고 있던 페이지가 첫 페이지로 잘려버렸다.
  // (시트가 멈추면 높이가 더 안 바뀌어 UI 스레드 보정도 다시 돌지 않으니 그대로 남는다.)
  // 이제 줄어드는 건 페이지 "안쪽 영상 영역"뿐이라 스크롤 기하가 흔들리지 않는다.
  const videoAreaStyle = useAnimatedStyle(() => ({
    height: pageHeight.value,
  }));

  // 영상이 줄어든 상태인지는 시트 콜백이 아니라 실제 높이에서 판단한다.
  // onAnimate(-1)만 믿으면 키보드 때문에 닫기가 취소됐을 때 상태가 어긋나
  // 시트는 열려 있는데 contentFit이 cover로 돌아가 영상이 확대돼 보인다.
  const onMemoOpenChange = useCallback((isMemoOpen: boolean) => {
    setIsMemoOpen(isMemoOpen);
    // 저장 버튼으로 닫으면 키보드만 화면에 남는다
    if (!isMemoOpen) {
      Keyboard.dismiss();
    }
  }, []);

  useAnimatedReaction(
    () => fullHeightSV.value > 0 && pageHeight.value < fullHeightSV.value - 1,
    (isShrunk, prev) => {
      if (isShrunk !== prev) {
        runOnJS(onMemoOpenChange)(isShrunk);
      }
    },
  );

  // 진행바 손잡이는 스크롤뷰 밖에서 그린다 —
  // 막대 중앙에 맞추면 아래 절반이 스크롤뷰 밖이라 안에서는 잘린다
  const knobStyle = useAnimatedStyle(() => ({
    top: pageHeight.value - BAR_HEIGHT / 2 - KNOB / 2,
    left: Math.min(
      Math.max(progressSV.value * screenWidth - KNOB / 2, 0),
      screenWidth - KNOB,
    ),
    opacity: pageHeight.value > 0 ? barOpacity.value : 0,
  }));

  // 첫 진입 시 슬러그가 가리키는 페이지로 한 번 맞춘다 — 자식 레이아웃이 잡힌 뒤라야
  // offset이 0으로 clamp되지 않는다
  useEffect(() => {
    if (!fullHeight) {
      return;
    }
    scrollRef.current?.scrollTo({
      y: position * fullHeight,
      animated: false,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fullHeight]);

  return (
    <SafeAreaView
      edges={["bottom"]}
      style={{ flex: 1, backgroundColor: themeColor.hard }}
    >
      <StatusBar style="light" />
      {/* 페이지 한 장의 높이를 재는 래퍼 — 시트가 올라와도 이 높이는 변하지 않는다 */}
      <Animated.View
        style={{ flex: 1 }}
        onLayout={(e) => {
          const layoutHeight = e.nativeEvent.layout.height;
          fullHeightSV.value = layoutHeight;
          setFullHeight(layoutHeight);
        }}
      >
        <Animated.ScrollView
          ref={scrollRef}
          pagingEnabled
          horizontal={false}
          scrollEnabled={!isMemoOpen}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          style={{ flex: 1, backgroundColor: "black" }}
          // 다른 영상을 보려고 스크롤을 시작하면 진행바·손잡이를 감춘다
          onScrollBeginDrag={() => {
            barOpacity.value = withTiming(0, { duration: 120 });
          }}
          // onScroll을 쓰면 높이가 바뀔 때도 이벤트가 와서 옛 offset ÷ 새 height로
          // 엉뚱한 페이지가 계산된다. 사용자 스와이프가 끝났을 때만 갱신한다.
          onMomentumScrollEnd={(e) => {
            barOpacity.value = withTiming(1, { duration: 180 });
            if (!fullHeight) {
              return;
            }
            const offsetY = e.nativeEvent.contentOffset.y;
            const index = Math.min(
              Math.max(Math.round(offsetY / fullHeight), 0),
              videos.length - 1,
            );
            if (index !== position) {
              setPosition(index);
            }
          }}
        >
          {videos.map((item, index) => {
            return (
              <View
                key={item.id}
                style={{
                  width: "100%",
                  height: fullHeight,
                  backgroundColor: "transparent",
                }}
              >
                {/* 시트가 덮는 만큼 영상 영역만 줄인다 — 페이지 높이는 그대로다 */}
                <Animated.View style={videoAreaStyle}>
                  <ShortsPlayer
                    uri={item.video}
                    isActive={index === position}
                    compact={isMemoOpen}
                    progressSV={progressSV}
                    barOpacity={barOpacity}
                    onPressMemo={() => memoRef.current?.snapToIndex(0)}
                  />
                </Animated.View>
              </View>
            );
          })}
        </Animated.ScrollView>
      </Animated.View>
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
          {videos[position]?.createdAt
            ? formatDate(
                format(new Date(videos[position].createdAt), "yyyy.MM.dd"),
                lang,
              )
            : ""}
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
      <ShortsMemoSheet
        ref={memoRef}
        video={videos[position]}
        animatedPosition={sheetTop}
      />
      {/* 하단바·시트보다 뒤에 그려서 경계선 위에 그대로 겹치게 둔다 */}
      <Animated.View
        pointerEvents="none"
        style={[styles.knob, { backgroundColor: themeColor.tint }, knobStyle]}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  knob: {
    position: "absolute",
    width: KNOB,
    height: KNOB,
    borderRadius: KNOB / 2,
  },
  backButtonContainer: {
    paddingVertical: 20,
    paddingHorizontal: 24,
    justifyContent: "space-between",
    flexDirection: "row",
    alignItems: "center",
  },
});
