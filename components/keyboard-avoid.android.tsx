import React, { useEffect, useState } from "react";
// component
import {
  Keyboard,
  KeyboardAvoidingView,
  KeyboardAvoidingViewProps,
} from "react-native";

// iOS 쌍과 이름을 맞춘다 — 안드로이드는 키보드가 다 뜬 뒤(keyboardDidShow) 아래를 비워 뜰 때는 잘리는
// 자리가 키보드 뒤다. 내려갈 때 빈 띠가 보이는지는 에뮬레이터로 확인 전이라 그대로 둔다
export const keyboardScrollStyle = {};

// 엣지 투 엣지(app.json edgeToEdgeEnabled)에서는 키보드가 떠도 창이 줄지 않는다 —
// iOS처럼 키보드 높이만큼 아래를 padding으로 비운다.
// 키보드가 내려갈 때 RN이 넘기는 위치(screenY)는 상태바·내비 바를 뺀 창 높이라 엣지 투 엣지
// 좌표와 그만큼(72) 어긋나서, KeyboardAvoidingView가 키보드가 없는데도 아래를 비워 둔 채로
// 남았다(계획 폼 끝 여백이 72 길어짐). 키보드가 없을 땐 꺼서 padding을 0으로 둔다
export const KeyBoardAvoid = ({
  children,
  // iOS 쌍과 시그니처를 맞춘다 — 안드로이드는 오프셋을 주지 않는다
  sheet: _sheet,
  ...props
}: KeyboardAvoidingViewProps & { sheet?: boolean }) => {
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(
    Keyboard.isVisible(),
  );

  useEffect(() => {
    const show = Keyboard.addListener("keyboardDidShow", () =>
      setIsKeyboardVisible(true),
    );
    const hide = Keyboard.addListener("keyboardDidHide", () =>
      setIsKeyboardVisible(false),
    );
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  return (
    <KeyboardAvoidingView
      behavior="padding"
      enabled={isKeyboardVisible}
      {...props}
    >
      {children}
    </KeyboardAvoidingView>
  );
};
