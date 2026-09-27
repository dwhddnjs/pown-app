import React, { useEffect, useState } from "react";
// component
import { Platform } from "react-native";
import { ConfirmDialog } from "./confirm-dialog";
// hooks
import useCurrentThemeColor from "@/hooks/use-current-theme-color";
import { useT } from "@/hooks/use-t";
// lib
import { mmkv } from "@/lib/storage";
// expo
import Constants from "expo-constants";
import * as Linking from "expo-linking";

// 백엔드가 없으니 App Store 공개 조회 API가 "최신 버전"의 출처다. bundle id를 적어
// 두면 app.json이 바뀔 때 조회가 조용히 빈 결과를 돌려주고 팝업이 영영 안 뜬다.
// country=kr은 "버전 조회처"일 뿐이다 — 바이너리는 하나라 어느 스토어든 버전이 같고,
// 한국 스토어엔 반드시 있다. 사용자가 여는 링크는 아래에서 국가 없이 만든다
const LOOKUP_URL = `https://itunes.apple.com/lookup?bundleId=${Constants.expoConfig?.ios?.bundleIdentifier}&country=kr`;
const SNOOZE_KEY = "update-snoozed-at";
const DAY = 86_400_000;

type StoreUpdate = { version: string; url: string };

// a가 b보다 major.minor 기준으로 앞서는가 — 패치 차이는 무시한다
const isMinorAhead = (a: string, b: string) => {
  const [a1, a2 = 0] = a.split(".").map(Number);
  const [b1, b2 = 0] = b.split(".").map(Number);
  return a1 > b1 || (a1 === b1 && a2 > b2);
};

const fetchStoreUpdate = async (): Promise<StoreUpdate | null> => {
  if (Platform.OS !== "ios") return null;
  // runtimeVersion == version 규칙이라 OTA 뒤에도 바이너리 버전과 같다
  const installed = Constants.expoConfig?.version;
  if (!installed) return null;
  // "나중에" 뒤 7일은 묻지 않는다
  if (Date.now() - (mmkv.getNumber(SNOOZE_KEY) ?? 0) < 7 * DAY) return null;

  // 응답이 max-age=86400이라 그대로 두면 기기 캐시가 하루 묵은 버전을 준다
  const res = await fetch(`${LOOKUP_URL}&_=${Date.now()}`);
  const store = (await res.json()).results?.[0];
  if (!store || !isMinorAhead(store.version, installed)) return null;
  // 출시 직후엔 스토어 앱에 아직 '업데이트' 버튼이 안 보일 수 있다 (Siren 기본값 1일)
  if (Date.now() - Date.parse(store.currentVersionReleaseDate) < DAY) {
    return null;
  }
  // 새 버전이 요구하는 iOS보다 기기가 낮으면 업데이트할 방법이 없다
  if (isMinorAhead(store.minimumOsVersion, String(Platform.Version))) {
    return null;
  }
  // trackViewUrl은 조회한 kr 스토어 링크다 — 국가 없는 링크여야 App Store가 사용자
  // 계정의 스토어(미국·일본 등)로 연다
  return {
    version: store.version,
    url: `https://apps.apple.com/app/id${store.trackId}`,
  };
};

// 마이너 이상 새 버전이 스토어에 있으면 콜드 스타트 때 한 번 권장 업데이트를 띄운다.
// 닫을 수 있는 팝업만 둔다 — 백엔드가 없어 구버전이 깨질 API가 없다.
export const UpdateDialog = () => {
  const [update, setUpdate] = useState<StoreUpdate | null>(null);
  const themeColor = useCurrentThemeColor();
  const t = useT();

  useEffect(() => {
    // 오프라인·응답 이상이면 조용히 넘어간다
    fetchStoreUpdate()
      .then(setUpdate)
      .catch(() => {});
  }, []);

  if (!update) return null;

  // 나중에·X·배경 탭 모두 여기로 온다
  const onClose = () => {
    mmkv.set(SNOOZE_KEY, Date.now());
    setUpdate(null);
  };

  const onConfirm = () => {
    Linking.openURL(update.url).catch(() => {});
    onClose();
  };

  return (
    <ConfirmDialog
      isOpen
      onClose={onClose}
      title={t("update.title", { version: update.version })}
      desc={t("update.desc")}
      cancelLabel={t("update.later")}
      actionLabel={t("update.action")}
      actionColor={themeColor.tint}
      onConfirm={onConfirm}
    />
  );
};
