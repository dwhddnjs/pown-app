import React, { useEffect } from "react";
// component
import { InputAccessoryView, Keyboard } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

// 에디터(react-native-enriched) 텍스트뷰가 이 이름으로 응답한다 (scripts/patch-enriched.js)
const ENRICHED_ACCESSORY_ID = "enriched-text-input";

// iOS 키보드가 실제로 오르내리는 곡선 — 시뮬레이터 녹화 프레임으로 맞춘 임계 감쇠 스프링(ω 23.5)
const KEYBOARD_SPRING = {
  mass: 1,
  stiffness: 552,
  damping: 47,
  overshootClamping: true,
};

// 키보드 높이 밖에 툴바가 더 차지하는 높이 — iOS는 보조 막대가 키보드 높이에 들어 있어 0이다
// (키보드 높이를 따로 받는 숏츠 메모 시트가 쓴다)
export const NOTE_DOCK_EXTRA_INSET = 0;

interface NoteToolbarDockProps {
  children: React.ReactNode;
  // 제목 칸에 포커스가 있다 — iOS는 보조 막대가 본문에만 붙어 따로 숨길 게 없다
  titleFocused: boolean;
}

// 서식 툴바를 키보드 보조 막대(inputAccessoryView)로 붙인다 — 키보드와 한 몸으로 오르내린다.
// JS로 키보드 높이를 따라가면 이벤트가 닿는 때가 들쭉날쭉해 툴바가 늦게 깜빡 붙거나 내려갈 때 떠 있었다
export const NoteToolbarDock = ({ children }: NoteToolbarDockProps) => (
  <InputAccessoryView nativeID={ENRICHED_ACCESSORY_ID}>
    {children}
  </InputAccessoryView>
);

// 본문이 키보드(보조 막대 포함)에 가리지 않게 아래를 비운다. 키보드가 없으면 홈 인디케이터만큼.
// 본문 바탕은 화면과 같은 색이라 비우는 동작이 몇 ms 늦어도 보이지 않는다
export const useNoteEditorInset = (_titleFocused: boolean) => {
  const bottom = useSafeAreaInsets().bottom;
  const keyboard = useSharedValue(0);
  useEffect(() => {
    const show = Keyboard.addListener("keyboardWillShow", (e) => {
      keyboard.value = withSpring(e.endCoordinates.height, KEYBOARD_SPRING);
    });
    const hide = Keyboard.addListener("keyboardWillHide", () => {
      keyboard.value = withSpring(0, KEYBOARD_SPRING);
    });
    return () => {
      show.remove();
      hide.remove();
    };
  }, [keyboard]);
  return useAnimatedStyle(() => ({
    paddingBottom: Math.max(keyboard.value, bottom),
  }));
};
