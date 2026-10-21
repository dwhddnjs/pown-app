# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

**항상 한국어로 응답합니다.**

## 스킬 (먼저 확인)

`.agents/skills/`에 프로젝트 스킬이 있다. 관련 작업이면 **반드시 해당 `SKILL.md`를 먼저 읽고 따른다.**

- **`expo-native-ui`** — Expo/RN 화면을 만들거나 스타일링·네이티브 컨트롤·아이콘·애니메이션·미디어·차트를 다룰 때. 세부 레시피는 `references/*.md`.
- **`verify`** — 런타임 동작이 바뀌는 변경을 iOS 시뮬레이터·Android 에뮬레이터에서 눈으로 검증할 때. `/verify` 슬래시 명령으로도 실행.

스킬은 일반 가이드다. **충돌 시 아래 "프로젝트 규칙"이 우선한다** (이 앱은 MMKV(`react-native-mmkv`)를 쓰고, Expo Go가 아닌 dev-client를 쓰며, 테마 색상을 인라인 배열로 주입하고, 플랫폼 차이는 `Platform.select`·`process.env.EXPO_OS`가 아니라 `.ios`/`.android` 파일 쌍으로 나눈다 — 스킬의 반대 조언보다 프로젝트 관행을 따를 것).

## 프로젝트

Pown (포운) — 점진적 과부하 운동 계획·기록 앱. **백엔드 없음**: 모든 데이터를 기기 로컬(MMKV)에 저장하는 오프라인 우선 iOS·Android 앱. iOS가 먼저 출시됐고, 플랫폼 차이는 파일 쌍으로 나눈다(아래 "플랫폼 분리").

## 명령어

```bash
npm start          # Expo 개발 서버
npm run ios        # iOS 네이티브 빌드 후 실행 (Expo Go 아님, dev-client)
npm run android    # Android 네이티브 빌드 후 실행 (dev-client)
npm run typecheck  # 타입 체크 — iOS 세계(tsconfig.json) + Android 세계(tsconfig.android.json)
```

테스트 러너는 없다 — 검증은 타입 체크 `npm run typecheck`(strict, 두 플랫폼) + 린트 `npm run lint`(eslint-config-expo, `no-console`·`Platform.OS`/`Platform.select` error). 둘 다 에러 0을 유지할 것. 포맷은 prettier(`npm run format`, 설정은 `.prettierrc`: 세미콜론 + trailing comma all) — 커밋 전에 돌린다. `ios/`·`android/`는 gitignore(CNG). `.npmrc`에 `legacy-peer-deps=true`.

**배포(EAS)**: `eas build --profile production --platform ios|android` → `eas submit -p ios|android` / JS만 바뀌면 `eas update --channel production --environment production` (iOS·Android에 같이 나간다 — 한쪽만이면 `--platform`). **`--environment`를 빼면** EAS에 등록한 `EXPO_PUBLIC_GEMINI_API_KEY`가 번들에 안 들어가(로컬엔 `.env`가 없고, SDK 55 미만이라 CLI가 묻지도 않는다) AI 분석이 전부 실패하는 업데이트가 에러 없이 나간다. `appVersionSource:"remote"`(Android versionCode는 `production.android.autoIncrement`로 EAS가 올린다). `app.json`의 `version`과 `runtimeVersion`은 **동일하게** 유지해야 OTA가 매칭된다.
**`expo-*` 패키지는 `npx expo install --check`로 SDK 패치에 맞춰 둔다** — 안드로이드는 expo 모듈이 미리 빌드된 AAR이라 `expo-modules-core`와 버전이 어긋나면 실행하자마자 `No virtual method ...`로 죽는다(iOS는 소스로 빌드해서 멀쩡해 보인다). `@shopify/flash-list`는 의도적으로 v2라 제외.
**네이티브 의존성이 바뀐 릴리스는 OTA 금지**(두 플랫폼 모두) — 옛 바이너리에 새 JS가 내려가 실행 즉시 죽는다. 두 버전을 올리고 새로 빌드할 것.
`eas build --profile preview --platform android`는 사이드로드용 APK를 만든다.

**Android 첫 출시 전 체크리스트** (코드 밖에서 할 일):

