# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

**항상 한국어로 응답합니다.**

## 스킬 (먼저 확인)

`.agents/skills/`에 프로젝트 스킬이 있다. 관련 작업이면 **반드시 해당 `SKILL.md`를 먼저 읽고 따른다.**

- **`expo-native-ui`** — Expo/RN 화면을 만들거나 스타일링·네이티브 컨트롤·아이콘·애니메이션·미디어·차트를 다룰 때. 세부 레시피는 `references/*.md`.
- **`verify`** — 런타임 동작이 바뀌는 변경을 iOS 시뮬레이터에서 눈으로 검증할 때. `/verify` 슬래시 명령으로도 실행.

스킬은 일반 가이드다. **충돌 시 아래 "프로젝트 규칙"이 우선한다** (이 앱은 AsyncStorage를 쓰고, Expo Go가 아닌 dev-client를 쓰며, 테마 색상을 인라인 배열로 주입한다 — 스킬의 반대 조언보다 프로젝트 관행을 따를 것).

## 프로젝트

Pown (포운) — 점진적 과부하 운동 계획·기록 앱. **백엔드 없음**: 모든 데이터를 기기 로컬(AsyncStorage)에 저장하는 오프라인 우선 iOS 앱.

## 명령어

```bash
npm start          # Expo 개발 서버
npm run ios        # iOS 네이티브 빌드 후 실행 (Expo Go 아님, dev-client)
```

테스트 러너는 없다 — 검증은 타입 체크 `npx tsc --noEmit`(strict) + 린트 `npm run lint`(eslint-config-expo, `no-console` error). 둘 다 에러 0을 유지할 것. `ios/`·`android/`는 gitignore(CNG). `.npmrc`에 `legacy-peer-deps=true`.

**배포(EAS)**: `eas build --profile production --platform ios` / JS만 바뀌면 `eas update --channel production`. `appVersionSource:"remote"`. `app.json`의 `version`과 `runtimeVersion`은 **동일하게** 유지해야 OTA가 매칭된다.

## 아키텍처

### Zustand 스토어 = 데이터베이스

백엔드가 없으므로 **`hooks/use-*-store.tsx`가 사실상 DB**다. 두 종류:

- **영속** (`persist` + `createJSONStorage(() => storage)`): 실제 저장 데이터. `use-workout-plan-store`(운동 기록), `use-user-store`(신체정보·테마·3대중량), `use-shorts-store`(숏츠).
- **임시** (`persist` 없는 `create`): 폼·UI 상태. `use-plan-store`(추가/수정 폼), `use-multi-plan-store`(루틴 임시 목록 — 저장 시 workout-plan으로 커밋), `use-note-store`, `use-is-modal-open-store` 등.

**핵심 흐름**: `use-plan-store`(임시 폼)에 입력을 모아 저장 시 `useWorkoutPlanStore.setWorkoutPlan()`으로 영속 리스트에 커밋. `WorkoutPlanTypes`는 `PlanStoreType`을 `Pick`으로 파생 — 한쪽 필드를 바꾸면 다른 쪽도 확인. 모든 영속 스토어는 `@/lib/storage`의 `storage`(AsyncStorage 래퍼)를 통과. 날짜 저장 포맷은 `"yyyy.MM.dd HH:mm:ss"`.

### 라우팅 (Expo Router, typedRoutes)

파일 경로 = URL. 그룹 세그먼트 `(drawer)`·`(tabs)`·`(modals)`는 URL 미포함. 중첩: Drawer > Tabs(workout/calendar/chart/shorts/add), `(modals)`는 `presentation:"modal"`. 진입 화면은 `(drawer)/(tabs)/workout`. catch-all 라우트 다수(`edit-plan/[...slug]` 등). 이동은 `useRouter().push(...)`.

- `usePathname()`은 그룹 세그먼트를 뺀 경로 반환 → 정확히 일치 비교 말고 `pathname.includes("multi-plan")`처럼 유연하게.
- 헤더는 `app/_layout.tsx`의 `Stack.Screen options` 콜백에서 설정. `goBack()` 전에 스토어 reset이 필요하면 순서 주의.

### 테마

`useCurrentThemeColor()`로 색상 객체를 얻어 **인라인 배열 스타일**(`style={[styles.x, { color: themeColor.text }]}`)로 주입. `@/components/Themed`의 `Text`/`View`는 테마 자동 적용 래퍼. 테마 소스는 `use-user-store`의 `theme`(`"system"|"dark"|"light"`), `app/_layout.tsx`에서 `Appearance.setColorScheme` 반영.

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

`@gorhom/bottom-sheet`(바텀시트, `BottomSheetModalProvider`는 `_layout.tsx`에 마운트), `sonner-native`(토스트), `@expo/react-native-action-sheet`, `date-fns`, `react-native-gifted-charts`, `react-native-reanimated`, `@shopify/flash-list`, `react-hook-form`.
