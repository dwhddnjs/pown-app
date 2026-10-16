import React, { useEffect, useState } from "react";
// component
import {
  Keyboard,
  KeyboardAvoidingView,
  KeyboardAvoidingViewProps,
} from "react-native";

// 엣지 투 엣지(app.json edgeToEdgeEnabled)에서는 키보드가 떠도 창이 줄지 않는다 —
// iOS처럼 키보드 높이만큼 아래를 padding으로 비운다.
// 키보드가 내려갈 때 RN이 넘기는 위치(screenY)는 상태바·내비 바를 뺀 창 높이라 엣지 투 엣지
// 좌표와 그만큼(72) 어긋나서, KeyboardAvoidingView가 키보드가 없는데도 아래를 비워 둔 채로
// 남았다(계획 폼 끝 여백이 72 길어짐). 키보드가 없을 땐 꺼서 padding을 0으로 둔다
export const KeyBoardAvoid = ({
  children,
  ...props
}: KeyboardAvoidingViewProps) => {
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