- Play Console 앱 패키지는 `com.dwhddnjs.pown` — 한 번 올리면 못 바꾼다. 첫 AAB는 콘솔에서 직접 업로드해야 그다음부터 `eas submit`(track `internal`)이 된다. 서비스 계정 키 필요.
- 데이터 보안 양식: 광고 ID(AdMob), 카메라·마이크(숏츠 녹화), 사진은 갤러리 저장만(읽기 권한 없음 — `blockedPermissions`로 READ_MEDIA_* 제거).

## 아키텍처

### Zustand 스토어 = 데이터베이스

백엔드가 없으므로 **`hooks/use-*-store.tsx`가 사실상 DB**다. 두 종류:

- **영속** (`persist` + `createJSONStorage(() => storage)`): 실제 저장 데이터. `use-workout-plan-store`(운동 기록), `use-user-store`(신체정보·테마·3대중량), `use-shorts-store`(숏츠).
- **임시** (`persist` 없는 `create`): 폼·UI 상태. `use-plan-store`(추가/수정 폼), `use-multi-plan-store`(루틴 임시 목록 — 저장 시 workout-plan으로 커밋), `use-note-store`, `use-is-modal-open-store` 등.

**핵심 흐름**: `use-plan-store`(임시 폼)에 입력을 모아 저장 시 `useWorkoutPlanStore.setWorkoutPlan()`으로 영속 리스트에 커밋. `WorkoutPlanTypes`는 `PlanStoreType`을 `Pick`으로 파생 — 한쪽 필드를 바꾸면 다른 쪽도 확인. 모든 영속 스토어는 `@/lib/storage`의 `storage`(MMKV 래퍼 — **동기**라 create() 안에서 하이드레이션이 끝난다. 그래서 `onRehydrateStorage`에서 스토어 변수를 참조하면 TDZ로 죽는다; 후처리는 `merge`에서 할 것. MMKV에 값이 없을 때만 구버전 AsyncStorage를 한 번 읽어 옮긴다)를 통과. 날짜 저장 포맷은 `lib/date.ts`의 `PLAN_DATE_FORMAT`(`"yyyy.MM.dd HH:mm:ss"`) — 문자열을 새로 적지 말고 이 상수를 쓴다.

### 라우팅 (Expo Router, typedRoutes)

파일 경로 = URL. 그룹 세그먼트 `(drawer)`·`(tabs)`·`(modals)`는 URL 미포함. 중첩: Drawer > Tabs(workout/calendar/chart/shorts/add), `(modals)`는 `presentation:"modal"`. 진입 화면은 `(drawer)/(tabs)/workout`. catch-all 라우트 다수(`edit-plan/[...slug]` 등). 이동은 `useRouter().push(...)`.

- `usePathname()`은 그룹 세그먼트를 뺀 경로 반환 → 정확히 일치 비교 말고 `pathname.includes("multi-plan")`처럼 유연하게.
- 헤더는 `app/_layout.tsx`의 `Stack.Screen options` 콜백에서 설정. 반복되는 옵션 묶음(모달·설정 화면·전체화면·계획 폼)은 `components/navigation/screen-options.tsx`의 헬퍼를 쓴다 — `app/` 아래에 두면 Expo Router가 라우트로 인식하므로 여기 있다. `goBack()` 전에 스토어 reset이 필요하면 순서 주의.

### 테마

`useCurrentThemeColor()`로 색상 객체를 얻어 **인라인 배열 스타일**(`style={[styles.x, { color: themeColor.text }]}`)로 주입. `@/components/themed`의 `Text`/`View`는 테마 자동 적용 래퍼. 색 팔레트는 `constants/colors.ts`. 테마 소스는 `use-user-store`의 `theme`(`"system"|"dark"|"light"`), `app/_layout.tsx`에서 `Appearance.setColorScheme` 반영.

### 공용 코드 위치

한 곳에만 있어야 하는 것들 — 새로 만들기 전에 여기부터 본다.

