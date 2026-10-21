import React, { useCallback } from "react";
// component
import { StyleSheet } from "react-native";
import {
  useSafeAreaFrame,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import Animated, {
  KeyboardState,
  measure,
  runOnJS,
  SharedValue,
  useAnimatedKeyboard,
  useAnimatedReaction,
  useAnimatedRef,
  useAnimatedStyle,
  useFrameCallback,
  useSharedValue,
} from "react-native-reanimated";
import { NOTE_TOOLBAR_HEIGHT } from "@/components/note-format-toolbar";

// 키보드가 멈춘 뒤에도 독 자리를 더 재는 프레임 수 — 시트는 키보드가 다 뜬 뒤(keyboardDidShow)에도
// 내용 영역을 애니메이션으로 줄인다
const SETTLE_FRAMES = 90;

// 툴바가 화면 아래끝에서 키보드와 함께 덮는 높이 — 독은 키보드가 툴바 높이만큼 올라오기 전엔 그만큼만 빼꼼 올라온다.
// 하드웨어 키보드처럼 키보드 칸이 툴바보다 낮게 남으면(21) 본문이 툴바 전체(44)를 비워 툴바 위에 빈 띠가 생겼다
const coveredBottom = (keyboardHeight: number, toolbar: number) => {
  "worklet";
  return keyboardHeight + Math.min(toolbar, keyboardHeight);
};

interface NoteToolbarDockProps {
  children: React.ReactNode;
  // 제목 칸에 포커스가 있다 — 툴바는 본문용이라 숨긴다
  titleFocused: boolean;
  // 독이 잰 부모 아래끝 ~ 화면 아래끝 거리를 받아 갈 곳 (숏츠 메모 시트 본문 칸 여백 — useNoteSheetEditorInset)
  gap?: SharedValue<number>;
}

// 안드로이드엔 키보드 보조 막대가 없다 — 키보드 윗변에 붙여 reanimated가 프레임마다 받는 키보드 높이
// (WindowInsets 애니메이션)로 같이 오르내린다. 키보드가 내려가 있으면 화면 아래로 빠진다.
// 키보드 높이는 화면 아래끝에서 재는데 독은 부모 아래끝에 놓인다 — 숏츠 메모 시트는 키보드가 뜨면 내용 영역을
// 스스로 줄여서(다 줄어도 키보드 윗변보다 24 아래) 키보드 높이만큼 올리면 툴바가 시트 위로 날아가 안 보였다.
// 부모 아래끝이 화면 아래끝에서 떨어진 만큼은 덜 올린다 (iOS 쌍은 키보드 보조 막대)
export const NoteToolbarDock = ({
  children,
  titleFocused,
  gap: sharedGap,
}: NoteToolbarDockProps) => {
  const keyboard = useAnimatedKeyboard();
  const screenHeight = useSafeAreaFrame().height;
  const anchor = useAnimatedRef<Animated.View>();
  // 부모 아래끝 ~ 화면 아래끝. 시트가 닫혀 화면 밖에 있을 때 잰 값(음수)은 버린다
  const ownGap = useSharedValue(0);
  const gap = sharedGap ?? ownGap;
  const measureGap = () => {
    "worklet";
    const layout = measure(anchor);
    if (layout) gap.value = Math.max(0, screenHeight - layout.pageY);
  };

  // 키보드가 움직이는 동안과 멈춘 뒤 잠깐만 프레임마다 잰다 — 떠 있는 내내 돌리면 화면이 쉬지 못한다
  const tracking = useSharedValue(false);
  const quietFrames = useSharedValue(0);
  const tracker = useFrameCallback(() => {
    measureGap();
    const state = keyboard.state.value;
    const moving =
      state === KeyboardState.OPENING || state === KeyboardState.CLOSING;
    quietFrames.value = moving ? 0 : quietFrames.value + 1;
    if (quietFrames.value > SETTLE_FRAMES) tracking.value = false;
  }, false);
  const setActive = useCallback(
    (on: boolean) => tracker.setActive(on),
    [tracker],
  );
  useAnimatedReaction(
    () => keyboard.state.value,
    (state, previous) => {
      if (previous === null || state === previous) return;
      // 키보드가 움직이기 시작한 그 프레임에 재 둔다 — 프레임 콜백은 한두 프레임 뒤에 돈다
      measureGap();
      quietFrames.value = 0;
      tracking.value = true;
    },
  );
  useAnimatedReaction(
    () => tracking.value,
    (on, previous) => {
      if (previous !== null && on !== previous) runOnJS(setActive)(on);
    },
  );

  const position = useAnimatedStyle(() => {
    const height = keyboard.height.value;
    // 키보드가 툴바 높이만큼 올라오는 동안 화면 아래(숨김)에서 키보드 윗변까지 따라붙는다
    const hidden = Math.max(0, 1 - height / NOTE_TOOLBAR_HEIGHT);
    return {
      transform: [
        { translateY: gap.value - height + NOTE_TOOLBAR_HEIGHT * hidden },
      ],
    };
  });
  return (
    <>
      {/* 부모 아래끝 — 높이 0이라 자리만 잰다 */}
      <Animated.View ref={anchor} pointerEvents="none" style={styles.anchor} />
      <Animated.View
        pointerEvents={titleFocused ? "none" : "auto"}
        style={[styles.dock, titleFocused && styles.hidden, position]}
      >
        {children}
      </Animated.View>
    </>
  );
};

// 본문이 키보드와 툴바에 가리지 않게 아래를 비운다. 키보드가 없으면 내비게이션 바만큼
export const useNoteEditorInset = (titleFocused: boolean) => {
  const bottom = useSafeAreaInsets().bottom;
  const keyboard = useAnimatedKeyboard();
  const toolbar = titleFocused ? 0 : NOTE_TOOLBAR_HEIGHT;
  return useAnimatedStyle(() => ({
    paddingBottom:
      keyboard.height.value > 0
        ? coveredBottom(keyboard.height.value, toolbar)
        : bottom,
  }));
};

// 숏츠 메모 시트 본문 칸의 아래 여백 — 시트가 키보드에 맞춰 줄어든 뒤에도 아래끝이 키보드 윗변보다 24 아래라
// (시트는 아래 안전영역을 빼고 줄인다) 커서 줄이 툴바 뒤에 숨었다. 키보드와 툴바가 덮는 만큼 비운다
export const useNoteSheetEditorInset = (
  gap: SharedValue<number>,
  titleFocused: boolean,
) => {
  const keyboard = useAnimatedKeyboard();
  const toolbar = titleFocused ? 0 : NOTE_TOOLBAR_HEIGHT;
  return useAnimatedStyle(() => {
    const height = keyboard.height.value;
    return {
      marginBottom:
        height > 0
          ? Math.max(0, coveredBottom(height, toolbar) - gap.value)
          : 0,
    };
  });
};

const styles = StyleSheet.create({
  anchor: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 0,
  },
  dock: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
  },
  hidden: {
    opacity: 0,
  },
});
