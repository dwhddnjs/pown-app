import { useMemo } from "react";
import type { SearchBarProps } from "react-native-screens";
import { useSafeAreaInsets } from "react-native-safe-area-context";
// lib
import { ThemeColorType } from "@/constants/colors";

type SearchBarOptionsArgs = {
  placeholder: string;
  cancelText: string;
  themeColor: ThemeColorType;
  onChangeText: (text: string) => void;
};

// 검색창은 헤더(stack-header.android.tsx)가 iOS UISearchController 모양으로 그린다 —
// 네이티브 SearchView는 제목·뒤로 버튼을 통째로 덮어 iOS와 딴판이다.
// 들어오자마자 펼치지 않는다(iOS처럼 칸을 눌러야 키보드가 뜬다)
export const useSearchBarOptions = ({
  placeholder,
  cancelText,
  onChangeText,
}: SearchBarOptionsArgs): SearchBarProps =>
  useMemo(
    () => ({
      placeholder,
      cancelButtonText: cancelText,
      onChangeText: (e) => onChangeText(e.nativeEvent.text),
    }),
    [placeholder, cancelText, onChangeText],
  );

// 헤더를 목록 위에 겹친다 — 검색 중 바가 줄어도 목록이 움직이지 않게 (iOS와 같다)
export const SEARCH_HEADER_OPTIONS = { headerTransparent: true };

// 목록이 헤더 뒤(화면 맨 위)부터 깔리므로 내려 줄 높이 — iOS(110 = 안전영역 62 + 48)와
// 같은 자리. 결과 첫 카드가 검색 중인 칸 바로 밑에 온다
export const useSearchListPaddingTop = () => useSafeAreaInsets().top + 48;