- `types/workout.ts` — 도메인 타입(`WorkoutTypes`, `SetWithCountType`, `ImageUriType`)과 부위 순회 목록 `WORKOUT_TYPE_LIST`. 부위 유니온을 인라인으로 다시 적지 말 것.
- `constants/body-part.tsx` — 부위별 SVG 아이콘 맵(`BODY_PART_ICON`)과 선택 UI용 `BODY_PART_ITEMS`.
- `lib/date.ts` — 날짜 포맷·정렬·그룹핑. `lib/stats.ts` — 차트 집계. `lib/hangul.ts` — 초성 검색. `lib/seed.ts` — 테스트용 더미 기록.
- 전체 노트는 `content`에 react-native-enriched HTML(`<html>…</html>`)로 저장된다(퀵 노트는 평문). 판별·평문 추출·파싱은 `lib/rich-note.ts`, 에디터 `htmlStyle`과 읽기 렌더러 `RichNoteText`는 같은 치수를 쓰도록 `components/rich-note.tsx` 한 곳에 둔다. `content`를 글자로 비교하려면 `richNotePlain`을 거칠 것.
- 공용 컴포넌트: `components/confirm-dialog.tsx`(취소+실행 2버튼 확인창), `components/circle-button.tsx`(떠 있는 원형 버튼), `components/chart/chart-card.tsx`(기록 탭 카드 껍데기 `ChartCard`/`ChartBody`), `components/mypage/settings-screen-styles.ts`(설정 화면 공통 여백), `components/rounded-side.tsx`(위나 아래 모서리만 연속 곡률), `components/dashed-border.tsx`(연속 곡률 점선 테두리).
- 계획 작성 폼은 `components/plan-form.tsx` 하나다 — 추가·수정·루틴 추가가 모두 이걸 쓰고, 화면별 차이는 `header`/`extraSheets`/`onLeave` prop으로 넘긴다. 폼을 복사하지 말 것.

### SVG / 폰트

SVG는 `react-native-svg-transformer`로 컴포넌트 import(`metro.config.js`, 타입 `types/svg.d.ts`). 폰트: `fontFamily`에 `"sb-b"`(Bold)·`"sb-m"`(Medium)·`"sb-l"`(Light).

## 플랫폼 분리 (iOS / Android)

**한쪽만 작업할 때는 그쪽 파일만 보면 되게** 나눈다: `git ls-files '*.ios.*'` / `git ls-files '*.android.*'`.

1. **공통 코드는 플랫폼 무관.** 플랫폼마다 동작·UI가 달라야 하는 것만 같은 이름의 쌍(`foo.ios.tsx` / `foo.android.tsx`)으로 나누고 확장자 없이 import한다(Metro가 플랫폼에 맞게 고른다). `Platform.OS`·`Platform.select` 분기는 린트 에러다.
2. **쌍은 export 이름·시그니처가 같아야 한다.** `npm run typecheck`가 iOS 세계(`tsconfig.json`, `moduleSuffixes` .ios 우선)와 Android 세계(`tsconfig.android.json`, .android 우선·`*.ios.*` 제외)를 따로 검사해 어긋나면 잡는다.
3. **한쪽에서 그냥 무시되는 단일 prop은 공통 코드에 둔다** — `borderCurve`, `statusBarTranslucent`, `navigationBarTranslucent`, `android_keyboardInputMode`, `allowsVideoFrameAnalysis`, `headerTitleAlign` 등. 이것 때문에 파일을 쪼개지 않는다.
4. **라우트(`app/`)엔 플랫폼 확장자 금지** — Expo Router는 확장자 없는 fallback 파일을 요구한다. 라우트는 얇게 두고 차이는 `components/` 쌍으로 (예: `(modals)/heart-rate-records.tsx`는 한 줄 re-export).
5. **iOS 전용 단독 모듈**(`.ios`만 있는 파일)은 `.ios` 파일에서만 import한다. 공통 파일이 import하면 Android 번들이 깨진다(typecheck Android 세계에서 걸린다). Android 전용 단독 모듈도 같은 규칙.
6. 쌍은 원래 자리에 나란히 둔다. **쌍을 추가하면 아래 표에 한 줄 추가.**
7. 웹은 지원하지 않는다 (`.web`·기본 파일을 두지 않는다).

