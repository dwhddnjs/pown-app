# 데이터 백업·복원 전면 개선 (미디어 포함 `.pown` 아카이브)

> **상태:** 계획 확정, 구현 대기 (다음 세션에서 작업).
> **사용자 확정 사항:** ① 근본 해결(촬영 시점 앱 소유화) ② 백업 파일 형식 `.pown`(내부 zip).

## ❓ "기존 백업으로 복원하면 사진/영상 나오나?" (자주 묻는 질문)

- **이번 개선으로 만든 `.pown` 백업** → 앱 삭제 + 사진첩 사진/영상 전부 삭제 + 재설치 + 복원 = **✅ 정상 표시.** `.pown` 파일 안에 미디어 바이트 자체가 들어있어 사진첩·기기와 완전히 독립.
- **개선 전 JSON 백업** → **❌ 안 나옴.** 주소(URI)만 담고 실제 파일은 없어서, 사진첩에서 지우면 복구 불가능.
- **전제:** 새 방식도 "백업하는 순간 미디어가 존재해야" 담긴다. 개선 후엔 촬영 시 앱이 사본을 소유하므로 항상 존재 → 문제 없음. 단, 개선 전에 이미 사진첩에서 지운 옛 사진은 담을 게 없어 복구 불가.

---

## Context

현재 백업/복원(`app/mypage/reset-data.tsx`)은 두 가지 근본 문제가 있다.

1. **미디어가 앱 소유가 아님** — 운동 사진(`workoutPlanList[].imageUri[].imageUri`)과 숏츠 영상(`videos[].video`)은 **사진첩(Photos) 라이브러리 참조**(`file://…/DCIM/…` 또는 `ph://…`)로 저장된다. 사용자가 사진첩에서 원본을 지우면 URI가 끊겨 **검정 fallback**이 뜬다. 앱 내부에 복사본이 없어 인앱 표시조차 깨진다. (유일한 앱 소유 파일은 숏츠 썸네일뿐.)
2. **백업이 불완전** — 백업 JSON은 `{ user: userInfo, workoutPlan: workoutPlanList }`만 담는다. **숏츠(`shorts`) 전체, 유저의 `workoutList`·`theme`가 누락**되고, 바이너리 미디어는 전혀 포함되지 않는다. 복원은 `userInfo` + `workoutPlanList`만 set → 새 기기에서 미디어 URI는 모두 죽는다.

**목표 (사용자 확정):**
- **근본 해결**: 촬영 시점에 미디어를 앱 내부 저장소(`documentDirectory/media/`)로 복사해 **앱이 소유** → 사진첩에서 지워도 인앱·백업 모두 정상.
- 3개 영속 스토어(`user`·`workout-plan`·`shorts`) **전체**를 하나의 파일로 백업/복원.
- 백업 파일은 **`.pown` 커스텀 확장자**(내부는 zip 아카이브 = `manifest.json` + `media/` 폴더). Bear의 `.bearbk`와 같은 방식.

## 탐색으로 확인된 사실 (구현 시 참고)

미디어 필드 인벤토리:

| 스토어 | 영속 key | 필드 경로 | 종류 | 현재 URI 형태 |
|---|---|---|---|---|
| use-workout-plan-store | `workout-plan` | `workoutPlanList[].imageUri[].imageUri` | 이미지 | `file://…/DCIM/…` (expo-camera→media-library) |
| use-shorts-store | `shorts` | `videos[].thumbnail` | 이미지 | `file://` documentDirectory JPG (유일한 앱 소유) |
| use-shorts-store | `shorts` | `videos[].video` | 영상 | `file://` (localUri) / `ph://` fallback |
| use-user-store | `user` | — | 없음 | — |

- 스토어 setter: `useWorkoutPlanStore.onSetMockout(list)`(전체교체), `useUserStore.setUser(key, value)`(개별 key), `useShortsStore`는 전체교체 setter **없음 → 추가 필요**.
- 미디어 라이브러리: expo-file-system `^18`(legacy API: `documentDirectory`/`cacheDirectory`/`copyAsync`/`makeDirectoryAsync`/`read·writeAsStringAsync`), expo-sharing, expo-document-picker, expo-camera, expo-media-library, expo-video, expo-video-thumbnails. **zip 라이브러리 없음 → 추가 필요.**
- 캡처 위치: 이미지 = `lib/media.ts` `saveImagesToLibrary`(호출부 `app/add-plan/[slug].tsx`, `app/edit-plan/[...slug].tsx`, `app/workout/add-multi-plan.tsx`), 영상 = `app/shorts/video.tsx` `selectImageUri`.
- 렌더 위치: `components/workout-plan/workout-plan.tsx`(RN Image, 썸네일+탭), `components/workout-plan/image-modal.tsx`(expo-image, use-image-uri-store에서 URI 받음), `app/(drawer)/(tabs)/shorts.tsx`(썸네일 grid), `components/shorts/shorts-player.tsx`(useVideoPlayer), `app/shorts/[...slug].tsx`.

