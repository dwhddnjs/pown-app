import React, { RefObject, useLayoutEffect, useMemo, useRef } from "react";
// component
import { StyleSheet, Text as RNText, TextStyle, View } from "react-native";
import Svg, { Path, Rect } from "react-native-svg";
import {
  EnrichedTextInput,
  EnrichedTextInputInstance,
  HtmlStyle,
  OnChangeStateEvent,
} from "react-native-enriched";
import { Text } from "@/components/themed";
import {
  enrichedOlMarginLeft,
  enrichedUlMarginLeft,
} from "@/constants/text-metrics";
// hooks
import useCurrentThemeColor from "@/hooks/use-current-theme-color";
import { useT } from "@/hooks/use-t";
// lib
import { isRichNote, parseRichNote, RichNoteBlock } from "@/lib/rich-note";

// 전체 노트 모달 본문(16) 기준 치수. 에디터(htmlStyle)와 읽기 화면(RichNoteText)이 같이 쓴다 —
// 계획 폼 미리보기(14)·목록 카드(12)는 size/16배로 줄여 그려 모달에서 쓴 모양 그대로 보인다.
// 제목은 미리보기·카드의 노트 제목(18/16)보다 커지지 않는 비율로 둔다
const BASE = 16;
const M = {
  h1: 20,
  h2: 18,
  // 목록 글자는 셋 다 22에서 시작한다
  // 글머리: 점 왼쪽 끝·점 지름·점과 글자 사이
  ulLeft: 5,
  bullet: 6,
  ulGap: 11,
  // 번호: 번호 가운데·번호 가운데와 글자 사이 (enriched는 두 플랫폼 다 번호를 marginLeft에 가운데 맞춘다)
  olCenter: 10,
  olGap: 12,
  // 체크박스: 왼쪽 끝·한 변·글자 사이
  boxLeft: 0,
  box: 16,
  boxGap: 6,
  // 인용: 막대 폭·막대와 글자 사이
  quoteBar: 3,
  quoteGap: 12,
};
// 번호 마커를 가운데 정렬할 칸 — 어떤 번호보다도 넓게
const OL_MARKER_BOX = 60;
// sb 글꼴 자연 줄 높이 비율 (text-metrics의 SB_LINE)
const NATURAL_LINE = { "sb-l": 1.2, "sb-m": 1.199 } as const;
// 줄 높이 = 자연 줄 높이 × 1.25 (본문 글자 1.5배) — 에디터도 같은 배율로 줄 간격을 준다
// (scripts/patch-enriched.js line-height). 마커는 이 줄 높이의 가운데에 앉는다
const LINE_SPACING = 1.25;
// 굵게·제목의 면 — iOS 에디터(scripts/patch-enriched.js)·안드로이드(plugins/with-sb-font-family.js)와 같다
export const RICH_NOTE_BOLD = "sb-m";

// 에디터 htmlStyle — 바뀔 때마다 네이티브가 스타일을 다시 입히므로 테마가 바뀔 때만 새로 만든다
export const useRichNoteHtmlStyle = (): HtmlStyle => {
  const themeColor = useCurrentThemeColor();
  return useMemo(
    () => ({
      h1: { fontSize: M.h1, bold: true },
      h2: { fontSize: M.h2, bold: true },
      // 툴바에 없는 제목이지만 iOS는 글자 크기로 제목을 알아본다 — 본문(16)과 같은 크기가 있으면
      // 본문 전체가 그 제목으로 저장된다(라이브러리 known limitation). 겹치지 않게 비켜 둔다
      h3: { fontSize: 21 },
      h4: { fontSize: 22 },
      h5: { fontSize: 23 },
      h6: { fontSize: 24 },
      blockquote: {
        borderColor: themeColor.tint,
        borderWidth: M.quoteBar,
        gapWidth: M.quoteGap,
        color: themeColor.subText,
      },
      ul: {
        bulletColor: themeColor.tint,
        bulletSize: M.bullet,
        marginLeft: enrichedUlMarginLeft(M.ulLeft, M.bullet),
        gapWidth: M.ulGap,
      },
      ol: {
        markerColor: themeColor.tint,
        marginLeft: enrichedOlMarginLeft(M.olCenter, BASE),
        gapWidth: M.olGap,
      },
      ulCheckbox: {
        boxColor: themeColor.tint,
        boxSize: M.box,
        marginLeft: M.boxLeft,
        gapWidth: M.boxGap,
      },
    }),
    [themeColor],
  );
};

