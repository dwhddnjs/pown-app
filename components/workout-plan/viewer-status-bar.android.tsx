import { ReactNode, useEffect, useState } from "react";
// expo
import { StatusBar } from "expo-status-bar";

// 사진 뷰어(80% 검정) 위 상태바 글자를 iOS처럼 희게 한다. RN Modal(다이얼로그 창)은 만들어지는
// 순간 액티비티의 상태바 글자색을 한 번 복사하고 그 뒤로는 안 따라온다 — 먼저 흰 글자로 바꿔 두고
// 한 프레임 뒤에 연다. 닫히면 StatusBar가 스택에서 빠져 원래 색으로 돌아간다
export const ViewerStatusBar = ({ children }: { children: ReactNode }) => {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setIsReady(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <>
      <StatusBar style="light" />
      {isReady && children}
    </>
  );
};
