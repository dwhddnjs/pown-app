// expo
import * as Linking from "expo-linking";

// mailto를 바로 연다 — 메일 앱이 여럿이면 시스템이 고르게 해 준다(Gmail 포함).
// canOpenURL로 먼저 묻지 않는다: 안드로이드 11+는 매니페스트 queries 선언이 없으면 앱이
// 있어도 false다. 메일 앱이 하나도 없으면 openURL이 던지고 false
export const openMail = async (to: string, subject: string) => {
  try {
    await Linking.openURL(
      `mailto:${to}?subject=${encodeURIComponent(subject)}`,
    );
    return true;
  } catch {
    return false;
  }
};
