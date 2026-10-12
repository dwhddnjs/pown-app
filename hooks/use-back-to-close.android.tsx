import { useEffect, useRef } from "react";
import { BackHandler } from "react-native";

// 뒤로가기를 누르면 열린 시트·오버레이부터 닫는다. 안 막으면 그 밑의 화면이 통째로
// 빠져서 계획 폼에 입력하던 내용이 날아간다. 나중에 건 리스너가 먼저 불리므로
// 시트 위에 또 시트가 열려 있으면 위의 것부터 닫힌다.
export const useBackToClose = (isOpen: boolean, close: () => void) => {
  // 매 렌더 새로 만든 close를 넘겨도 리스너를 다시 걸지 않는다 — 다시 걸면 순서가 바뀐다
  const closeRef = useRef(close);
  closeRef.current = close;

  useEffect(() => {
    if (!isOpen) return;
    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        closeRef.current();
        return true;
      },
    );
    return () => subscription.remove();
  }, [isOpen]);
};
