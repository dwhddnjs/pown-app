// ponytail: 이 헤더는 현재 아무것도 막지 못한다. 2026-09부터 Gemini 키는 서비스
// 계정에 묶인 auth key(AQ.*)로만 발급되는데, auth key에는 Cloud 콘솔의 "iOS 앱"
// 애플리케이션 제한이 적용되지 않는다 — 헤더 없이 호출해도 200으로 통과하는 걸 확인했다.
// 즉 번들에 박힌 키는 무방비다. 결제가 붙지 않은 프로젝트라 과금은 불가능하고
// 최악이 일일 쿼터 소진이다. 쿼터가 실제로 털리면 ENDPOINT를 프록시로 돌린다.
// 헤더는 구글이 제한을 고칠 때를 대비해 남겨 둔다 (무시되므로 무해).
export const AI_CLIENT_HEADERS = {
  "X-Ios-Bundle-Identifier": "com.anonymous.workout-app",
};
