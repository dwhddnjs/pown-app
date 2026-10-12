// expo
import * as MediaLibrary from "expo-media-library";

// 찍은 사진을 사진첩에 저장하기 전에 묻는다. 읽기까지 받는다 — 구 버전 기록엔 사진첩을
// 직접 가리키는 ph:// 사진이 남아 있어 그걸 보여주려면 읽기 권한이 필요하다
export const requestSavePermission = async () =>
  (await MediaLibrary.requestPermissionsAsync()).status;
