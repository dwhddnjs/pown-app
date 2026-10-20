import React from "react";
// component
import { StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  useAnimatedKeyboard,
  useAnimatedStyle,
} from "react-native-reanimated";
import { NOTE_TOOLBAR_HEIGHT } from "@/components/note-format-toolbar";

// 키보드 높이 밖에 툴바가 더 차지하는 높이 — 안드로이드는 툴바를 키보드 위에 따로 얹는다
// (키보드 높이를 따로 받는 숏츠 메모 시트가 쓴다)
export const NOTE_DOCK_EXTRA_INSET = NOTE_TOOLBAR_HEIGHT;

interface NoteToolbarDockProps {
  children: React.ReactNode;
  // 제목 칸에 포커스가 있다 — 툴바는 본문용이라 숨긴다
  titleFocused: boolean;
}

// 안드로이드엔 키보드 보조 막대가 없다 — 키보드 윗변에 붙여 reanimated가 프레임마다 받는 키보드 높이
// (WindowInsets 애니메이션)로 같이 오르내린다. 키보드가 내려가 있으면 화면 아래로 빠진다.
// 시트는 화면 아래끝에 붙어 있어 키보드 높이를 그대로 쓴다 (iOS 쌍은 키보드 보조 막대)
export const NoteToolbarDock = ({
  children,
  titleFocused,
}: NoteToolbarDockProps) => {
  const keyboard = useAnimatedKeyboard();
  const position = useAnimatedStyle(() => {
    const height = keyboard.height.value;
    // 키보드가 툴바 높이만큼 올라오는 동안 화면 아래(숨김)에서 키보드 윗변까지 따라붙는다
    const hidden = Math.max(0, 1 - height / NOTE_TOOLBAR_HEIGHT);
    return {
      transform: [{ translateY: -height + NOTE_TOOLBAR_HEIGHT * hidden }],
    };
  });
  return (
    <Animated.View
      pointerEvents={titleFocused ? "none" : "auto"}
      style={[styles.dock, titleFocused && styles.hidden, position]}
    >
      {children}
    </Animated.View>
  );
};

// 본문이 키보드와 툴바에 가리지 않게 아래를 비운다. 키보드가 없으면 내비게이션 바만큼
export const useNoteEditorInset = (titleFocused: boolean) => {
  const bottom = useSafeAreaInsets().bottom;
  const keyboard = useAnimatedKeyboard();
  const toolbar = titleFocused ? 0 : NOTE_TOOLBAR_HEIGHT;
  return useAnimatedStyle(() => ({
    paddingBottom:
      keyboard.height.value > 0 ? keyboard.height.value + toolbar : bottom,
  }));
};

const styles = StyleSheet.create({
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
