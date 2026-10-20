import React, { RefObject } from "react";
// component
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import type {
  EnrichedTextInputInstance,
  OnChangeStateEvent,
} from "react-native-enriched";
import { BarBackground } from "@/components/bar-background";
// hooks
import useCurrentThemeColor from "@/hooks/use-current-theme-color";
import { useT } from "@/hooks/use-t";
// lib
import { TKey } from "@/lib/i18n";
// icon
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

// iOS 키보드 위 보조 막대(inputAccessoryView) 높이
export const NOTE_TOOLBAR_HEIGHT = 44;
// iOS 메모 서식 버튼처럼 켜지면 둥근 사각형 바탕이 깔린다
const BUTTON_WIDTH = 36;
const BUTTON_HEIGHT = 32;
const ICON = 22;

type Tool = {
  state: keyof OnChangeStateEvent;
  icon: React.ComponentProps<typeof MaterialCommunityIcons>["name"];
  label: TKey;
  toggle: (editor: EnrichedTextInputInstance) => void;
};

// 툴바 = 우리가 지원하는 서식 전부. 여기 없는 서식은 읽기 화면(rich-note.tsx)이 글자만 그린다
const TOOLS: Tool[] = [
  {
    state: "bold",
    icon: "format-bold",
    label: "note.bold",
    toggle: (e) => e.toggleBold(),
  },
  {
    state: "underline",
    icon: "format-underline",
    label: "note.underline",
    toggle: (e) => e.toggleUnderline(),
  },
  {
    state: "strikeThrough",
    icon: "format-strikethrough-variant",
    label: "note.strike",
    toggle: (e) => e.toggleStrikeThrough(),
  },
  {
    state: "h1",
    icon: "format-header-1",
    label: "note.heading1",
    toggle: (e) => e.toggleH1(),
  },
  {
    state: "h2",
    icon: "format-header-2",
    label: "note.heading2",
    toggle: (e) => e.toggleH2(),
  },
  {
    state: "unorderedList",
    icon: "format-list-bulleted",
    label: "note.bulletList",
    toggle: (e) => e.toggleUnorderedList(),
  },
  {
    state: "orderedList",
    icon: "format-list-numbered",
    label: "note.numberList",
    toggle: (e) => e.toggleOrderedList(),
  },
  {
    state: "checkboxList",
    icon: "format-list-checkbox",
    label: "note.checkList",
    toggle: (e) => e.toggleCheckboxList(false),
  },
  {
    state: "blockQuote",
    icon: "format-quote-close",
    label: "note.quote",
    toggle: (e) => e.toggleBlockQuote(),
  },
];

interface NoteFormatToolbarProps {
  editorRef: RefObject<EnrichedTextInputInstance | null>;
  state: OnChangeStateEvent | null;
  onHideKeyboard: () => void;
}

export const NoteFormatToolbar = ({
  editorRef,
  state,
  onHideKeyboard,
}: NoteFormatToolbarProps) => {
  const themeColor = useCurrentThemeColor();
  const t = useT();

  return (
    <BarBackground bar="tab" style={styles.bar}>
      {/* 키보드가 떠 있는 채로 눌려야 한다 — 기본값이면 첫 탭이 키보드를 내리는 데 쓰인다 */}
      <ScrollView
        horizontal
        keyboardShouldPersistTaps="always"
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tools}
      >
        {TOOLS.map((tool) => {
          const active = !!state?.[tool.state].isActive;
          // 다른 서식과 같이 못 쓰는 경우(제목 안의 목록 등) — 눌러도 라이브러리가 무시한다
          const blocked = !!state?.[tool.state].isBlocking;
          return (
            <Pressable
              key={tool.state}
              accessibilityRole="button"
              accessibilityLabel={t(tool.label)}
              accessibilityState={{ selected: active, disabled: blocked }}
              disabled={blocked}
              hitSlop={4}
              onPress={() =>
                editorRef.current && tool.toggle(editorRef.current)
              }
              style={({ pressed }) => [
                styles.button,
                (active || pressed) && { backgroundColor: themeColor.fill },
              ]}
            >
              <MaterialCommunityIcons
                name={tool.icon}
                size={ICON}
                color={blocked ? themeColor.disabled : themeColor.text}
              />
            </Pressable>
          );
        })}
      </ScrollView>
      <View style={[styles.divider, { backgroundColor: themeColor.divider }]} />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t("note.hideKeyboard")}
        hitSlop={4}
        onPress={onHideKeyboard}
        style={({ pressed }) => [
          styles.button,
          styles.hide,
          pressed && { backgroundColor: themeColor.fill },
        ]}
      >
        <MaterialCommunityIcons
          name="keyboard-close"
          size={ICON}
          color={themeColor.text}
        />
      </Pressable>
    </BarBackground>
  );
};

const styles = StyleSheet.create({
  bar: {
    height: NOTE_TOOLBAR_HEIGHT,
    flexDirection: "row",
    alignItems: "center",
  },
  tools: {
    alignItems: "center",
    gap: 2,
    paddingHorizontal: 8,
  },
  button: {
    width: BUTTON_WIDTH,
    height: BUTTON_HEIGHT,
    borderRadius: 8,
    borderCurve: "continuous",
    alignItems: "center",
    justifyContent: "center",
  },
  divider: {
    width: StyleSheet.hairlineWidth,
    height: 20,
  },
  hide: {
    marginHorizontal: 8,
  },
});