| 무엇                         | 파일 (확장자 없이 import)                   | iOS                                   | Android                                                                    |
| ---------------------------- | ------------------------------------------- | ------------------------------------- | -------------------------------------------------------------------------- |
| 헤더·탭바 배경               | `components/bar-background`                 | `BlurView`                            | iOS 블러 실측색으로 불투명                                                 |
| 모달 띄우는 방식             | `components/navigation/modal-presentation`  | `modal` (page sheet, 네이티브 헤더)   | `formSheet`(머티리얼 바텀시트) + JS 시트 헤더(바 색 변형 `modalBarHeader`) |
| 푸시 화면 헤더               | `components/navigation/stack-header`        | 네이티브 내비 바, 계획 폼은 투명+blur | iOS 내비 바 모양 JS 헤더(검색창 포함), 계획 폼은 불투명 바 색              |
| 운동 탭 아이콘               | `components/navigation/workout-tab-icon`    | SF Symbol                             | FontAwesome6 덤벨(가로)                                                    |
| 헤더 기하(바 위치·버튼·제목) | `components/navigation/header-metrics`      | 푸시·모달 보정, 기본값                | iOS 내비 바 자리(안전영역−5⅓, 44)·제목 +3·드로어 제목·포커스 pageY         |
| 검색창 옵션                  | `components/navigation/search-bar-options`  | UISearchController, 목록 상단 110     | 헤더를 목록 위에 겹침, 목록 상단 인셋+48                                   |
| 모달 상태바                  | `components/navigation/modal-status-bar`    | `light` (시트 모달)                   | 없음 (전체화면)                                                            |
| 루트 전용 요소               | `components/platform-root`                  | App Store 업데이트 안내               | 상태바 `auto`·키보드 내리면 포커스 해제·키보드 감시 상시                   |
| 키보드 회피                  | `components/keyboard-avoid`                 | padding(스크롤뷰 안 자름)+시트 오프셋 | padding (edge-to-edge)                                                     |
| 날짜·시간 스피너             | `components/add-plan/date-time-spinner`     | UIDatePicker 스피너                   | JS 휠 (iOS 스피너 실측, `wheel.android`)                                   |
| 목록에서 하나 고르기         | `components/option-picker`                  | 휠 (216)                              | JS 휠 (iOS 휠 실측, `wheel.android`)                                       |
| 글자 배치 보정값             | `constants/text-metrics`                    | 전부 0 (글머리 marginLeft는 점 포함)  | 이모지 섞인 줄·여러 줄 입력칸 첫 줄 보정·리치 노트 글머리 들여쓰기         |
| 뒤로가기로 시트 닫기         | `hooks/use-back-to-close`                   | 없음                                  | `BackHandler`                                                              |
| 전체 노트 서식 툴바 자리     | `components/note-toolbar-dock`              | 키보드 보조 막대(InputAccessoryView)  | 키보드 윗변에 붙임 (`useAnimatedKeyboard`·부모 아래끝 실측)                |
| 메일 앱 열기                 | `lib/open-mail`                             | Gmail → mailto                        | mailto 바로                                                                |
| 광고 단위·추적 동의          | `lib/ads-platform`                          | 실 단위 ID, ATT                       | 실 단위 ID, 없음                                                           |
| AI 요청 앱 헤더              | `lib/ai-client-headers`                     | `X-Ios-Bundle-Identifier`             | 없음                                                                       |
| 사진 저장 권한               | `lib/media-permission`                      | 읽기+쓰기                             | 쓰기 전용                                                                  |
| 심박수 기능 입구             | `components/heart-rate` (index)             | 실제 기능                             | 빈 구현                                                                    |
| 재생 불가 영상 표시          | `components/shorts/unplayable-badge`        | 없음 (네이티브 플레이어가 그린다)     | play.slash 모양 SVG                                                        |
| 로딩 스피너(토스트)          | `components/activity-spinner`               | `ActivityIndicator`                   | iOS 바퀴살 스피너 실측(JS)                                                 |
| 사진 뷰어 상태바             | `components/workout-plan/viewer-status-bar` | 그대로 (시스템이 흰 글자로)           | 흰 글자를 먼저 깔고 한 프레임 뒤 Modal                                     |
| 햅틱                         | `lib/haptics`                               | Taptic API (selection·impact)         | 시스템 햅틱 `performAndroidHapticsAsync` (진동 모터 직접 X)                |

