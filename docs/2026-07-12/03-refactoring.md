# 03. 리팩토링 · 코드 품질

동작은 하지만 유지보수·성능·일관성을 위해 손봐야 할 것들. 🔴 높음 / 🟡 중간 / 🟢 낮음.

> ✅ 표시 = 수정 완료 (#5 일부는 2026-07-12, 나머지는 2026-07-14). **12건 전부 수정 완료.**

---

## ✅ 🔴 1. `app/_layout.tsx`(815줄)의 헤더 콜백 안에 저장 로직이 산다 — 수정 완료

- **위치**: `app/_layout.tsx` — `add-plan`(322-394행), `edit-plan`(421-519행), `add-multi-plan`(549-643행)의 `headerRight`
- **문제**:
  - 폼 제출·이미지 저장·단위 변환 같은 핵심 비즈니스 로직이 **레이아웃 파일의 `Stack.Screen options` 콜백 내부**에 있다. 화면 코드를 보러 가면 저장 로직이 없고, 레이아웃을 보면 화면 3개 분량의 로직이 섞여 있다.
  - 헤더 콜백 안에서 훅(`useWorkoutPlanStore` 등)을 호출한다. React Navigation이 이를 컴포넌트로 렌더해 동작은 하지만, ESLint `rules-of-hooks`가 잡을 수 없는 형태이고 콜백을 일반 함수로 리팩토링하는 순간 깨진다.
- **수정 방향**:
  1. 저장 로직을 `hooks/use-submit-plan.ts` 같은 훅(또는 `lib/`)으로 추출.
  2. 각 라우트의 헤더는 해당 화면 파일에서 `<Stack.Screen options={...} />` 또는 `navigation.setOptions`로 선언 — `_layout.tsx`는 공통 스타일만.
- **✅ 처리 내역 (2026-07-14)**: 저장 로직을 5개 화면(`add-plan/[slug]`, `edit-plan/[...slug]`, `workout/add-multi-plan`, `workout/multi-plan`, `(modals)/note`)으로 이동 — 각 화면이 자체 `<Stack.Screen options={{ headerRight }} />`로 저장 버튼을 선언하고, 핸들러는 화면 컴포넌트 안에서 훅을 정상적으로 쓴다. `_layout.tsx`는 공통 스타일·뒤로가기 버튼만 남아 841줄 → 384줄. 파일 상단의 `eslint-disable react-hooks/rules-of-hooks` 예외도 제거. 헤더 뒤로가기의 스토어 reset은 각 화면의 `beforeRemove` 리스너가 이미 담당하고 있어 단순 `goBack()`으로 정리.

## ✅ 🔴 2. 이미지 저장 로직이 3벌 복붙 + 불필요한 전체 라이브러리 조회 — 수정 완료

- **위치**: `app/_layout.tsx:331-353, 444-465, 563-588`
- **문제**:
  - 거의 동일한 30줄짜리 로직이 세 군데 있다 (add / edit / multi-add). edit에만 있는 `/DCIM/` 재저장 방지 처리가 add에는 없는 식으로 미묘하게 어긋나 있기도 하다.
  - 사진 1장마다 `createAssetAsync` → **`getAssetsAsync({ mediaType: "photo" })`로 라이브러리를 통째로 조회** → `find`로 방금 만든 asset을 다시 찾는다. `getAssetsAsync`는 기본 첫 페이지(20개)만 반환하므로 **사진이 많은 기기에서는 못 찾아서 `imageUri: undefined`로 저장**될 수 있고, 성능도 나쁘다.
- **수정**: `createAssetAsync`가 돌려주는 asset으로 바로 `getAssetInfoAsync(asset)`을 호출하면 재조회가 통째로 사라진다. 함수 하나로 추출해 세 곳에서 공유.
- **✅ 처리 내역 (2026-07-14)**: `lib/media.ts`의 `saveImagesToLibrary()`로 추출 — `createAssetAsync` 결과로 바로 `getAssetInfoAsync(asset)`를 호출(전체 라이브러리 조회 제거, 사진 많은 기기에서의 `imageUri: undefined` 저장 위험 해소). `/DCIM/` 재저장 방지도 세 곳 모두 공통 적용. 권한 확인·거부 시 토스트도 함수 안으로 통합. lb→kg 변환도 `convertWeightToKg()`로 함께 공용화.

## ✅ 🟡 3. 운동 탭 스크롤마다 전체 날짜 그룹을 measure — 수정 완료

- **위치**: `app/(drawer)/(tabs)/workout.tsx:94-100` (`handleScroll`)
- **문제**: `scrollEventThrottle={16}`로 매 프레임 `itemRef.current.forEach(... UIManager.measureLayout)` — 날짜 그룹 수만큼 네이티브 measure 호출이 매 프레임 발생한다. 기록이 쌓일수록 스크롤이 무거워진다. `UIManager.measureLayout`은 New Architecture에서 deprecated이기도 하다.
- **수정**: 헤더 타이틀 갱신이 목적이므로 FlatList/FlashList + `onViewableItemsChanged`(viewability 콜백)로 교체하거나, 스크롤 오프셋 → 사전 계산된 섹션 오프셋 비교로 대체. 리스트 자체도 ScrollView + 전체 map이라 기록이 많아지면 가상화가 필요하다.
- **✅ 처리 내역 (2026-07-14)**: 섹션 오프셋 비교 방식으로 교체 — 날짜 그룹의 y를 `onLayout`에서 한 번 기록해두고 스크롤 시에는 숫자 비교만 한다. `UIManager.measureLayout`/`findNodeHandle`/`RefView` 전부 제거, 드로어 날짜 이동 스크롤도 같은 오프셋 맵 사용. ※ 리스트 가상화(FlashList 전환)는 별도 과제로 남김.

## ✅ 🟡 4. 정렬·중복제거 유틸의 성능과 중복 — 수정 완료

- **위치**: `lib/function.ts:245-273` (`removeSameItem` — `findIndex` 중첩으로 O(n²)), `hooks/use-chart-store.tsx:23-36` (정렬+2단 dedupe)
- **문제**: 기록 수백 건 수준에선 티가 안 나지만, 날짜 키 기반 Map으로 바꾸면 O(n)이고 의도도 명확해진다. `createdAt` 파싱 정렬 로직이 스토어·차트·함수 곳곳에 반복된다.
- **수정**: `lib/date.ts`에 `parsePlanDate`, `sortByCreatedAtDesc` 같은 공용 유틸을 만들어 공유.
- **✅ 처리 내역 (2026-07-14)**: `lib/date.ts` 신설(`PLAN_DATE_FORMAT`, `parsePlanDate`, `sortByCreatedAtDesc`) — workout-plan 스토어와 `lib/function.ts`가 공유. `removeSameItem`은 날짜 키 Map 기반 O(n)으로 재작성. 차트 스토어의 정렬+2단 dedupe는 [02 #8](./02-ux-ui.md) 수정으로 통째로 사라짐.

## ✅ 🟡 5. 파일·컴포넌트 네이밍 컨벤션이 문서와 어긋남 — 수정 완료

- **문제**:
  - CLAUDE.md는 "파일 kebab-case"인데 `components/Themed.tsx`, `Button.tsx`, `Dialog.tsx`, `IconTitle.tsx`, `KeyBoardAvoid.tsx`, `RefView.tsx`, `SetCounterSheet.tsx`, `StyledText.tsx`가 PascalCase.
  - ~~화면 컴포넌트 이름이 소문자다: `calendar()`, `chart()`, `note()`, `settings()`, `calendarWorkout()` — React 컴포넌트는 PascalCase여야 하고 lint 도입 시 전부 걸린다.~~ → **✅ 2026-07-12 수정 완료**: 린터 도입([04 #4](./04-dependencies-config.md)) 때 6개 화면(`calculate` 포함) 전부 PascalCase로 변경.
  - default export(차트 컴포넌트, FabOverlay, ImageModal)와 named export(나머지)가 혼재 — CLAUDE.md 규칙은 named.
- **수정**: 한 번에 갈아엎기보다 lint 규칙을 넣고 만질 때마다 정리.
- **✅ 처리 내역 (2026-07-14)**: 남은 두 항목도 처리 —
  - PascalCase 파일 7개를 kebab-case로 리네임(`themed`, `button`, `dialog`, `icon-title`, `icon-title-button`, `keyboard-avoid`, `set-counter-sheet`; `StyledText`·`RefView`는 미사용이라 삭제). 60여 파일의 import 경로 일괄 갱신.
  - default export였던 차트 8개·`FabOverlay`·`ImageModal`을 named export로 전환, `components/chart/index.ts` 배럴도 re-export로 정리. (화면 파일은 expo-router 요구사항상 default export 유지.)

## ✅ 🟡 6. typed routes를 우회하는 캐스트 — 수정 완료

- **위치**: `app/(drawer)/(tabs)/calendar.tsx:97-100` (`router.push({...} as any)` + `params: { data: JSON.stringify(...) }`), `app/add-plan/camera.tsx:52` (`source={{ uri } as any}`)
- **문제**: 운동 기록 배열(이미지 경로 포함)을 **JSON 문자열로 라우트 파라미터에 실어** 모달에 넘긴다. 동작은 하지만 typedRoutes의 타입 보호를 `as any`로 끄고 있고, 파라미터 크기 제한/인코딩 이슈에 노출된다.
- **수정**: 날짜(`yyyy.MM.dd`)만 파라미터로 넘기고 모달에서 스토어를 직접 필터링하면 캐스트도 직렬화도 필요 없다.
- **✅ 처리 내역 (2026-07-14)**: 캘린더는 `date`(yyyy.MM.dd)만 파라미터로 전달하고 `calendar-workout` 모달이 `useWorkoutPlanStore`를 직접 필터링 — `as any`와 JSON 직렬화 모두 제거. `camera.tsx`의 `source={{ uri } as any}`도 `uri ?? undefined`로 캐스트 제거. typedRoutes 생성 후 `tsc --noEmit` 통과 확인.

## ✅ 🟡 7. `usePlanStore.setPrevPlanValue`가 `weightType`을 복원하지 않음 — 수정 완료

- **위치**: `hooks/use-plan-store.tsx:132-144`
- **문제**: 수정 화면 진입 시 폼을 프리필하는 함수인데 `weightType` 필드가 빠져 있다. 저장은 항상 kg으로 변환되므로 현재는 실질 버그가 아니지만, lb 상태 유지가 필요해지는 순간 터지는 함정이다. 필드를 하나 추가할 때 `PlanStoreType` ↔ `WorkoutPlanTypes`(Pick 파생) ↔ `setPrevPlanValue` 세 곳을 다 만져야 하는 구조 자체가 취약하다.
- **수정**: `setPrevPlanValue: (v) => set((prev) => ({ ...prev, ...v }))`처럼 스프레드 기반으로 단순화.
- **✅ 처리 내역 (2026-07-14)**: 스프레드 기반으로 교체 + 타입의 Pick 목록에 `weightType` 추가 — 이제 필드를 추가해도 이 함수는 손댈 필요가 없다.

## ✅ 🟢 8. 테마 접근 방식 혼재 — 수정 완료

- **위치**: `components/SetCounterSheet.tsx` (`Colors[colorScheme ?? "light"]` 직접 접근 ×10회), `components/chart/chart-header.tsx` (react-native의 deprecated `SafeAreaView` import)
- **문제**: 나머지 코드는 전부 `useCurrentThemeColor()`를 쓴다. SafeAreaView도 다른 곳은 `react-native-safe-area-context`.
- **수정**: 두 파일만 맞춰주면 된다.
- **✅ 처리 내역 (2026-07-14)**: `SetCounterSheet`(현 `set-counter-sheet.tsx`)는 `useCurrentThemeColor()`로 통일, `chart-header`는 `react-native-safe-area-context`의 `SafeAreaView`(edges top)로 교체.

## ✅ 🟢 9. `styles(themeColor)` 패턴 — 매 렌더 StyleSheet.create — 수정 완료

- **위치**: `calendar.tsx`, `calculate.tsx`, `calendar-workout.tsx`, 차트 컴포넌트 전반
- **문제**: 렌더마다 `StyleSheet.create`를 새로 호출한다. 성능 영향은 작지만, 프로젝트 표준(정적 StyleSheet + 인라인 배열로 색 주입)과 다른 세 번째 패턴이 섞여 있는 게 더 문제.
- **✅ 처리 내역 (2026-07-14)**: 해당 10개 파일(`calendar`, `calculate`, `calendar-workout` + 차트 7개) 전부 정적 `StyleSheet.create` + 인라인 배열 색 주입으로 통일. `styles = (color: any)`도 함께 사라져 [#12]의 any 두 곳이 자동 해소.

## ✅ 🟢 10. `Themed.Text`의 전역 `marginTop: 2` — 수정 완료

- **위치**: `components/Themed.tsx:37`
- **문제**: 모든 텍스트에 마진 2를 강제한다. 폰트 베이스라인 보정 목적으로 보이는데, 정렬이 미묘하게 어긋나는 원인이 되고 개별 화면에서 원인 추적이 어렵다. `lineHeight` 지정이 정석.
- **✅ 처리 내역 (2026-07-14)**: 전역 `marginTop: 2` 제거(`components/themed.tsx`). 베이스라인 보정이 필요한 곳은 개별 스타일에서 `lineHeight`로 처리할 것.

## ✅ 🟢 11. 죽은 코드 정리 목록 — 수정 완료

- **미사용 파일**: `components/swiper.tsx`, `components/StyledText.tsx`, `hooks/use-animated-header-title.tsx`, `hooks/use-keyboard-visible.tsx`
- **미사용 심볼**: `constants/constants.ts`의 `planData`, `Colors.ts`의 `tintColorLight`/`tintColorDark`, `workout.tsx`의 `onResetPlanList`·`open` 미사용 구독, `_layout.tsx` 헤더 콜백들의 `workoutPlanList` 미사용 구독
- **주석 덩어리**: `sign-in.tsx:197-222`(supabase), `sbd-chart.tsx:154-161`, `shorts/[...slug]` 화면의 `_layout.tsx:790-797` 주석 옵션
- **의미**: 미사용 스토어 구독(`workoutPlanList` 등)은 단순 죽은 코드가 아니라 **불필요한 리렌더**를 유발한다.
- **✅ 처리 내역 (2026-07-14)**: 미사용 파일 4종 + `RefView`(#3 수정으로 미사용화) 삭제, `sign-in.tsx`는 화면째 삭제([02 #12](./02-ux-ui.md)). `planData`·`tintColorLight`/`tintColorDark`·`sbd-chart` 주석·`_layout.tsx` 주석 옵션 삭제. `workout.tsx`의 `onResetPlanList` 구독과 미사용 아이콘 import, `search.tsx`의 `usePlanStore` 구독, `_layout.tsx` 헤더 콜백의 `workoutPlanList` 구독(#1 수정으로 소멸) 제거. ※ `workout.tsx`의 `open` 구독은 실제 사용 중(모달 열림 시 스크롤 최상단)이라 유지.

## ✅ 🟢 12. `onOpenWorkoutModal(findItem: any)` 등 남은 any — 수정 완료

- **위치**: `app/(drawer)/(tabs)/calendar.tsx:53`, `app/(drawer)/_layout.tsx:21` (`props: any`), `styles = (color: any)`(calendar/calculate)
- **수정**: `WorkoutPlanTypes | undefined`, `DrawerContentComponentProps`, `ThemeColorType`(이미 존재)으로 교체. strict 모드의 이점을 살리려면 any 유입 지점을 막아야 한다.
- **✅ 처리 내역 (2026-07-14)**: `calendar.tsx`의 `findItem`은 [01 #13] 때 이미 `WorkoutPlanTypes | undefined`로 처리됨. 이번에 `(drawer)/_layout.tsx`의 `props: any` → `DrawerContentComponentProps`, `styles = (color: any)` 두 곳은 #9 정적화로 소멸, `search.tsx`의 `onChangeText (e: any)`도 이벤트 타입 지정.