const NO_MENTION: string[] = [];

interface RichNoteEditorProps {
  editorRef: RefObject<EnrichedTextInputInstance | null>;
  // 처음 값 — 에디터는 uncontrolled라 이후 값은 에디터가 들고 있다. 평문(퀵 노트·예전 메모)이면 평문으로 읽는다
  defaultValue: string;
  onFocus?: () => void;
  onBlur?: () => void;
  onChangeState: (state: OnChangeStateEvent) => void;
  // 입력할 때마다 HTML이 필요할 때만 준다(숏츠 메모 — 닫히며 자동 저장). 매번 HTML로 바꾸는 비용이 있다
  onChangeHtml?: (html: string) => void;
}

// 전체 노트·숏츠 메모의 본문 에디터 — 예전 본문 TextInput과 같은 글자·여백
export const RichNoteEditor = ({
  editorRef,
  defaultValue,
  onFocus,
  onBlur,
  onChangeState,
  onChangeHtml,
}: RichNoteEditorProps) => {
  const themeColor = useCurrentThemeColor();
  const t = useT();
  const htmlStyle = useRichNoteHtmlStyle();
  // 포커스된 채 화면이 닫히면 안드로이드가 남은 화면의 첫 입력칸(계획 폼 목표 중량)에 포커스를 넘겨
  // 숫자 키패드가 떴다 — RN TextInput처럼 사라지기 전에 스스로 포커스를 놓는다
  const isFocused = useRef(false);
  useLayoutEffect(
    () => () => {
      if (isFocused.current) editorRef.current?.blur();
    },
    [editorRef],
  );
  return (
    <EnrichedTextInput
      ref={editorRef}
      defaultValue={defaultValue}
      placeholder={t("plan.contentPlaceholder")}
      placeholderTextColor={themeColor.subText}
      cursorColor={themeColor.cursor}
      htmlStyle={htmlStyle}
      // '@'로 멘션이 시작되지 않게, 주소처럼 보이는 글자가 링크로 바뀌지 않게 끈다
      mentionIndicators={NO_MENTION}
      linkRegex={null}
      onFocus={() => {
        isFocused.current = true;
        onFocus?.();
      }}
      onBlur={() => {
        isFocused.current = false;
        onBlur?.();
      }}
      onChangeState={(e) => onChangeState(e.nativeEvent)}
      onChangeHtml={onChangeHtml && ((e) => onChangeHtml(e.nativeEvent.value))}
      style={{ ...styles.editor, color: themeColor.text }}
    />
  );
};

