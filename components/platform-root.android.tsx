import React, { useEffect } from "react";
// component
import { Keyboard, TextInput } from "react-native";
import { useAnimatedKeyboard } from "react-native-reanimated";
// expo
import { StatusBar } from "expo-status-bar";

// 앱 루트에 한 번 붙는 안드로이드 전용 요소.
// 상태바 아이콘 색은 iOS와 달리 앱 안에서 고른 테마(Appearance.setColorScheme)를
// 저절로 따라가지 않는다 — auto로 걸어 둬야 다크 테마에서 아이콘이 묻히지 않는다.
// 플레이 스토어 업데이트 안내는 아직 없다 (iOS는 update-dialog.ios.tsx)
export const PlatformRoot = () => {
  // 뒤로가기로 키보드를 내리면 안드로이드는 입력칸 포커스(깜박이는 커서)를 남긴다 — iOS는 키보드가
  // 내려가면 포커스도 풀린다. 남겨 두면 그 칸을 다시 눌러도 onFocus가 안 불려 칸을 키보드 위로
  // 올리는 스크롤(목표 중량·퀵노트)이 안 돈다
  useEffect(() => {
    const hide = Keyboard.addListener("keyboardDidHide", () =>
      TextInput.State.currentlyFocusedInput()?.blur(),
    );
    return () => hide.remove();
  }, []);

  // reanimated는 useAnimatedKeyboard를 쓰는 화면이 하나도 없으면 키보드 감시를 멈추고 마지막 상태를 그대로 둔다 —
  // 전체 노트를 키보드 띄운 채 닫으면 키보드가 내려간 걸 못 봐서, 다음에 연 숏츠 메모가 "키보드 열림 336"을 받아
  // 서식 툴바가 키보드 없이 떠 있었다. 루트에서 늘 구독해 감시가 끊기지 않게 한다 (note-toolbar-dock.android)
  useAnimatedKeyboard();

  return <StatusBar style="auto" />;
};
