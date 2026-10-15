import type React from "react";
import { StyleProp, TextStyle } from "react-native";

// 안드로이드 글자 배치 보정값 — iOS가 기준이라 iOS는 전부 0 (text-metrics.android.ts 참고)
export const EMOJI_LINE_TOP = {
  formTitle: 0,
  planDate: 0,
  calcRow: 0,
  dateTitle: 0,
  searchHint: 0,
};

export const MULTILINE_INPUT_TOP = 0;

export const FLAG_EMOJI_BOX = {};

// iOS는 아이콘 글꼴 줄 높이가 기준이다 (text-metrics.android.ts 참고)
export const iconLine = (
  _size: number,
  _ratio?: number,
): TextStyle | undefined => undefined;

// iOS는 sb 글꼴 줄 높이를 그대로 쓴다 (text-metrics.android.ts 참고)
export const sbLineHeight = (
  _style: StyleProp<TextStyle>,
  _children?: React.ReactNode,
  _allowFontScaling?: boolean,
  _lines?: number,
): TextStyle | undefined => undefined;
