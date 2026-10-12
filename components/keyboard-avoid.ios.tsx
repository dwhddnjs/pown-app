import React, { useEffect, useState } from "react";
// component
import {
  KeyboardAvoidingView,
  KeyboardAvoidingViewProps,
  NativeModules,
} from "react-native";

const { StatusBarManager } = NativeModules;

// iOS는 키보드가 떠도 창이 줄지 않는다 — 키보드 높이만큼 아래를 padding으로 비운다.
// 오프셋은 상태바 높이(StatusBarManager는 iOS 네이티브 모듈)
export const KeyBoardAvoid = ({
  children,
  ...props
}: KeyboardAvoidingViewProps) => {
  const [statusBarHeight, setStatusBarHeight] = useState(0);
  useEffect(() => {
    StatusBarManager?.getHeight((frame: { height: number }) => {
      setStatusBarHeight(frame.height);
    });
  }, []);

  return (
    <KeyboardAvoidingView
      keyboardVerticalOffset={statusBarHeight}
      behavior="padding"
      {...props}
    >
      {children}
    </KeyboardAvoidingView>
  );
};
