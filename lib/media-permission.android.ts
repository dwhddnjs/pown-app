// expo
import * as MediaLibrary from "expo-media-library";

// 찍은 사진을 갤러리에 저장하기 전에 묻는다. 쓰기 전용 — 안드로이드엔 갤러리를 직접
// 가리키는 구 데이터가 없어 읽기 권한이 필요 없고, 사진·동영상 읽기 권한
// (READ_MEDIA_IMAGES/VIDEO)은 플레이 스토어 심사 대상이라 app.json에서 막아 둔다
export const requestSavePermission = async () =>
  (await MediaLibrary.requestPermissionsAsync(true)).status;
