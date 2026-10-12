import React from "react";
// component
import { KeyboardAvoidingView, KeyboardAvoidingViewProps } from "react-native";

// 엣지 투 엣지(app.json edgeToEdgeEnabled)에서는 키보드가 떠도 창이 줄지 않는다 —
// iOS처럼 키보드 높이만큼 아래를 padding으로 비운다
export const KeyBoardAvoid = ({
  children,
  ...props
}: KeyboardAvoidingViewProps) => (
  <KeyboardAvoidingView behavior="padding" {...props}>
    {children}
  </KeyboardAvoidingView>
);