## 핵심 설계

### URI 저장 규칙 — 상대경로 + 리졸버 (재설치·복원 내성)

`documentDirectory` 절대경로는 앱 재설치/새 기기마다 바뀌므로 **절대경로를 저장하면 복원 시 깨진다.** 따라서 앱 소유 미디어는 **상대경로**(예: `"media/plan-img-<id>.jpg"`)로 저장하고, 렌더 시점에 현재 `documentDirectory`를 앞에 붙인다.

`lib/media.ts`에 헬퍼 추가:
- `ensureMediaDir()` — `${documentDirectory}media/` 생성(`makeDirectoryAsync`, intermediates).
- `persistMediaLocally(sourceUri, fileName)` — `media/` 보장 후 `copyAsync`, 상대경로 `media/<fileName>` 반환.
- `resolveMediaUri(stored?)` — `stored`가 `"media/"`로 시작하면 `documentDirectory + stored`, 아니면 **그대로 반환**(구 데이터의 절대 `file://…/DCIM/…`·`ph://`는 기존과 동일 동작 → 하위호환·무회귀).

### 아카이브 라이브러리

`react-native-zip-archive` 추가(파일경로 기반 `zip`/`unzip` — 대용량 영상도 JS 메모리에 base64로 안 올림). `jszip`은 영상에서 OOM 위험이라 부적합. autolink이라 config plugin 불필요하나 **네이티브 재빌드 필요**(`npm run ios`, CNG prebuild).

## 변경 내용

### 1. 촬영 시점 앱 소유화 (근본 해결)

- **`lib/media.ts` `saveImagesToLibrary`** — 사진첩 저장은 best-effort로 유지하되, 확보한 소스 URI(권한 있으면 `assetInfo.localUri`, 없으면 원본 캐시 `item.imageUri`)를 `persistMediaLocally(src, "plan-img-<id>.jpg")`로 앱 소유 복사하고 **상대경로**를 `imageUri`에 담아 반환. "이미 저장됨" 판정을 `/DCIM/` 대신 `imageUri?.startsWith("media/")`(이미 앱 소유)로 변경. → 사진첩 권한이 없어도 사진이 유지됨(부수 개선). 호출부는 수정 불필요.
- **`app/shorts/video.tsx` `selectImageUri`** — 영상: `assetInfo.localUri ?? asset.uri`를 `persistMediaLocally(src, "shorts-<id>.mp4")`. 썸네일: 기존 `documentDirectory` 직접 경로 대신 `persistMediaLocally(thumbnail.uri, "shorts-thumb-<id>.jpg")`. 둘 다 **상대경로**로 `setAddVideo`.

### 2. 렌더 사이트 — `resolveMediaUri()`로 감싸기

- `components/workout-plan/workout-plan.tsx` (~257–267): 썸네일 `uri` + 탭 시 `setImageUri(...)` → `resolveMediaUri(imageItem.imageUri)`. (풀스크린 `image-modal.tsx`는 스토어에서 이미 해석된 절대 URI를 받으므로 수정 불필요.)
- `app/(drawer)/(tabs)/shorts.tsx` (line 55): `uri: resolveMediaUri(item.thumbnail)`.
- `components/shorts/shorts-player.tsx` (line 18): `useVideoPlayer(resolveMediaUri(video.video), …)`.
- `app/shorts/[...slug].tsx`: 영상/썸네일 렌더 시 동일 적용(파일 확인 후).

### 3. 스토어 setter 보강

- **`hooks/use-shorts-store.tsx`** — 전체 교체용 `onSetVideos: (videos) => set({ videos })` 추가(복원용).
- `hooks/use-user-store.tsx` — 기존 `setUser("userInfo"|"workoutList"|"theme", …)`로 충분(복원 시 각각 호출).
- `hooks/use-workout-plan-store.tsx` — 기존 `onSetMockout(list)` 사용.