**Android 전용(단독)**: `components/wheel.android.tsx`(iOS 휠을 JS로 — 원통 투영·스냅·햅틱).

**iOS 전용(단독)**: `components/update-dialog.ios.tsx`, `components/heart-rate/*.ios.tsx`, `hooks/use-heart-rate-live-store.ios.tsx`, 네이티브 `modules/heart-rate/`(apple 전용 autolink)·`targets/`(워치·라이브 액티비티).

**심박수는 iOS 전용**(HealthKit·애플워치·에어팟) — Android에선 아예 없다. 공통 코드는 `@/components/heart-rate` 엔트리로만 닿고, Android 엔트리는 같은 이름을 빈 구현(`null`/`false`/no-op)으로 내보낸다. 기록 **데이터**(`hooks/use-heart-rate-store.tsx`)만 공통으로 남긴다 — 백업(`lib/backup.ts`)이 담아서, iOS 백업을 Android에서 복원했다 다시 iOS로 옮겨도 기록이 산다. 측정 상태·네이티브 제어는 `use-heart-rate-live-store.ios.tsx`.

**안드로이드에서 iOS처럼 보이게 — 실제로 걸렸던 것들** (새 화면에도 같은 규칙):

- **플랫폼마다 다른 기본값은 iOS 값을 적어 둔다**(iOS엔 무변화): `TextInput`은 `padding: 0`(안드로이드는 기본 여백이 있어 칸이 커지고 옆 글자가 뜬다), 안내 문구 색은 `placeholderTextColor={themeColor.placeholder}`(iOS 시스템 색), 헤더 제목은 `headerTitleFont`(17pt).
- **좁은 띠·칸 안에서 이모지를 sb 글자와 한 `Text`에 섞지 않는다** — 이모지 글꼴이 줄 높이를 플랫폼·기기마다 다르게 바꾼다. 따로 두고 가운데 정렬(`plan-date-header.tsx`).
- **sb 글꼴에 없는 기호는 대체 글꼴로 그려져** 안드로이드에선 그 줄 아래가 잘린다 — `•`→`·`, `–`→`-`. 새 기호를 쓰면 폰트에 있는지 확인.
- 아이콘 글꼴은 `_layout.tsx`의 `useFonts`에서 미리 불러온다 — 새 아이콘 패밀리를 쓰면 거기 추가(안 하면 처음 뜰 때 빈칸이었다 나타난다).
- **sb 글꼴에 `fontWeight`를 주지 않는다** — sb-*엔 굵은 변형이 없어 iOS는 무시하지만 안드로이드는 가짜 굵게(synthetic bold)를 입혀 글자가 뭉개진다. 굵기는 글꼴(`sb-b`/`sb-m`/`sb-l`)로 고른다.
- **sb 글자 줄 높이는 테마 `Text`가 맞춘다** — 안드로이드는 글꼴 ascent·descent를 픽셀 정수로 올려 줄마다 0.25~0.55 길어져 목록이 아래로 갈수록 밀렸다. `@/components/themed`의 `Text`가 `sbLineHeight`(text-metrics)로 iOS 줄 높이를 명시한다 — 반복되는 목록 행에 RN `Text`를 직접 쓰지 말 것. 아이콘이 줄 높이를 정하는 행은 아이콘에 `style={iconLine(size)}`(text-metrics — 안드로이드 아이콘 박스를 iOS 줄 높이로 못박는다, iOS는 무변화).
- **글자와 섞인 컬러 이모지는 iOS에서만 줄을 키운다** — 같은 줄의 글자와 그 아래가 안드로이드에서 위로 붙는다. 이모지마다 늘어나는 양이 달라 쓰는 곳마다 재서 `constants/text-metrics`의 `EMOJI_LINE_TOP`에 넣는다.
- **헤더 높이는 iOS 내비 바 기하를 따른다**(`header-metrics`·`stack-header`) — 안드로이드 기본 툴바(56dp)를 쓰면 헤더가 12dp 두꺼워 본문이 통째로 내려간다. 투명 헤더(`headerTransparent`/`headerBackground`)를 쓰면 react-navigation이 안드로이드에서 헤더 높이를 56+인셋으로 덮어쓰니(라이브러리 FIXME) `useHeaderHeight()`에 기대지 말 것.
- **RN `Modal` 안의 제스처(gesture-handler)는 그 안에 `GestureHandlerRootView`가 있어야 먹는다**(안드로이드) — `components/dialog.tsx`가 깔아 둔다. 새 Modal에 휠·팬 제스처를 넣으면 같이 깐다.
- **바텀시트(@gorhom) 안의 스크롤뷰는 시트 드래그에 터치를 뺏긴다** — 휠처럼 세로로 끄는 건 짧은 `activeOffsetY`의 팬 제스처로 만든다(`wheel.android`).
- **화면 아래에 붙는 요소는 화면 끝이 아니라 안전영역(탭바·홈 인디케이터) 기준으로 띄운다** — 하단 인셋이 iOS 34 / 안드로이드 24라 화면 끝 고정값이면 안드로이드에서 10 높게 뜬다. 탭 화면 끝 여백은 `useBottomTabBarHeight() + n`, 그 밖은 `insets.bottom ? insets.bottom + n : 원래값`(iPhone 17 Pro 값이 그대로 나오게 n을 고른다).
- **Pressable 안의 네이티브 영상 뷰(expo-video)는 `pointerEvents="none"` View로 감싼다** — 안드로이드 PlayerView가 손가락이 1px만 움직여도 터치 잠금을 요청해 gesture-handler가 JS 터치를 취소한다(실기기 탭이 씹힌다). 네이티브 뷰에 직접 준 pointerEvents는 안드로이드에서 안 먹는다.
- **칸 폭을 잰 폭(onLayout)에서 나눠 flexWrap으로 접지 않는다** — onLayout 값은 픽셀로 반올림돼 실제보다 클 수 있어, 두 칸 합이 넘쳐 둘째 칸이 아랫줄로 떨어졌다(안드로이드 2.625배). 줄을 직접 나누고 칸은 `flex: 1`(`lib/media` `imageRows`).
- **iOS는 시트(`presentation: "modal"`)가 떠 있으면 루트에 둔 RN `Modal`이 안 뜬다**("already presenting" — 그 뒤 앱이 터치를 안 받았다). 시트 화면 위에 띄울 Modal은 그 시트 화면 안에 둔다(사진 뷰어는 `ImageModalHost`).
- **RN `Modal`(안드로이드는 다이얼로그 창)은 열리는 순간 상태바 글자색을 한 번 복사한다** — 모달 위 글자색을 바꾸려면 열기 전에 바꿔 둔다(`viewer-status-bar`). 상태바는 edge-to-edge라 `expo-status-bar`(SystemBars 스택)로만 바꾼다 — RN `StatusBar.pushStackEntry`는 다른 스택이라 닫은 뒤 흰 글자로 남았다.
- **iOS(Fabric)의 `measure`/`measureInWindow` pageY는 투명 헤더·시트 화면에서 보이는 자리보다 크다**(푸시 +헤더 높이, 시트 +102) — pageY로 스크롤 양을 정하면 안드로이드가 덜 올라간다. 계획 폼은 `header-metrics` `focusPageYBias`로 맞춘다. 새로 pageY를 쓰면 같은 차이를 확인할 것.
- **키보드가 뜨기 전에 건 `scrollTo`는 그 순간의 스크롤 끝에서 멈춘다**(두 플랫폼) — 키보드가 아래를 비운 뒤(ScrollView onLayout) 건다(`plan-form.tsx`).
- **2.625배율에선 4·12·36dp처럼 x.5px가 되는 값의 위치가 단계마다 0.19씩 올림된다**(Yoga가 부모 기준 상대 위치를 반올림) — 깊은 폼이 0.3~0.7 내려가는 건 이것이라 고칠 수 없다. 0.7을 넘으면 다른 원인(아이콘 `iconLine` 누락 등)을 찾는다.
- **바텀시트·시트 안 버튼의 아래 여백도 안전영역 기준**(세트 시트·AI 가이드 시트) — 화면 끝 고정값이면 안드로이드에서 10 높고, 3버튼 내비(인셋 48)에선 내비 바에 걸린다.
- **햅틱은 `@/lib/haptics`로** — expo-haptics의 selection·impact는 안드로이드에서 진동 모터를 직접 돌린다.
- 비교는 iOS 시뮬레이터와 안드로이드 에뮬레이터의 같은 화면을 pt/dp로 맞춰 나란히 놓고 본다(verify 스킬 7). 세로 위치는 **안전영역 위끝 기준**으로 맞춘다(iOS 62 / Pixel 6 48.76) — 상태바 높이가 기기마다 달라 절대 좌표는 기준이 못 된다.

