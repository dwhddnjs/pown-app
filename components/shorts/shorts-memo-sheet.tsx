import React, {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
// component
import { Keyboard, StyleSheet } from "react-native";
import BottomSheet, {
  BottomSheetTextInput,
  useBottomSheetInternal,
} from "@gorhom/bottom-sheet";
import { View } from "../themed";
// zustand
import { ShortsVideoTypes, useShortsStore } from "@/hooks/use-shorts-store";
// hook
import useCurrentThemeColor from "@/hooks/use-current-theme-color";
import { useT } from "@/hooks/use-t";
// lib
import {
  runOnJS,
  SharedValue,
  useAnimatedStyle,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";

interface ShortsMemoSheetProps {
  video?: ShortsVideoTypes;
  // 시트 상단 Y — 부모가 영상 높이를 프레임 단위로 따라가게 하는 데 쓴다
  animatedPosition: SharedValue<number>;
}

interface MemoFormProps {
  title: string;
  content: string;
  onChangeTitle: (value: string) => void;
  onChangeContent: (value: string) => void;
}

// useBottomSheetInternal은 BottomSheet 안쪽에서만 쓸 수 있어 별도 컴포넌트로 분리한다
const MemoForm = ({
  title,
  content,
  onChangeTitle,
  onChangeContent,
}: MemoFormProps) => {
  const themeColor = useCurrentThemeColor();
  const t = useT();
  const { animatedKeyboardHeight } = useBottomSheetInternal();
  const [isKeyboardUp, setIsKeyboardUp] = useState(false);

  // 키보드가 떠 있을 때만 "드래그해서 닫기" 제스처를 켠다
  useEffect(() => {
    const show = Keyboard.addListener("keyboardWillShow", () =>
      setIsKeyboardUp(true),
    );
    const hide = Keyboard.addListener("keyboardWillHide", () =>
      setIsKeyboardUp(false),
    );
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  // 키보드가 올라온 만큼 내용 입력칸만 줄인다 —
  // 컨테이너에 padding을 주면 제목까지 위로 밀려 시트 밖으로 잘린다
  const descStyle = useAnimatedStyle(() => ({
    marginBottom: animatedKeyboardHeight.value,
  }));

  // Keyboard.dismiss를 그대로 runOnJS에 넘기면 네이티브 모듈 메서드라 UI 런타임으로 못 보낸다
  const dismissKeyboard = useCallback(() => Keyboard.dismiss(), []);

  // 키보드가 올라와 있을 때 내용 입력칸을 위아래로 끌면 키보드를 내린다
  const dismissOnDrag = useMemo(
    () =>
      Gesture.Pan()
        .enabled(isKeyboardUp)
        .minDistance(8)
        .onStart(() => runOnJS(dismissKeyboard)()),
    [isKeyboardUp, dismissKeyboard],
  );

  return (
    <View
      style={[styles.container, { backgroundColor: themeColor.background }]}
    >
      <BottomSheetTextInput
        value={title}
        autoCorrect={false}
        spellCheck={false}
        placeholder={t("plan.titlePlaceholder")}
        placeholderTextColor={themeColor.subText}
        style={[
          styles.titleInput,
          {
            color: themeColor.text,
            borderBottomColor: themeColor.subText,
          },
        ]}
        onChangeText={onChangeTitle}
      />
      <GestureDetector gesture={dismissOnDrag}>
        <BottomSheetTextInput
          value={content}
          multiline
          autoCorrect={false}
          spellCheck={false}
          placeholder={t("plan.contentPlaceholder")}
          placeholderTextColor={themeColor.subText}
          style={[styles.descInput, { color: themeColor.text }, descStyle]}
          onChangeText={onChangeContent}
        />
      </GestureDetector>
    </View>
  );
};

export const ShortsMemoSheet = forwardRef<BottomSheet, ShortsMemoSheetProps>(
  ({ video, animatedPosition }, ref) => {
    const themeColor = useCurrentThemeColor();
    const { setMemo } = useShortsStore();
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");

    // 다른 숏츠로 넘어가면 그 영상의 메모로 갈아끼운다
    useEffect(() => {
      setTitle(video?.title ?? "");
      setContent(video?.content ?? "");
    }, [video?.id, video?.title, video?.content]);

    // 저장 시점(닫기·언마운트)에는 최신 값이 필요한데 콜백이 옛 클로저를 잡을 수 있다
    const draftRef = useRef({ video, title, content });
    draftRef.current = { video, title, content };

    // 저장 버튼 없이 닫을 때 자동 저장 — 바뀐 게 없으면 스토어를 건드리지 않는다
    const saveDraft = useCallback(() => {
      const draft = draftRef.current;
      if (!draft.video) {
        return;
      }
      const nextTitle = draft.title.trim();
      const nextContent = draft.content.trim();
      if (
        nextTitle === (draft.video.title ?? "") &&
        nextContent === (draft.video.content ?? "")
      ) {
        return;
      }
      setMemo(draft.video.id, { title: nextTitle, content: nextContent });
    }, [setMemo]);

    // 시트를 열어둔 채 화면을 벗어나도 날아가지 않게
    useEffect(() => () => saveDraft(), [saveDraft]);

    const snapPoints = useMemo(() => ["65%"], []);

    return (
      <BottomSheet
        ref={ref}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose
        onClose={saveDraft}
        // 기본값 interactive는 키보드 높이만큼 시트를 밀어올려 화면 밖으로 넘긴다
        // (시트 위 여백 306pt < 키보드 336pt) → 최대 스냅(65%)에 머무르게 한다
        keyboardBehavior="extend"
        // restore면 키보드가 내려갈 때 시트를 스냅 위치로 되돌리는 애니메이션이 돌아
        // 같은 순간의 close()를 취소해버린다 (extend라 애초에 움직이지도 않으니 되돌릴 것도 없다)
        keyboardBlurBehavior="none"
        animatedPosition={animatedPosition}
        backgroundStyle={{ backgroundColor: themeColor.background }}
        handleIndicatorStyle={{ backgroundColor: themeColor.subText }}
      >
        <MemoForm
          title={title}
          content={content}
          onChangeTitle={setTitle}
          onChangeContent={setContent}
        />
      </BottomSheet>
    );
  },
);

ShortsMemoSheet.displayName = "ShortsMemoSheet";

// 스타일은 app/(modals)/note.tsx(운동계획 메모)와 동일하게 맞춘다
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  titleInput: {
    fontSize: 24,
    borderBottomWidth: 1,
    fontFamily: "sb-m",
    paddingVertical: 8,
    paddingLeft: 2,
  },
  descInput: {
    // 고정 높이 대신 남는 공간을 채운다 — 키보드가 뜨면 그만큼 줄어든다
    flex: 1,
    paddingLeft: 2,
    fontSize: 16,
    paddingVertical: 14,
    fontFamily: "sb-l",
    textAlignVertical: "top",
    // 이게 없으면 길게 쓸 때 스크롤된 글자가 입력칸 밖(제목 밑줄 위)까지 그려진다
    overflow: "hidden",
  },
});
