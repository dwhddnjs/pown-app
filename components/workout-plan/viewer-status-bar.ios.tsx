import { ReactNode } from "react";

// iOS는 뷰어의 어두운 배경 위 상태바 글자를 시스템이 알아서 희게 바꾼다 — 그대로 연다
export const ViewerStatusBar = ({ children }: { children: ReactNode }) =>
  children;