**Android 기본값**: edge-to-edge(`android.edgeToEdgeEnabled`) — 창이 키보드에 밀리지 않으니 키보드 회피는 JS(`KeyBoardAvoid`, 바텀시트 `android_keyboardInputMode="adjustResize"`)가 한다. 하드웨어 뒤로가기는 열린 시트·오버레이부터 닫는다(`useBackToClose`) — 새 시트를 만들면 같이 건다. RN `Modal`은 `onRequestClose`가 뒤로가기를 받는다.

## 프로젝트 규칙

- **경로 별칭** `@/*` → 루트. import 순서: React → RN/컴포넌트 → zustand → hooks → lib → expo → icon.
- **파일/폴더** kebab-case. **컴포넌트** PascalCase + arrow function export만, 스타일은 하단 `StyleSheet.create()`. **스토어 파일** `use-*-store.tsx`, export는 `use*Store`. **타입** PascalCase + `Types`(스토어)/`Props`(컴포넌트) 접미사.
- **ID는 `Date.now()`** — 순차 ID 금지(삭제 후 충돌).
- **둥근 모서리는 iOS 연속 곡률로** — `borderRadius` 옆에 `borderCurve: "continuous"`(원·알약은 픽셀이 같아 생략). RN 0.79는 네 모서리 반경이 같고 테두리가 없을(또는 `overflow: "hidden"`) 때만 이걸 지킨다: 테두리가 있으면 `overflow: "hidden"`도 주고, 한쪽 모서리만 둥글면 `RoundedSide`, 점선이면 `DashedBorder`, 바텀시트는 `backgroundStyle`에 넣는다.

