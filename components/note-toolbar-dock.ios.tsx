import React, { useEffect } from "react";
// component
import { InputAccessoryView, Keyboard } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { NOTE_TOOLBAR_HEIGHT } from "@/components/note-format-toolbar";

// 에디터(react-native-enriched) 텍스트뷰가 이 이름으로 응답한다 (scripts/patch-enriched.js)
const ENRICHED_ACCESSORY_ID = "enriched-text-input";

// iOS 키보드가 실제로 오르내리는 곡선 — 시뮬레이터 녹화 프레임으로 맞춘 임계 감쇠 스프링(ω 23.5)
const KEYBOARD_SPRING = {
  mass: 1,
  stiffness: 552,
  damping: 47,
  overshootClamping: true,
};

interface NoteToolbarDockProps {
  children: React.ReactNode;
  // 제목 칸에 포커스가 있다 — iOS는 보조 막대가 본문에만 붙어 따로 숨길 게 없다
  titleFocused: boolean;
  // 안드로이드 쌍이 재는 독 자리 — iOS는 보조 막대라 잴 게 없다
  gap?: SharedValue<number>;
}

// 서식 툴바를 키보드 보조 막대(inputAccessoryView)로 붙인다 — 키보드와 한 몸으로 오르내린다.
// JS로 키보드 높이를 따라가면 이벤트가 닿는 때가 들쭉날쭉해 툴바가 늦게 깜빡 붙거나 내려갈 때 떠 있었다
export const NoteToolbarDock = ({ children }: NoteToolbarDockProps) => (
  <InputAccessoryView nativeID={ENRICHED_ACCESSORY_ID}>
    {children}
  </InputAccessoryView>
);

// 키보드(보조 막대 포함) 높이와, 그 안에서 툴바 위에 비어 있는 칸.
// RN InputAccessoryView는 화면 아래에 있을 때 잡은 홈 인디케이터 안전영역만큼 높이를 더 가지고 키보드 위에 붙어서, 툴바 위에
// 투명한 칸(34)이 생긴다 — 키보드 높이만큼 비운 본문 아래에 빈 박스가 보였다(시뮬레이터 실측: 키보드 위끝 495, 툴바 위끝 529).
// 보조 막대만 바닥에 있을 땐(하드웨어 키보드) 그 칸이 홈 인디케이터 자리라 빼지 않는다
// ponytail: 칸 높이를 안전영역으로 본다 — 툴바 자리를 잴 수 없다(보조 막대 안 measureInWindow는 0). 어긋나는 기기가 나오면 재서 바꿀 것
const useKeyboardHeight = () => {
  const bottom = useSafeAreaInsets().bottom;
  const keyboard = useSharedValue(0);
  const accessoryGap = useSharedValue(0);
  useEffect(() => {
    const show = Keyboard.addListener("keyboardWillShow", (e) => {
      const height = e.endCoordinates.height;
      accessoryGap.value = height > NOTE_TOOLBAR_HEIGHT + bottom ? bottom : 0;
      keyboard.value = withSpring(height, KEYBOARD_SPRING);
    });
    const hide = Keyboard.addListener("keyboardWillHide", () => {
      keyboard.value = withSpring(0, KEYBOARD_SPRING);
    });
    return () => {
      show.remove();
      hide.remove();
    };
  }, [keyboard, accessoryGap, bottom]);
  return { bottom, keyboard, accessoryGap };
};

// 본문이 키보드(보조 막대 포함)에 가리지 않게 아래를 비운다. 키보드가 없으면 홈 인디케이터만큼.
// 본문 바탕은 화면과 같은 색이라 비우는 동작이 몇 ms 늦어도 보이지 않는다
export const useNoteEditorInset = (titleFocused: boolean) => {
  const { bottom, keyboard, accessoryGap } = useKeyboardHeight();
  // 제목 칸 키보드엔 보조 막대가 없다
  const withToolbar = !titleFocused;
  return useAnimatedStyle(() => ({
    paddingBottom: Math.max(
      keyboard.value - (withToolbar ? accessoryGap.value : 0),
      bottom,
    ),
  }));
};

// 숏츠 메모 시트 본문 칸의 아래 여백 — 시트가 키보드(보조 막대 포함) 높이만큼 내용 영역을 줄이는데, 그 키보드 높이에
// 툴바 위 투명한 칸이 들어 있어 본문을 그만큼 아래로 늘린다
export const useNoteSheetEditorInset = (
  _gap: SharedValue<number>,
  titleFocused: boolean,
) => {
  const { keyboard, accessoryGap } = useKeyboardHeight();
  const withToolbar = !titleFocused;
  return useAnimatedStyle(() => ({
    marginBottom: keyboard.value > 0 && withToolbar ? -accessoryGap.value : 0,
  }));
};