### 4. 백업/복원 로직 모듈화 — `lib/backup.ts` (신규)

- **`createBackup()`**:
  1. 세 스토어 상태 수집(`useUserStore.getState()` 등): `userInfo`, `workoutList`, `theme`, `workoutPlanList`, `videos`.
  2. 스테이징 `${cacheDirectory}pown-backup/`, 하위 `media/` 생성.
  3. 모든 미디어 필드 순회 → `resolveMediaUri`로 절대 소스 얻어 `staging/media/<basename>`로 `copyAsync`(존재/실패 가드), manifest의 해당 필드를 `media/<basename>`(상대)로 재기록. `ph://`나 없는 파일은 스킵(best-effort).
  4. `manifest.json` 작성: `{ version: 1, exportedAt, stores: { user:{userInfo,workoutList,theme}, workoutPlan:{workoutPlanList}, shorts:{videos} } }`.
  5. `zip(stagingDir, ${cacheDirectory}pown-backup.pown)` → `shareAsync(path, { mimeType: "application/zip" })`. 스테이징 정리.
- **`restoreBackup()`**:
  1. `DocumentPicker.getDocumentAsync({ type: ["*/*"] })`로 `.pown` 선택 → `cacheDirectory`로 복사 후 `unzip`.
  2. `manifest.json` 읽고 shape 검증(`version`, `stores` 가드). 실패 시 `toast.error(...)`.
  3. `${documentDirectory}media/` 보장 후 아카이브 `media/*` 전부 그쪽으로 `copyAsync`(덮어쓰기).
  4. 스토어 set: `setUser("userInfo"/"workoutList"/"theme", …)`, `onSetMockout(workoutPlanList)`, `onSetVideos(videos)`. (미디어 필드는 이미 `media/...` 상대경로 → 리졸버가 현재 `documentDirectory` 프리픽스 → 새 기기에서도 정상.)
  5. `toast.success("복원되었습니다")`. 임시 폴더 정리.
- 토스트는 `lib/media.ts` 관례대로 이 모듈 내에서 처리, 성공/실패 boolean 반환.

### 5. `app/mypage/reset-data.tsx` 정리

- 인라인 `saveJsonFile`/`pickJsonFile`/`jsonFile`/검증 가드 제거 → `createBackup()`/`restoreBackup()` 호출로 교체.
- 리셋 버튼의 디버그 `toast.success("tapped")`(line 162) 제거.
- 백업 항목 설명 문구를 "JSON 파일" → "Pown 백업 파일(.pown)"로 갱신.

### 6. `package.json`

- `react-native-zip-archive` 추가. `.npmrc`에 `legacy-peer-deps=true` 있으므로 그대로 설치.

## 범위 밖 (선택 후속)

- **기존 라이브러리 URI → 앱 소유 일괄 마이그레이션**: 하지 않음. 리졸버가 구 데이터를 그대로 통과시켜 기존과 동일하게 동작하고, 백업 시 아직 남아있는 파일은 best-effort로 번들. (강제 마이그레이션은 복잡·위험 → 별도 작업.)
- **`.pown` UTI 등록**(app.json `CFBundleDocumentTypes`)으로 파일 앱에서 "Pown으로 열기": 인앱 복원은 DocumentPicker로 동작하므로 불필요. 필요 시 후속.

## 검증

- 타입/린트: `npx tsc --noEmit`(strict) + `npm run lint`(no-console) 에러 0.
- **네이티브 재빌드 필수**: `react-native-zip-archive` 추가 → `npm run ios`.
- 시뮬레이터 수동 시나리오(`/verify`):
  1. 운동 기록에 사진 추가, 숏츠 영상 촬영 → 정상 표시.
  2. **사진첩 앱에서 원본 사진·영상 삭제** → 인앱에서 여전히 정상 표시(검정 화면 없음) ← 근본 해결 확인.
  3. 데이터 관리 → 백업 → `pown-backup.pown` 공유(파일 앱/에어드롭 저장).
  4. 앱 초기화(또는 재설치) → 복원 → `.pown` 선택 → 운동기록·유저정보·태그·테마·숏츠 + **모든 사진/영상**이 복구되어 렌더되는지 확인.
