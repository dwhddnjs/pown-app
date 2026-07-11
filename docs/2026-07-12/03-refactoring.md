# 03. 리팩토링 · 코드 품질

동작은 하지만 유지보수·성능·일관성을 위해 손봐야 할 것들. 🔴 높음 / 🟡 중간 / 🟢 낮음.

---

## 🔴 1. `app/_layout.tsx`(815줄)의 헤더 콜백 안에 저장 로직이 산다

- **위치**: `app/_layout.tsx` — `add-plan`(322-394행), `edit-plan`(421-519행), `add-multi-plan`(549-643행)의 `headerRight`
- **문제**:
  - 폼 제출·이미지 저장·단위 변환 같은 핵심 비즈니스 로직이 **레이아웃 파일의 `Stack.Screen options` 콜백 내부**에 있다. 화면 코드를 보러 가면 저장 로직이 없고, 레이아웃을 보면 화면 3개 분량의 로직이 섞여 있다.
  - 헤더 콜백 안에서 훅(`useWorkoutPlanStore` 등)을 호출한다. React Navigation이 이를 컴포넌트로 렌더해 동작은 하지만, ESLint `rules-of-hooks`가 잡을 수 없는 형태이고 콜백을 일반 함수로 리팩토링하는 순간 깨진다.
- **수정 방향**:
  1. 저장 로직을 `hooks/use-submit-plan.ts` 같은 훅(또는 `lib/`)으로 추출.
  2. 각 라우트의 헤더는 해당 화면 파일에서 `<Stack.Screen options={...} />` 또는 `navigation.setOptions`로 선언 — `_layout.tsx`는 공통 스타일만.

## 🔴 2. 이미지 저장 로직이 3벌 복붙 + 불필요한 전체 라이브러리 조회

- **위치**: `app/_layout.tsx:331-353, 444-465, 563-588`
- **문제**:
  - 거의 동일한 30줄짜리 로직이 세 군데 있다 (add / edit / multi-add). edit에만 있는 `/DCIM/` 재저장 방지 처리가 add에는 없는 식으로 미묘하게 어긋나 있기도 하다.
  - 사진 1장마다 `createAssetAsync` → **`getAssetsAsync({ mediaType: "photo" })`로 라이브러리를 통째로 조회** → `find`로 방금 만든 asset을 다시 찾는다. `getAssetsAsync`는 기본 첫 페이지(20개)만 반환하므로 **사진이 많은 기기에서는 못 찾아서 `imageUri: undefined`로 저장**될 수 있고, 성능도 나쁘다.
- **수정**: `createAssetAsync`가 돌려주는 asset으로 바로 `getAssetInfoAsync(asset)`을 호출하면 재조회가 통째로 사라진다. 함수 하나로 추출해 세 곳에서 공유.

## 🟡 3. 운동 탭 스크롤마다 전체 날짜 그룹을 measure

- **위치**: `app/(drawer)/(tabs)/workout.tsx:94-100` (`handleScroll`)
- **문제**: `scrollEventThrottle={16}`로 매 프레임 `itemRef.current.forEach(... UIManager.measureLayout)` — 날짜 그룹 수만큼 네이티브 measure 호출이 매 프레임 발생한다. 기록이 쌓일수록 스크롤이 무거워진다. `UIManager.measureLayout`은 New Architecture에서 deprecated이기도 하다.
- **수정**: 헤더 타이틀 갱신이 목적이므로 FlatList/FlashList + `onViewableItemsChanged`(viewability 콜백)로 교체하거나, 스크롤 오프셋 → 사전 계산된 섹션 오프셋 비교로 대체. 리스트 자체도 ScrollView + 전체 map이라 기록이 많아지면 가상화가 필요하다.

## 🟡 4. 정렬·중복제거 유틸의 성능과 중복

- **위치**: `lib/function.ts:245-273` (`removeSameItem` — `findIndex` 중첩으로 O(n²)), `hooks/use-chart-store.tsx:23-36` (정렬+2단 dedupe)
- **문제**: 기록 수백 건 수준에선 티가 안 나지만, 날짜 키 기반 Map으로 바꾸면 O(n)이고 의도도 명확해진다. `createdAt` 파싱 정렬 로직이 스토어·차트·함수 곳곳에 반복된다.
- **수정**: `lib/date.ts`에 `parsePlanDate`, `sortByCreatedAtDesc` 같은 공용 유틸을 만들어 공유.

## 🟡 5. 파일·컴포넌트 네이밍 컨벤션이 문서와 어긋남

