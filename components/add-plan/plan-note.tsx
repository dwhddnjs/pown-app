import React, { useRef } from "react";
// component
import { StyleSheet, TextInput } from "react-native";
import { Text, View } from "../themed";
import { IconTitle } from "../icon-title";
import { RichNoteText } from "../rich-note";
import { iconLine } from "@/constants/text-metrics";
// icon
import NoteIcon from "@expo/vector-icons/MaterialCommunityIcons";
import { Link } from "expo-router";
// zustand
import { usePlanStore } from "@/hooks/use-plan-store";
// hook
import useCurrentThemeColor from "@/hooks/use-current-theme-color";
import { useT } from "@/hooks/use-t";
// lib
import { isRichNote } from "@/lib/rich-note";

interface PlanNoteProps {
  // 칸의 pageY와 나눌 값을 넘기면 폼이 스크롤 양을 정한다 (plan-form.tsx)
  onFocusScroll: (pageY: number, divisor: number) => void;
}

export const PlanNote = ({ onFocusScroll }: PlanNoteProps) => {
  const { title, content, setPlanValue } = usePlanStore();
  const themeColor = useCurrentThemeColor();
  const t = useT();
  const inputRef = useRef<TextInput>(null);

  return (
    <View style={styles.main}>
      <View style={styles.container}>
        <IconTitle style={{ gap: 7, paddingLeft: 20, paddingBottom: 10 }}>
          <NoteIcon
            name="note-text"
            size={20}
            color={themeColor.tintText}
            style={iconLine(20)}
          />
          <Text style={{ fontSize: 16 }}>{t("plan.quickNote")}</Text>
        </IconTitle>
        <Link
          href="/(modals)/note"
          style={[styles.link, { color: themeColor.tintText }]}
        >
          {t("plan.openFullNote")}
        </Link>
      </View>

      {/* 전체 노트로 쓴 글(제목이 있거나 서식 HTML)은 미리보기, 아니면 퀵 노트 입력칸 */}
      {title || isRichNote(content) ? (
        <View style={{ paddingHorizontal: 20, gap: 4 }}>
          {!!title && <Text style={{ fontSize: 18 }}>{title}</Text>}
          {!!content && <RichNoteText html={content} size={14} />}
        </View>
      ) : (
        <TextInput
          ref={inputRef}
          autoCorrect={false}
          spellCheck={false}
          onFocus={() => {
            inputRef.current?.measure((x, y, w, h, px, py) => {
              onFocusScroll(py, 2);
            });
          }}
          style={[
            styles.input,
            {
              borderColor: themeColor.tint,
              color: themeColor.text,
            },
          ]}
          placeholder={t("plan.notePlaceholder")}
          placeholderTextColor={themeColor.subText}
          cursorColor={themeColor.cursor}
          selectionHandleColor={themeColor.cursor}
          value={content}
          onChangeText={(value) => setPlanValue("content", value)}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  main: {
    paddingVertical: 16,
  },
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    paddingRight: 20,
  },
  link: {
    fontSize: 14,
    fontFamily: "sb-l",
    paddingBottom: 10,
    paddingLeft: 12,
  },

  input: {
    borderWidth: 2,
    borderRadius: 12,
    borderCurve: "continuous",
    overflow: "hidden",
    paddingVertical: 14,
    paddingLeft: 12,
    // 안드로이드 TextInput 기본 오른쪽 여백을 없앤다 — iOS는 0이다
    paddingRight: 0,
    fontSize: 14,
    fontFamily: "sb-l",
    marginHorizontal: 20,
  },
});
