// expo
import * as Linking from "expo-linking";

// Gmail 앱을 우선 열고, 없으면 기본 메일 앱. 둘 다 없으면(시뮬레이터·메일 미설정) false.
// googlegmail 스킴은 app.json의 LSApplicationQueriesSchemes에 있어야 canOpenURL이 답한다
export const openMail = async (to: string, subject: string) => {
  const encoded = encodeURIComponent(subject);
  const gmailUrl = `googlegmail://co?to=${to}&subject=${encoded}`;
  const mailto = `mailto:${to}?subject=${encoded}`;
  try {
    if (await Linking.canOpenURL(gmailUrl)) {
      await Linking.openURL(gmailUrl);
      return true;
    }
    if (await Linking.canOpenURL(mailto)) {
      await Linking.openURL(mailto);
      return true;
    }
  } catch {
    // 못 열었다 — 호출한 쪽이 주소를 복사해 준다
  }
  return false;
};
