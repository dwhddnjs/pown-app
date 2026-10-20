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

// 리치 노트 글머리 목록의 marginLeft (react-native-enriched htmlStyle.ul) — iOS는 점을 marginLeft 왼쪽에 그리고
// 글자를 marginLeft+gap에서 시작한다. 점 왼쪽 끝(left)을 넘기면 그 자리에 점이 오게 바꾼다 (text-metrics.android.ts 참고)
export const enrichedUlMarginLeft = (left: number, bulletSize: number) =>
  left + bulletSize;

// 리치 노트 번호 목록의 marginLeft (react-native-enriched htmlStyle.ol) — iOS는 번호를 marginLeft에 가운데 맞춘다
export const enrichedOlMarginLeft = (center: number, _fontSize: number) =>
  center;
