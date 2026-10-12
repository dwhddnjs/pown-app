import React from "react";
// expo
import { StatusBar } from "expo-status-bar";

// 아래에서 올라오는 시트 모달 위에서는 상태바가 어두운 뒤 화면 위에 놓인다 — 밝은 글자로
export const ModalStatusBar = () => <StatusBar style="light" />;