### 방어 코딩 (실제 크래시 유발)

- **`findIndex` 결과는 항상 `-1` 가드** — `set((prev)=>...)` 안에서 못 찾으면 `return prev`. (모든 스토어 수정/삭제 액션의 패턴.)
- 배열 spread falsy 방어: `...(imageUri || [])` — `x && (await ...)`류는 `false` 반환 가능.
- **프로덕션에 `console.log` 금지** — catch는 조용히 실패하거나 `toast.error("...")`(sonner-native).

## 주요 라이브러리

`react-native-enriched`(전체 노트 에디터 — **0.4.1 고정**: RN 0.79를 지원하는 마지막 판이다. 0.5+와 후속 `react-native-enriched-html`은 RN 0.81+라 SDK 54 이상으로 올릴 때 옮긴다. 굵게는 sb-m — iOS는 postinstall `scripts/patch-enriched.js`가 sb-l↔sb-m을 잇고(추천 단어 바 끄기도 여기), 안드로이드는 `plugins/with-sb-font-family.js`가 sb-l을 굵기별 패밀리로 등록한다. 버전을 올리면 둘 다 확인할 것 — 패치 목록·남은 작업은 `docs/2026-10-21/README.md`), `@gorhom/bottom-sheet`(바텀시트, `BottomSheetModalProvider`는 `_layout.tsx`에 마운트), `sonner-native`(토스트 — 0.15의 "누르면 안 사라짐" 버그를 postinstall `scripts/patch-sonner-native.js`가 고친다. 버전을 올리면 스크립트를 지울 것), `date-fns`, `react-native-gifted-charts`, `react-native-reanimated`, `@shopify/flash-list`, `react-hook-form`.

컨텍스트 메뉴/드롭다운은 `hooks/use-popover.tsx` + `Modal`(전체 화면 backdrop) 조합을 쓴다. 운동계획 카드의 ⋯ 메뉴는 `components/workout-plan/plan-menu.tsx` 하나만 `_layout.tsx`에 마운트하고, 각 행은 `use-plan-menu-store`에 좌표만 올린다.
