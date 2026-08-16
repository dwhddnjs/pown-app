import React, { useEffect, useMemo, useRef, useState } from "react";
import { PanResponder, Pressable, StyleSheet, View } from "react-native";
import { resolveMediaUri } from "@/lib/media";
import { useEvent, useEventListener } from "expo";
import { useVideoPlayer, VideoView } from "expo-video";
import Animated, {
  SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import useCurrentThemeColor from "@/hooks/use-current-theme-color";
import Feather from "@expo/vector-icons/Feather";

interface ShortsPlayerProps {
  uri: string;
  isActive?: boolean;
  onPressMemo?: () => void;
  // 메모 시트로 영상 영역이 줄었을 때 — 잘라내지 않고 전체가 보이게 한다
  compact?: boolean;
  // 주면 진행률을 여기에도 흘려보내고 손잡이(점)는 그리지 않는다.
  // 점을 막대 중앙에 놓으면 아래 절반이 ScrollView 밖으로 나가 잘리기 때문에,
  // 리스트 화면에서는 부모가 하단바 위에 겹쳐 그린다.
  progressSV?: SharedValue<number>;
  // 스크롤 중에는 진행바를 숨긴다 — 부모가 스크롤 시작/끝에서 0↔1로 바꾼다.
  // state로 두면 페이지 전체가 리렌더되므로 shared value로 받는다.
  barOpacity?: SharedValue<number>;
}

const KNOB = 12;
const BAR_HEIGHT = 3;

export const ShortsPlayer = ({
  uri,
  isActive,
  onPressMemo,
  compact,
  progressSV,
  barOpacity,
}: ShortsPlayerProps) => {
  const [progress, setProgress] = useState(0);
  // 재생/일시정지 중 "방금 바뀐 상태"를 나타내는 아이콘
  const [icon, setIcon] = useState<"play" | "pause">("play");
  const [trackWidth, setTrackWidth] = useState(0);
  const [isSeeking, setIsSeeking] = useState(false);
  // PanResponder 콜백은 생성 시점 값을 캡처하므로 최신 값을 ref로 읽는다
  const seekingRef = useRef(false);
  const trackWidthRef = useRef(0);
  const trackLeftRef = useRef(0);
  const themeColor = useCurrentThemeColor();

  const scale = useSharedValue(1);
  const opacity = useSharedValue(0);

  const player = useVideoPlayer(resolveMediaUri(uri), (player) => {
    player.loop = true;
    // 기본값 0이면 timeUpdate 이벤트가 오지 않는다
    player.timeUpdateEventInterval = 0.25;
  });

  const { muted } = useEvent(player, "mutedChange", {
    muted: player.muted,
  });

  // PanResponder는 첫 렌더의 클로저를 그대로 들고 있으므로 isActive는 ref로 읽는다
  const isActiveRef = useRef(isActive);
  isActiveRef.current = isActive;

  const updateProgress = (ratio: number) => {
    setProgress(ratio);
    if (progressSV && isActiveRef.current) progressSV.value = ratio;
  };

  useEventListener(player, "timeUpdate", ({ currentTime }) => {
    if (seekingRef.current) return;
    updateProgress(player.duration ? currentTime / player.duration : 0);
  });

  useEffect(() => {
    if (isActive) {
      player.play();
      opacity.value = 0;
      // 페이지가 바뀐 직후 첫 timeUpdate 전까지 부모 손잡이가 옛 위치에 남지 않게
      if (progressSV) {
        progressSV.value = player.duration
          ? player.currentTime / player.duration
          : 0;
      }
    } else {
      player.pause();
    }
  }, [isActive, player, opacity, progressSV]);

  const iconStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  const barStyle = useAnimatedStyle(() => ({
    opacity: barOpacity ? barOpacity.value : 1,
  }));

  const onTogglePlay = () => {
    const wasPlaying = player.playing;
    if (wasPlaying) {
      player.pause();
      setIcon("pause");
    } else {
      player.play();
      setIcon("play");
    }
    // 작게 튀어나와 한 번 커졌다 제자리로 — 절도 있는 팝
    scale.value = 0.85;
    scale.value = withSequence(
      withTiming(1.18, { duration: 110 }),
      withSpring(1, { damping: 12, stiffness: 320 }),
    );
    opacity.value = 1;
    // 다시 재생되는 경우엔 잠깐 보였다가 사라진다
    if (wasPlaying) return;
    opacity.value = withDelay(400, withTiming(0, { duration: 220 }));
  };

  // 인자는 항상 화면 절대 X — grant(pageX)와 move(moveX)가 같은 좌표계를 쓰게 맞춘다
  const seekToX = (pageX: number) => {
    const width = trackWidthRef.current;
    if (!width || !player.duration) return;
    const x = pageX - trackLeftRef.current;
    const ratio = Math.min(1, Math.max(0, x / width));
    updateProgress(ratio);
    player.currentTime = ratio * player.duration;
  };

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        // 진행바를 터치하는 순간 responder를 잡아 부모의 재생 토글·세로 스크롤을 막는다
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: (e) => {
          seekingRef.current = true;
          setIsSeeking(true);
          // 막대의 화면 절대 X를 터치에서 직접 뽑는다(measure 불필요).
          // 자식(막대·손잡이)이 pointerEvents="none"이라 locationX는 항상 이 View 기준
          trackLeftRef.current = e.nativeEvent.pageX - e.nativeEvent.locationX;
          seekToX(e.nativeEvent.pageX);
        },
        onPanResponderMove: (_, gesture) => seekToX(gesture.moveX),
        onPanResponderRelease: () => {
          seekingRef.current = false;
          setIsSeeking(false);
        },
        onPanResponderTerminate: () => {
          seekingRef.current = false;
          setIsSeeking(false);
        },
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const knobLeft = trackWidth
    ? Math.min(Math.max(progress * trackWidth - KNOB / 2, 0), trackWidth - KNOB)
    : 0;

  return (
    <Pressable style={{ width: "100%", flex: 1 }} onPress={onTogglePlay}>
      <VideoView
        style={StyleSheet.absoluteFill}
        contentFit={compact ? "contain" : "cover"}
        player={player}
        nativeControls={false}
        // 일시정지 시 우하단에 뜨는 iOS Live Text(텍스트 복사) 버튼 비활성화
        allowsVideoFrameAnalysis={false}
      />
      <View style={styles.playOverlay} pointerEvents="none">
        <Animated.View style={[styles.playBadge, iconStyle]}>
          <Feather
            name={icon}
            size={36}
            color="rgba(255,255,255,0.95)"
            // 삼각형은 무게중심이 왼쪽이라 그대로 두면 원 중앙에서 왼쪽으로 치우쳐 보인다
            style={icon === "play" ? { transform: [{ translateX: 3 }] } : null}
          />
        </Animated.View>
      </View>
      {onPressMemo && (
        <Pressable style={styles.memoButton} hitSlop={12} onPress={onPressMemo}>
          <Feather name="edit-2" size={22} color="white" />
        </Pressable>
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
      <Animated.View
        style={[styles.progressHit, barStyle]}
        onLayout={(e) => {
          trackWidthRef.current = e.nativeEvent.layout.width;
          setTrackWidth(e.nativeEvent.layout.width);
        }}
        {...panResponder.panHandlers}
      >
        <View
          pointerEvents="none"
          style={[styles.progressTrack, isSeeking && styles.trackActive]}
        >
          <View
            style={[
              styles.progressFill,
              {
                width: `${progress * 100}%`,
                backgroundColor: themeColor.tint,
              },
            ]}
          />
        </View>
        {!progressSV && (
          <View
            pointerEvents="none"
            style={[
              styles.knob,
              {
                left: knobLeft,
                backgroundColor: themeColor.tint,
                transform: [{ scale: isSeeking ? 1.6 : 1 }],
              },
            ]}
          />
        )}
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  playOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
  },
  playBadge: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    alignItems: "center",
  },
  memoButton: {
    position: "absolute",
    right: 16,
    bottom: 72,
    padding: 8,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  muteButton: {
    position: "absolute",
    right: 16,
    bottom: 24,
    padding: 8,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  // 3px 막대는 잡기 어렵다 — 막대는 맨 아래에 붙이고 터치 영역만 위로 넉넉히 준다
  progressHit: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 24,
    justifyContent: "flex-end",
  },
  progressTrack: {
    height: BAR_HEIGHT,
    backgroundColor: "rgba(255,255,255,0.25)",
  },
  trackActive: {
    height: 5,
  },
  progressFill: {
    height: "100%",
  },
  knob: {
    position: "absolute",
    // 막대 중앙에 맞춘다 — 아래 절반은 플레이어 밖으로 나가므로,
    // 이 화면(촬영 미리보기)에서는 부모가 플레이어에 zIndex를 줘 하단바 위에 그린다.
    // 리스트 화면은 ScrollView가 잘라내므로 이 손잡이 대신 부모가 직접 그린다(progressSV).
    bottom: -(KNOB - BAR_HEIGHT) / 2,
    width: KNOB,
    height: KNOB,
    borderRadius: KNOB / 2,
  },
});
