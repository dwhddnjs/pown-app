import { StyleSheet } from "react-native";

// MY 하위 설정 화면(데이터 관리·테마·언어·내정보)이 공유하는 바깥 여백과 안내문 스타일.
// 네 화면이 같은 값을 각자 들고 있어서 여백을 한 번 손보려면 네 곳을 같이 고쳐야 했다.
// 색은 테마에 따라 달라지므로 여기 넣지 않고 쓰는 쪽에서 인라인으로 얹는다.
export const settingsScreenStyles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 24,
    paddingHorizontal: 20,
    gap: 24,
  },
  textContainer: {
    gap: 8,
  },
  title: {
    fontSize: 18,
  },
  desc: {
    fontFamily: "sb-l",
    fontSize: 13,
    lineHeight: 19,
  },
  // 설정 행 아이콘(MaterialCommunityIcons 20)이 행 높이를 정한다. 안드로이드는 기본 글꼴 여백
  // (글리프 외곽 기준)으로 줄이 0.6 커져 행마다 1씩 iOS보다 길어진다 — 꺼서 iOS 줄높이(20)에 맞춘다.
  // iOS엔 없는 속성이라 무시된다
  icon: {
    includeFontPadding: false,
  },
});
