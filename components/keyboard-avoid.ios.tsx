import React, { useEffect, useState } from "react";
// component
import {
  KeyboardAvoidingView,
  KeyboardAvoidingViewProps,
  NativeModules,
} from "react-native";

const { StatusBarManager } = NativeModules;

// iOS는 키보드가 떠도 창이 줄지 않는다 — 키보드 높이만큼 아래를 padding으로 비운다.
// KeyboardAvoidingView는 자기 위치를 부모 기준으로 재서 키보드(창 기준)와 비교한다 — 시트는 창 위끝에서
// 내려와 있어 그만큼(상태바 높이로 근사, StatusBarManager는 iOS 네이티브 모듈) 오프셋을 준다.
// 전체 화면(계획 추가·수정)에 이 오프셋을 주면 키보드 위로 62가 더 비어 그 띠에서 폼이 잘렸다
export const KeyBoardAvoid = ({
  children,
  sheet = false,
  ...props
}: KeyboardAvoidingViewProps & { sheet?: boolean }) => {
  const [statusBarHeight, setStatusBarHeight] = useState(0);
  useEffect(() => {
    StatusBarManager?.getHeight((frame: { height: number }) => {
      setStatusBarHeight(frame.height);
    });
  }, []);

  return (
    <KeyboardAvoidingView
      keyboardVerticalOffset={sheet ? statusBarHeight : 0}
      behavior="padding"
      {...props}
    >
      {children}
    </KeyboardAvoidingView>
  );
};
