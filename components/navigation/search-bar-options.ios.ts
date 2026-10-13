import { useMemo } from "react";
import type { SearchBarProps } from "react-native-screens";
// lib
import { ThemeColorType } from "@/constants/colors";

type SearchBarOptionsArgs = {
  placeholder: string;
  cancelText: string;
  themeColor: ThemeColorType;
  onChangeText: (text: string) => void;
};

// 내비 바에 붙는 네이티브 검색창(UISearchController). 스크롤해도 숨기지 않는다
export const useSearchBarOptions = ({
  placeholder,
  cancelText,
  themeColor,
  onChangeText,
}: SearchBarOptionsArgs): SearchBarProps =>
  useMemo(
    () => ({
      placeholder,
      tintColor: themeColor.tint,
      cancelButtonText: cancelText,
      hideWhenScrolling: false,
      onChangeText: (e) => onChangeText(e.nativeEvent.text),
    }),
    [placeholder, cancelText, themeColor, onChangeText],
  );

// 헤더 옵션 추가분 — iOS는 내비 바가 알아서 겹친다
export const SEARCH_HEADER_OPTIONS = {};

// 결과 목록이 내비 바(제목+검색창) 밑에서 시작하도록 내리는 값
export const useSearchListPaddingTop = () => 110;
