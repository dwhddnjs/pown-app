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
});