- **문제**:
  - CLAUDE.md는 "파일 kebab-case"인데 `components/Themed.tsx`, `Button.tsx`, `Dialog.tsx`, `IconTitle.tsx`, `KeyBoardAvoid.tsx`, `RefView.tsx`, `SetCounterSheet.tsx`, `StyledText.tsx`가 PascalCase.
  - ~~화면 컴포넌트 이름이 소문자다: `calendar()`, `chart()`, `note()`, `settings()`, `calendarWorkout()` — React 컴포넌트는 PascalCase여야 하고 lint 도입 시 전부 걸린다.~~ → **✅ 2026-07-12 수정 완료**: 린터 도입([04 #4](./04-dependencies-config.md)) 때 6개 화면(`calculate` 포함) 전부 PascalCase로 변경.
  - default export(차트 컴포넌트, FabOverlay, ImageModal)와 named export(나머지)가 혼재 — CLAUDE.md 규칙은 named.
- **수정**: 한 번에 갈아엎기보다 lint 규칙을 넣고 만질 때마다 정리.

## 🟡 6. typed routes를 우회하는 캐스트

- **위치**: `app/(drawer)/(tabs)/calendar.tsx:97-100` (`router.push({...} as any)` + `params: { data: JSON.stringify(...) }`), `app/add-plan/camera.tsx:52` (`source={{ uri } as any}`)
- **문제**: 운동 기록 배열(이미지 경로 포함)을 **JSON 문자열로 라우트 파라미터에 실어** 모달에 넘긴다. 동작은 하지만 typedRoutes의 타입 보호를 `as any`로 끄고 있고, 파라미터 크기 제한/인코딩 이슈에 노출된다.
- **수정**: 날짜(`yyyy.MM.dd`)만 파라미터로 넘기고 모달에서 스토어를 직접 필터링하면 캐스트도 직렬화도 필요 없다.

## 🟡 7. `usePlanStore.setPrevPlanValue`가 `weightType`을 복원하지 않음

- **위치**: `hooks/use-plan-store.tsx:132-144`
- **문제**: 수정 화면 진입 시 폼을 프리필하는 함수인데 `weightType` 필드가 빠져 있다. 저장은 항상 kg으로 변환되므로 현재는 실질 버그가 아니지만, lb 상태 유지가 필요해지는 순간 터지는 함정이다. 필드를 하나 추가할 때 `PlanStoreType` ↔ `WorkoutPlanTypes`(Pick 파생) ↔ `setPrevPlanValue` 세 곳을 다 만져야 하는 구조 자체가 취약하다.
- **수정**: `setPrevPlanValue: (v) => set((prev) => ({ ...prev, ...v }))`처럼 스프레드 기반으로 단순화.

## 🟢 8. 테마 접근 방식 혼재

- **위치**: `components/SetCounterSheet.tsx` (`Colors[colorScheme ?? "light"]` 직접 접근 ×10회), `components/chart/chart-header.tsx` (react-native의 deprecated `SafeAreaView` import)
- **문제**: 나머지 코드는 전부 `useCurrentThemeColor()`를 쓴다. SafeAreaView도 다른 곳은 `react-native-safe-area-context`.
- **수정**: 두 파일만 맞춰주면 된다.

## 🟢 9. `styles(themeColor)` 패턴 — 매 렌더 StyleSheet.create

- **위치**: `calendar.tsx`, `calculate.tsx`, `calendar-workout.tsx`, 차트 컴포넌트 전반
- **문제**: 렌더마다 `StyleSheet.create`를 새로 호출한다. 성능 영향은 작지만, 프로젝트 표준(정적 StyleSheet + 인라인 배열로 색 주입)과 다른 세 번째 패턴이 섞여 있는 게 더 문제.

## 🟢 10. `Themed.Text`의 전역 `marginTop: 2`

- **위치**: `components/Themed.tsx:37`
- **문제**: 모든 텍스트에 마진 2를 강제한다. 폰트 베이스라인 보정 목적으로 보이는데, 정렬이 미묘하게 어긋나는 원인이 되고 개별 화면에서 원인 추적이 어렵다. `lineHeight` 지정이 정석.

## 🟢 11. 죽은 코드 정리 목록

- **미사용 파일**: `components/swiper.tsx`, `components/StyledText.tsx`, `hooks/use-animated-header-title.tsx`, `hooks/use-keyboard-visible.tsx`
- **미사용 심볼**: `constants/constants.ts`의 `planData`, `Colors.ts`의 `tintColorLight`/`tintColorDark`, `workout.tsx`의 `onResetPlanList`·`open` 미사용 구독, `_layout.tsx` 헤더 콜백들의 `workoutPlanList` 미사용 구독
- **주석 덩어리**: `sign-in.tsx:197-222`(supabase), `sbd-chart.tsx:154-161`, `shorts/[...slug]` 화면의 `_layout.tsx:790-797` 주석 옵션
- **의미**: 미사용 스토어 구독(`workoutPlanList` 등)은 단순 죽은 코드가 아니라 **불필요한 리렌더**를 유발한다.

## 🟢 12. `onOpenWorkoutModal(findItem: any)` 등 남은 any

- **위치**: `app/(drawer)/(tabs)/calendar.tsx:53`, `app/(drawer)/_layout.tsx:21` (`props: any`), `styles = (color: any)`(calendar/calculate)
- **수정**: `WorkoutPlanTypes | undefined`, `DrawerContentComponentProps`, `ThemeColorType`(이미 존재)으로 교체. strict 모드의 이점을 살리려면 any 유입 지점을 막아야 한다.
