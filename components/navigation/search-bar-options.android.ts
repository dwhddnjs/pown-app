import { RefObject, useEffect, useMemo, useRef } from "react";
import type { SearchBarCommands, SearchBarProps } from "react-native-screens";
import type {
  NavigationProp,
  NavigationState,
  ParamListBase,
} from "@react-navigation/native";
// lib
import { ThemeColorType } from "@/constants/colors";
// expo
import { useNavigation } from "expo-router";

type SearchBarOptionsArgs = {
  placeholder: string;
  cancelText: string;
  themeColor: ThemeColorType;
  onChangeText: (text: string) => void;
};

// 네이티브 스택이 보내는 이벤트 중 여기서 듣는 것만
type StackEvents = { transitionEnd: { data: { closing: boolean } } };

// 툴바 검색 아이콘을 누르면 펼쳐지는 네이티브 SearchView.
// 색을 주지 않으면 툴바 기본(밝은 테마) 색이라 다크 테마에서 글자·아이콘이 묻힌다.
// 취소 버튼은 iOS에만 있다 — 안드로이드는 뒤로가기가 검색을 닫는다
export const useSearchBarOptions = ({
  placeholder,
  themeColor,
  onChangeText,
}: SearchBarOptionsArgs): SearchBarProps => {
  const ref = useRef<SearchBarCommands>(null);
  const navigation =
    useNavigation<
      NavigationProp<
        ParamListBase,
        string,
        undefined,
        NavigationState,
        object,
        StackEvents
      >
    >();

  // 검색하러 들어온 화면이라 바로 펼쳐 키보드를 띄운다. autoFocus 옵션은 검색창이 만들어질 때
  // 이미 들어와 있어야 먹는데, 화면이 setOptions로 넣으면 늦어서 무시된다 — 전환이 끝나면 직접 연다
  useEffect(
    () =>
      navigation.addListener("transitionEnd", (e) => {
        if (!e.data.closing) ref.current?.focus();
      }),
    [navigation],
  );

  return useMemo(
    () => ({
      // react-native-screens 타입은 null 없는 RefObject를 받는다
      ref: ref as RefObject<SearchBarCommands>,
      placeholder,
      textColor: themeColor.text,
      hintTextColor: themeColor.subText,
      headerIconColor: themeColor.text,
      onChangeText: (e) => onChangeText(e.nativeEvent.text),
    }),
    [placeholder, themeColor, onChangeText],
  );
};

// 헤더가 불투명이라 목록이 이미 헤더 밑에서 시작한다
export const SEARCH_LIST_PADDING_TOP = 0;
