import React, { useEffect, useRef, useState } from "react";
import { useT } from "@/hooks/use-t";
// component
import { StyleSheet, TextInput } from "react-native";
import Animated from "react-native-reanimated";
import {
  EnrichedTextInputInstance,
  OnChangeStateEvent,
} from "react-native-enriched";
import { View } from "@/components/themed";
import { HeaderIconButton } from "@/components/header-icon-button";
import { RichNoteEditor } from "@/components/rich-note";
import { NoteFormatToolbar } from "@/components/note-format-toolbar";
import {
  NoteToolbarDock,
  useNoteEditorInset,
} from "@/components/note-toolbar-dock";
// zustand
import { useNoteStore } from "@/hooks/use-note-store";
import { usePlanStore } from "@/hooks/use-plan-store";
// hook
import useCurrentThemeColor from "@/hooks/use-current-theme-color";
// lib
import { normalizeRichNote } from "@/lib/rich-note";
import { toast } from "sonner-native";
// expo
import { Stack, useNavigation } from "expo-router";

export default function Note() {
  const t = useT();
  const { title, setValue, onReset } = useNoteStore();
  const { setPlanValue } = usePlanStore();
  const navigation = useNavigation();
  const themeColor = useCurrentThemeColor();
  const editorRef = useRef<EnrichedTextInputInstance>(null);
  // 본문 에디터는 uncontrolled — 처음 값(퀵 노트 평문이면 평문으로 읽는다)만 넘기고 저장할 때 꺼낸다
  const [initialContent] = useState(() => usePlanStore.getState().content);
  // 서식 툴바는 본문용이다 — 제목 칸을 쓰는 동안엔 안 보인다
  const [isTitleFocused, setIsTitleFocused] = useState(false);
  const [styleState, setStyleState] = useState<OnChangeStateEvent | null>(null);
  const isSaving = useRef(false);

  const onSaveNote = async () => {
    // HTML은 비동기로 받아온다 — 그사이 한 번 더 누르면 뒤 화면(계획 폼)까지 닫힌다
    if (isSaving.current) return;
    isSaving.current = true;
    try {
      const html = await editorRef.current?.getHTML();
      setPlanValue("title", title);
      if (html !== undefined) setPlanValue("content", normalizeRichNote(html));
      navigation.goBack();
    } catch {
      // 모달을 닫지 않는다 — 쓰던 글이 에디터에 그대로 남는다
      isSaving.current = false;
      toast.error(t("note.saveFailed"));
    }
  };

  // 수정 중이던 계획의 노트 제목을 프리필하고, 모달이 닫히면(저장/취소 모두) 임시 스토어를 비운다
  useEffect(() => {
    setValue("title", usePlanStore.getState().title);
    return () => {
      onReset();
    };
  }, []);

  // 본문이 키보드·툴바에 가리지 않게 아래를 비운다 (툴바 위치는 플랫폼마다 다르다 — note-toolbar-dock)
  const editorArea = useNoteEditorInset(isTitleFocused);

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerRight: () => (
            <HeaderIconButton
              type="save"
              onPress={onSaveNote}
              style={{ marginTop: 10 }}
            />
          ),
        }}
      />
      <View style={styles.form}>
        <TextInput
          value={title}
          autoCorrect={false}
          spellCheck={false}
          placeholder={t("plan.titlePlaceholder")}
          style={[
            styles.titleInput,
            {
              color: themeColor.text,
              borderBottomColor: themeColor.subText,
            },
          ]}
          placeholderTextColor={themeColor.subText}
          cursorColor={themeColor.cursor}
          selectionHandleColor={themeColor.cursor}
          onChangeText={(value) => setValue("title", value)}
          onFocus={() => setIsTitleFocused(true)}
          onBlur={() => setIsTitleFocused(false)}
        />
        <Animated.View style={[styles.editorArea, editorArea]}>
          <RichNoteEditor
            editorRef={editorRef}
            defaultValue={initialContent}
            onChangeState={setStyleState}
          />
        </Animated.View>
      </View>
      <NoteToolbarDock titleFocused={isTitleFocused}>
        <NoteFormatToolbar
          editorRef={editorRef}
          state={styleState}
          onHideKeyboard={() => editorRef.current?.blur()}
        />
      </NoteToolbarDock>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  form: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },

  titleInput: {
    fontSize: 24,
    borderBottomWidth: 1,
    fontFamily: "sb-m",
    paddingVertical: 8,
    paddingLeft: 2,
    // 안드로이드 TextInput 기본 오른쪽 여백을 없앤다 — iOS는 0이라 글자가 더 일찍 줄바꿈됐다
    paddingRight: 0,
  },
  editorArea: {
    flex: 1,
  },
});
