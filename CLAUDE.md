# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

**항상 한국어로 응답합니다.**

## 스킬 (먼저 확인)

`.agents/skills/`에 프로젝트 스킬이 있다. 관련 작업이면 **반드시 해당 `SKILL.md`를 먼저 읽고 따른다.**

- **`expo-native-ui`** — Expo/RN 화면을 만들거나 스타일링·네이티브 컨트롤·아이콘·애니메이션·미디어·차트를 다룰 때. 세부 레시피는 `references/*.md`.
- **`verify`** — 런타임 동작이 바뀌는 변경을 iOS 시뮬레이터에서 눈으로 검증할 때. `/verify` 슬래시 명령으로도 실행.

스킬은 일반 가이드다. **충돌 시 아래 "프로젝트 규칙"이 우선한다** (이 앱은 MMKV(`react-native-mmkv`)를 쓰고, Expo Go가 아닌 dev-client를 쓰며, 테마 색상을 인라인 배열로 주입한다 — 스킬의 반대 조언보다 프로젝트 관행을 따를 것).

## 프로젝트

Pown (포운) — 점진적 과부하 운동 계획·기록 앱. **백엔드 없음**: 모든 데이터를 기기 로컬(MMKV)에 저장하는 오프라인 우선 iOS 앱.

## 명령어

```bash
npm start          # Expo 개발 서버
npm run ios        # iOS 네이티브 빌드 후 실행 (Expo Go 아님, dev-client)
```

테스트 러너는 없다 — 검증은 타입 체크 `npx tsc --noEmit`(strict) + 린트 `npm run lint`(eslint-config-expo, `no-console` error). 둘 다 에러 0을 유지할 것. 포맷은 prettier(`npm run format`, 설정은 `.prettierrc`: 세미콜론 + trailing comma all) — 커밋 전에 돌린다. `ios/`·`android/`는 gitignore(CNG). `.npmrc`에 `legacy-peer-deps=true`.

**배포(EAS)**: `eas build --profile production --platform ios` / JS만 바뀌면 `eas update --channel production`. `appVersionSource:"remote"`. `app.json`의 `version`과 `runtimeVersion`은 **동일하게** 유지해야 OTA가 매칭된다.
**네이티브 의존성이 바뀐 릴리스는 OTA 금지** — 옛 바이너리에 새 JS가 내려가 실행 즉시 죽는다. 두 버전을 올리고 새로 빌드할 것.

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
- 공용 컴포넌트: `components/confirm-dialog.tsx`(취소+실행 2버튼 확인창), `components/circle-button.tsx`(떠 있는 원형 버튼), `components/chart/chart-card.tsx`(기록 탭 카드 껍데기 `ChartCard`/`ChartBody`), `components/mypage/settings-screen-styles.ts`(설정 화면 공통 여백).
- 계획 작성 폼은 `components/plan-form.tsx` 하나다 — 추가·수정·루틴 추가가 모두 이걸 쓰고, 화면별 차이는 `header`/`extraSheets`/`onLeave` prop으로 넘긴다. 폼을 복사하지 말 것.

### SVG / 폰트

SVG는 `react-native-svg-transformer`로 컴포넌트 import(`metro.config.js`, 타입 `types/svg.d.ts`). 폰트: `fontFamily`에 `"sb-b"`(Bold)·`"sb-m"`(Medium)·`"sb-l"`(Light).

## 프로젝트 규칙

- **경로 별칭** `@/*` → 루트. import 순서: React → RN/컴포넌트 → zustand → hooks → lib → expo → icon.
- **파일/폴더** kebab-case. **컴포넌트** PascalCase + arrow function export만, 스타일은 하단 `StyleSheet.create()`. **스토어 파일** `use-*-store.tsx`, export는 `use*Store`. **타입** PascalCase + `Types`(스토어)/`Props`(컴포넌트) 접미사.
- **ID는 `Date.now()`** — 순차 ID 금지(삭제 후 충돌).

### 방어 코딩 (실제 크래시 유발)

- **`findIndex` 결과는 항상 `-1` 가드** — `set((prev)=>...)` 안에서 못 찾으면 `return prev`. (모든 스토어 수정/삭제 액션의 패턴.)
- 배열 spread falsy 방어: `...(imageUri || [])` — `x && (await ...)`류는 `false` 반환 가능.
- **프로덕션에 `console.log` 금지** — catch는 조용히 실패하거나 `toast.error("...")`(sonner-native).

## 주요 라이브러리

`@gorhom/bottom-sheet`(바텀시트, `BottomSheetModalProvider`는 `_layout.tsx`에 마운트), `sonner-native`(토스트), `date-fns`, `react-native-gifted-charts`, `react-native-reanimated`, `@shopify/flash-list`, `react-hook-form`.

컨텍스트 메뉴/드롭다운은 `hooks/use-popover.tsx` + `Modal`(전체 화면 backdrop) 조합을 쓴다. 운동계획 카드의 ⋯ 메뉴는 `components/workout-plan/plan-menu.tsx` 하나만 `_layout.tsx`에 마운트하고, 각 행은 `use-plan-menu-store`에 좌표만 올린다.
