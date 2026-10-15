import type React from "react";
import { PixelRatio, StyleSheet, StyleProp, TextStyle } from "react-native";

// 안드로이드 글자 배치 보정값 — 같은 스타일이어도 iOS와 글자 자리가 달라지는 곳을 시뮬레이터에서
// 재서 맞춘다 (iOS는 전부 0, text-metrics.ios.ts)

// 글자와 한 줄에 섞인 컬러 이모지의 줄 보정.
// iOS는 이모지(Apple Color Emoji)가 줄 위쪽을 키워 같은 줄의 글자를 아래로 민다 — 안드로이드는
// 대체 글꼴이 줄 높이를 거의 안 바꿔서, 그 줄과 그 아래가 iOS보다 위로 붙는다.
// 늘어나는 양이 이모지 글리프마다 달라 쓰는 곳마다 시뮬레이터에서 잰 값을 쓴다
// (안드로이드 글자 박스 위에 이만큼 띄우면 박스 높이·글자 기준선이 iOS와 0.3 안으로 같아진다)
export const EMOJI_LINE_TOP = {
  // 🔥 24 — 계획 폼 제목 (iOS 박스 33.67, 안드로이드 31.62)
  formTitle: 1.8,
  // 📆 14 — 계획 날짜 버튼 (iOS 23.33, 안드로이드 18.67)
  planDate: 4.8,
  // 💪🏻 16 — 중량 계산기 행 (iOS 26.67, 안드로이드 21.33)
  calcRow: 5.4,
  // 📆 18 — 날짜 선택 다이얼로그 제목 (글자가 iOS보다 3.9 위)
  dateTitle: 3.9,
  // 🔍 16 — 검색 안내 문구(두 줄, lineHeight 24). 이모지 줄이 iOS에서 1.1 커져 첫 줄이 1.5,
  // 둘째 줄이 2.6 아래에 그려진다 — 한 Text라 줄마다 못 맞추니 둘 다 0.6 안에 들게 2를 준다
  searchHint: 2,
};

// 🇰🇷 18 — 언어 선택 행의 국기(이모지만 있는 글자). iOS는 글자 칸이 3.6 크고 국기가 그 아래쪽에
// 앉는다. 위를 띄워 칸을 키우고 아래를 그만큼 덜 차지하게 해서 행 높이·제목·국기 자리를 맞춘다
export const FLAG_EMOJI_BOX = { paddingTop: 6.1, marginBottom: -2.5 };

// 여러 줄 입력칸(메모)의 첫 줄 위 여백 — 안드로이드 여러 줄 EditText는 같은 paddingTop에서도
// 첫 줄이 iOS UITextView보다 5.3 아래에 놓인다 (한 줄 입력칸은 같다). 그만큼 위 여백을 덜 준다
export const MULTILINE_INPUT_TOP = -5.3;

// 아이콘 글꼴 한 글자의 박스를 iOS 줄 높이(글꼴 ascent+descent, MaterialCommunityIcons·AntDesign·
// FontAwesome·Ionicons는 크기 그대로, Octicons는 1.0156배)로 못박는다. 안드로이드는 기본 글꼴 여백(글리프
// 외곽 기준)에 ascent·descent 픽셀 올림까지 더해 20 아이콘이 20.57이 된다 — 아이콘이 행 높이를 정하는
// 줄(섹션 제목 등)마다 0.57씩 쌓여 계획 폼 끝에서 3dp 밀렸다. 박스를 줄여도 글리프는 위끝 기준이라 자리가 같다
export const iconLine = (size: number, ratio = 1): TextStyle => ({
  includeFontPadding: false,
  height: size * ratio,
});

// sb 글꼴의 자연 줄 높이 비율 — hhea ascent 800 + descent 399(sb-l 400), lineGap 0, UPM 1000.
// iOS는 이 값을 그대로 줄 높이로 쓴다
const SB_LINE: Record<string, number> = {
  "sb-b": 1.199,
  "sb-m": 1.199,
  "sb-l": 1.2,
};

// 안드로이드는 글꼴 ascent·descent를 각각 픽셀 정수로 올려 줄 높이를 잡는다 — 2.625배율에서 16 글자는
// 0.25, 24 글자는 0.55씩 iOS보다 길어져, 세트 행 하나에 0.75dp, 계획 폼 끝에서 4.5dp가 쌓였다.
// 안드로이드 줄 높이는 정수 픽셀이라 iOS 줄 높이(16.8 = 44.1px, lineHeight 20 = 52.5px)를 그대로 못 만든다
// → 줄마다 가장 가까운 픽셀로 명시하고, iOS 글자 상자 높이(⅓pt로 올림 — 14 글자 한 줄은 17.0)와의
// 차이를 marginBottom으로 메운다. 레이아웃이 위치를 실수로 계산하므로 다음 요소가 iOS와 같은 자리에서
// 시작해 픽셀 오차가 쌓이지 않는다 (픽셀만 맞추면 카드·행마다 ±0.2, 여러 줄 글은 줄마다 ±0.2씩 쌓였다).
// lines는 그 글의 줄 수 — 테마 Text가 lineHeight를 명시한 글(여러 줄 문단)만 onTextLayout으로 재서 넘긴다.
// (RN은 lineHeight를 ceil(px)로 쓰므로 0.01 덜 준다)
// 컬러 이모지가 섞인 글자는 빼둔다 — 그 줄은 이모지 글꼴이 줄 높이를 바꾸고, 위 EMOJI_LINE_TOP 등은
// 그 줄 그대로를 재서 맞춘 값이다(명시한 lineHeight는 이모지 글꼴을 무시한다)
const EMOJI = /[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}]/u;

export const sbLineHeight = (
  style: StyleProp<TextStyle>,
  children?: React.ReactNode,
  allowFontScaling = true,
  lines = 1,
): TextStyle | undefined => {
  const flat = StyleSheet.flatten(style);
  const { fontFamily, fontSize = 14, lineHeight } = flat;
  const ratio = fontFamily ? SB_LINE[fontFamily] : undefined;
  if (!ratio) return undefined;
  if (typeof children === "string" && EMOJI.test(children)) return undefined;
  const density = PixelRatio.get();
  const fontScale = allowFontScaling ? PixelRatio.getFontScale() : 1;
  const line = (lineHeight ?? fontSize * ratio) * fontScale;
  const px = Math.round(line * density);
  const ios = Math.ceil(line * lines * 3 - 1e-6) / 3;
  const margin = flat.marginBottom ?? flat.marginVertical ?? flat.margin;
  return {
    lineHeight: (px - 0.01) / (density * fontScale),
    marginBottom:
      (typeof margin === "number" ? margin : 0) + ios - (lines * px) / density,
  };
};