// iOS 에디터 체크박스 그림 그대로 (InputConfig generateCheckboxImage) — 테두리 0.1, 모서리 0.15, 흰 체크 0.15
const Checkbox = ({
  size,
  checked,
  color,
}: {
  size: number;
  checked: boolean;
  color: string;
}) => {
  const stroke = size * 0.1;
  const inner = size - stroke;
  const at = (x: number, y: number) =>
    `${stroke / 2 + inner * x},${stroke / 2 + inner * y}`;
  return (
    <Svg width={size} height={size}>
      <Rect
        x={stroke / 2}
        y={stroke / 2}
        width={inner}
        height={inner}
        rx={size * 0.15}
        fill={checked ? color : "none"}
        stroke={color}
        strokeWidth={stroke}
      />
      {checked && (
        <Path
          d={`M${at(0.25, 0.5)} L${at(0.45, 0.65)} L${at(0.75, 0.35)}`}
          stroke="#fff"
          strokeWidth={stroke * 1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      )}
    </Svg>
  );
};

interface RichNoteTextProps {
  // 평문(퀵 노트·예전 노트)이면 예전과 같은 한 덩어리 글로 그린다
  html: string;
  size: number;
}

export const RichNoteText = ({ html, size }: RichNoteTextProps) => {
  const themeColor = useCurrentThemeColor();
  const rich = isRichNote(html);
  const blocks = useMemo(() => (rich ? parseRichNote(html) : []), [rich, html]);

  if (!rich) {
    return <Text style={{ fontFamily: "sb-l", fontSize: size }}>{html}</Text>;
  }

  const k = size / BASE;
  const lineHeight = size * NATURAL_LINE["sb-l"] * LINE_SPACING;

  const renderBlock = (block: RichNoteBlock, i: number) => {
    const heading = block.kind === "h1" || block.kind === "h2";
    const fontSize = heading ? M[block.kind as "h1" | "h2"] * k : size;
    const textStyle: TextStyle = {
      fontFamily: heading ? RICH_NOTE_BOLD : "sb-l",
      fontSize,
      lineHeight: heading
        ? fontSize * NATURAL_LINE[RICH_NOTE_BOLD] * LINE_SPACING
        : lineHeight,
      color: block.quote ? themeColor.subText : themeColor.text,
    };
    const text = (
      <Text
        style={[
          textStyle,
          (block.kind === "ul" || block.kind === "check") && styles.fill,
        ]}
      >
        {block.runs.length === 0
          ? " "
          : block.runs.map((run, j) => (
              <RNText
                key={j}
                style={[
                  run.bold && { fontFamily: RICH_NOTE_BOLD },
                  (run.underline || run.strike) && {
                    textDecorationLine:
                      run.underline && run.strike
                        ? "underline line-through"
                        : run.underline
                          ? "underline"
                          : "line-through",
                  },
                ]}
              >
                {run.text}
              </RNText>
            ))}
      </Text>
    );

    let content = text;
    if (block.kind === "ul" || block.kind === "check") {
      const ul = block.kind === "ul";
      const markerSize = (ul ? M.bullet : M.box) * k;
      content = (
        <View style={styles.row}>
          <View
            style={{
              height: lineHeight,
              justifyContent: "center",
              marginLeft: (ul ? M.ulLeft : M.boxLeft) * k,
              marginRight: (ul ? M.ulGap : M.boxGap) * k,
            }}
          >
            {ul ? (
              <View
                style={{
                  width: markerSize,
                  height: markerSize,
                  borderRadius: markerSize / 2,
                  backgroundColor: themeColor.tint,
                }}
              />
            ) : (
              <Checkbox
                size={markerSize}
                checked={block.checked}
                color={themeColor.tint}
              />
            )}
          </View>
          {text}
        </View>
      );
    } else if (block.kind === "ol") {
      content = (
        <View style={{ paddingLeft: (M.olCenter + M.olGap) * k }}>
          {/* 번호는 가운데를 맞춘다 — 넓은 칸에 가운데 정렬해 10. 처럼 길어도 줄이 꺾이지 않는다 */}
          <View
            style={[
              styles.olMarker,
              { left: M.olCenter * k - OL_MARKER_BOX / 2 },
            ]}
          >
            <Text
              numberOfLines={1}
              style={[textStyle, { color: themeColor.tint }]}
            >
              {`${block.index}.`}
            </Text>
          </View>
          {text}
        </View>
      );
    }

    return block.quote ? (
      <View
        key={i}
        style={{
          borderLeftWidth: M.quoteBar * k,
          borderLeftColor: themeColor.tint,
          paddingLeft: M.quoteGap * k,
        }}
      >
        {content}
      </View>
    ) : (
      <React.Fragment key={i}>{content}</React.Fragment>
    );
  };

  return <View>{blocks.map(renderBlock)}</View>;
};

const styles = StyleSheet.create({
  editor: {
    flex: 1,
    paddingLeft: 2,
    paddingRight: 0,
    fontSize: 16,
    // 두 플랫폼 줄 지표가 같아 첫 줄 보정(MULTILINE_INPUT_TOP)이 필요 없다 (scripts/patch-enriched.js line-height)
    paddingTop: 14,
    paddingBottom: 14,
    fontFamily: "sb-l",
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  fill: {
    flex: 1,
  },
  olMarker: {
    position: "absolute",
    top: 0,
    width: OL_MARKER_BOX,
    alignItems: "center",
  },
});
