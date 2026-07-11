# 01. 버그 · 크래시 위험

실제 동작이 잘못되거나 크래시로 이어질 수 있는 문제들. 🔴 높음 / 🟡 중간 / 🟢 낮음.

> ✅ 표시 = 2026-07-12 수정 완료. **18건 전부 수정 완료** — 단, #11의 3번(백업 범위 확대)만 별도 결정 필요로 미처리.

---

## ✅ 🔴 1. 타입 체크 명령이 아예 실행되지 않음 — 수정 완료

- **위치**: `package.json` (`typescript: ~5.3.3`)
- **증상**: `npx tsc --noEmit` 실행 시
  `error TS6046: Argument for '--module' option must be ...` 로 즉시 실패.
  Expo SDK 53의 `expo/tsconfig.base.json`이 `"module": "preserve"`(TS 5.4+ 전용)를 쓰는데 프로젝트는 TS 5.3.3이라 옵션 자체를 모른다.
- **의미**: 이 프로젝트의 유일한 검증 수단(strict 타입 체크)이 죽어 있었다는 뜻.
- **수정**: `typescript`를 `~5.8.3`(SDK 53 권장)으로 업그레이드.
  참고로 TS 5.8.3으로 실제 검사해 본 결과 **에러 0개**로 깨끗하게 통과한다. 업그레이드에 따르는 후속 수정은 없다.
- **✅ 처리 내역**: `typescript ~5.8.3` 설치 완료, `npx tsc --noEmit` 통과 확인.

## ✅ 🔴 2. 세트 ID 중복 — 완료 버튼이 다른 세트까지 완료시킴 — 수정 완료

- **위치**: `components/SetCounterSheet.tsx:35` (`id: setWithCount.length + 1`)
- **재현**: 세트 3개 추가(id 1,2,3) → 1번 세트 삭제 → 세트 하나 더 추가 → 새 세트 id가 `length+1 = 3`으로 **기존 3번과 중복**.
  - 저장 후 운동 탭에서 한쪽 세트의 "완료"를 누르면 `setCompleteProgress`가 `item.id === itemId`로 매칭하므로 **같은 id의 세트 두 개가 동시에 완료** 처리됨 (`hooks/use-workout-plan-store.tsx:51-61`).
  - React key도 충돌한다 (`components/workout-plan/workout-plan.tsx:222`).
- **수정**: CLAUDE.md 규칙대로 `id: Date.now()` 사용. (수정 화면 저장 시에는 `app/_layout.tsx:487-490`에서 index 기반으로 재부여하고 있는데, 이 역시 같은 규칙으로 통일 권장)
- **참고**: 같은 순차 ID 패턴이 `app/add-plan/camera.tsx:36`(사진), `app/shorts/video.tsx:75`(숏츠)에도 있다.
- **✅ 처리 내역**: 세트(`SetCounterSheet`)·사진(`camera.tsx`)·숏츠(`video.tsx`) 모두 `Date.now()` ID로 교체. `edit-plan` 저장 시 index 기반 재부여도 제거하고 원본 ID를 유지하도록 통일.

## ✅ 🔴 3. "전체노트 열기"가 작성한 노트를 삭제함 — 수정 완료

- **위치**: `components/add-plan/plan-note.tsx:34` — `<Link onPress={() => setPlanValue("content", "")}>`
- **문제 3가지**:
  1. 퀵노트에 뭔가 입력한 상태에서 "전체노트 열기"를 누르면 **입력 내용이 즉시 삭제**된다.
  2. **수정 화면**에서 열면 기존에 저장돼 있던 노트 content가 지워진 채 시작하고, 노트 모달은 `useNoteStore`(빈 값)를 보여주므로 체크 버튼을 누르면 **기존 title/content가 빈 문자열로 덮어써진다** (`app/_layout.tsx:275-295`).
  3. 노트 모달에서 글을 쓰다가 **X로 닫으면 `useNoteStore`가 리셋되지 않아**, 다음에 다른 운동을 추가할 때 이전 노트 내용이 그대로 남아 있다.
- **수정 방향**: (a) Link의 `onPress` 제거, (b) 노트 모달 진입 시 `usePlanStore`의 title/content로 `useNoteStore`를 프리필, (c) 모달 `beforeRemove`(또는 X 버튼)에서 noteStore 리셋.
- **✅ 처리 내역**: (a)(b)(c) 모두 적용 — `plan-note.tsx`의 content 삭제 onPress 제거, `note.tsx` 마운트 시 planStore 값 프리필, 언마운트(저장/취소 공통)에서 noteStore 리셋.

## ✅ 🟡 4. 리스트 정렬 기준이 액션마다 달라 순서가 튐 — 수정 완료

- **위치**: `hooks/use-workout-plan-store.tsx`
  - `setWorkoutPlan`(추가): `createdAt` 기준 정렬 (36-40행)
  - `setCompleteProgress`(세트 완료): `b.id - a.id` 즉 **생성 시각 기준** 정렬 (69행)
  - `setEditPlan`(수정): `b.id - a.id` (87-89행)
- **재현**: 날짜 선택 기능으로 **과거 날짜의 기록을 나중에 추가**하면, 추가 직후엔 날짜순으로 올바르게 정렬되지만 아무 세트나 "완료"를 누르는 순간 전체 리스트가 id순으로 재정렬되어 **날짜 그룹 순서가 뒤바뀐다**.
- **수정**: 세 액션 모두 `createdAt` 파싱 기준으로 통일 (정렬 함수를 하나 추출해서 공유).
- **✅ 처리 내역**: `sortByCreatedAt` 헬퍼를 추출해 `setWorkoutPlan`·`setCompleteProgress`·`setEditPlan` 세 액션이 공유하도록 통일. `as WorkoutPlanTypes[]` 캐스트도 제거(진짜 타입 에러가 하나 숨어 있어 `as const`로 해결).

## ✅ 🟡 5. FAB 메뉴를 닫은 직후 첫 탭이 먹힘 (투명 오버레이 잔존) — 수정 완료

- **위치**: `components/fab-menu/fab-overlay.tsx:72` — `if (!isOpen && progress.value === 0) return null`
- **원리**: 닫기 시점의 리렌더에서는 `progress.value`가 아직 1이라 컴포넌트가 언마운트되지 않고, 애니메이션이 끝나도 리렌더가 없어 **투명한 전체 화면 Pressable이 남는다**. 다음 탭은 이 Pressable이 삼키고(그 탭이 유발한 리렌더로 그제야 언마운트), 사용자는 "버튼이 한 번 씹혔다"고 느낀다.
- **부가 문제**: 렌더 중 `progress.value`(SharedValue)를 읽는 것은 Reanimated 안티패턴.
- **수정**: `isOpen`이 false면 컨테이너에 `pointerEvents: "none"`을 주거나, `withTiming` 완료 콜백에서 `runOnJS`로 마운트 상태 state를 내리기.
- **✅ 처리 내역**: `mounted` state 도입 — 열릴 때 마운트, `withTiming` 완료 콜백에서 `runOnJS(setMounted)(false)`로 언마운트. 렌더 중 `progress.value` 읽기 제거, 닫히는 동안에도 오버레이에 `pointerEvents: "none"`을 줘 탭이 씹히지 않게 함.

## ✅ 🟡 6. 숏츠 영상·썸네일이 캐시 경로로 저장됨 — 나중에 재생 불가 위험 — 수정 완료

- **위치**: `app/shorts/video.tsx:68-88`
- **문제**: `recordAsync()`가 돌려주는 **앱 캐시 디렉터리 URI**를 그대로 `useShortsStore`(영속)에 저장한다. `MediaLibrary.createAssetAsync(uri)`로 사진 앱에도 저장은 하지만 **그 asset의 URI는 버린다**. iOS가 캐시를 정리하거나 앱을 업데이트하면 저장된 경로가 무효가 되어 숏츠 탭의 영상이 재생되지 않는다. 썸네일(`getThumbnailAsync` 결과)도 마찬가지로 캐시 경로다.
- **수정**: `createAssetAsync` 결과의 `localUri`(운동 사진 저장 로직과 동일한 방식)를 저장하거나, `FileSystem.documentDirectory`로 복사 후 그 경로를 저장.
- **✅ 처리 내역**: 영상은 `createAssetAsync` → `getAssetInfoAsync`의 `localUri` 저장, 썸네일은 `documentDirectory`로 `copyAsync` 후 그 경로 저장.

## ✅ 🟡 7. 15초 미만 숏츠는 썸네일 생성이 실패할 수 있음 — 수정 완료

- **위치**: `app/shorts/video.tsx:71-73` — `getThumbnailAsync(uri, { time: 15000 })`
- **문제**: 영상 길이와 무관하게 15초 지점을 요청한다. 짧은 영상이면 예외로 빠져 catch의 "숏츠 저장 중 오류" 토스트가 뜨고 저장 자체가 안 된다.
- **수정**: `time: 0` 또는 영상 길이의 중간 지점 사용.
- **✅ 처리 내역**: `time: 0`으로 변경 — 어떤 길이의 영상이든 썸네일 생성이 실패하지 않는다.

## ✅ 🟡 8. 비표준 날짜 파싱 — 엔진에 따라 Invalid Date 가능 — 수정 완료

- **위치**: `lib/function.ts:55` (`transformWorkoutData`)
- **문제**: `new Date("2025-01-05 10:00:00".replaceAll(...))` — 공백 구분 날짜 문자열은 ECMA 표준 포맷이 아니라 **엔진 구현에 따라 결과가 다르다**. 지금 Hermes에선 동작하더라도 보장이 없다. 프로젝트의 다른 곳은 전부 `date-fns/parse`를 쓴다.
- **수정**: `parse(item.createdAt, "yyyy.MM.dd HH:mm:ss", new Date())`로 통일. `app/shorts/[...slug].tsx:80`의 `new Date(ISO문자열)`은 표준이라 괜찮다.
- **✅ 처리 내역**: `transformWorkoutData`의 `new Date(replaceAll(...))`를 `date-fns/parse`로 교체.

## ✅ 🟡 9. 몸무게 차트가 소수점을 버림 — 수정 완료

- **위치**: `lib/function.ts:315` — `parseInt(findItem.value, 10)`
- **문제**: 몸무게를 "70.5"로 기록해도 차트에는 70으로 표시된다. 체중 변화 추적 앱에서 0.5kg 단위 유실은 기능 훼손.
- **수정**: `parseFloat` 사용.
- **✅ 처리 내역**: `getMonthlyBodyData`의 `parseInt`를 `parseFloat`로 교체 — 70.5kg이 그대로 차트에 표시된다.

## ✅ 🟡 10. 중량 lb 입력의 정밀도 유실 (parseInt + 반올림 왕복) — 수정 완료

- **위치**: `app/_layout.tsx:361-365, 478-483, 599-601` / `components/add-plan/top-weight.tsx:49-53`
- **문제**:
  - 저장 시 `Math.round(parseInt(weight) / 2.20462)` — `parseInt`가 소수점을 먼저 버린다.
  - kg↔lb 토글을 누를 때마다 반올림 변환이 반복돼 **왕복할수록 값이 어긋날 수 있다** (예: 소수점 지원 시 2.5kg → 6lb → 3kg).
  - `top-weight.tsx:91`의 `maxLength={3}` 때문에 **소수점 입력 자체가 불가** — 헬스에서 흔한 2.5kg 단위 기록을 막는다. 999 초과 lb도 입력 불가.
- **수정**: 원본 값+단위를 그대로 저장하고 표시할 때만 변환하거나, 최소한 `parseFloat` + 저장 시 한 번만 변환.
- **✅ 처리 내역**: 변환 전부 `parseFloat` + 소수 1자리 반올림으로 교체(저장 3곳 + kg↔lb 토글). 토글에 같은 단위 재탭 가드 추가(기존엔 kg 상태에서 kg을 다시 누르면 값이 lb로 변환되는 숨은 버그가 있었음). `maxLength` 3→5로 "102.5" 같은 소수 입력 허용.

## ✅ 🟡 11. 데이터 초기화·복원의 안전장치 부재 — 수정 완료 (백업 범위 확대는 미처리)

- **위치**: `app/mypage/reset-data.tsx`
- **문제**:
  1. **초기화 버튼(131행)에 확인 다이얼로그가 없다.** 숏츠 삭제에도 다이얼로그를 쓰면서, 전체 데이터 삭제는 원터치다.
  2. **복원(66-68행)이 JSON 스키마 검증 없이** `setUser("userInfo", user)` / `onSetMockout(workoutPlan)`으로 그대로 주입된다. 필드가 다른 JSON을 고르면 잘못된 형태가 영속화되어 **앱이 켤 때마다 크래시하는 상태**가 될 수 있다 (`item.condition.map` 등에서 터짐).
  3. 백업 파일에 숏츠·운동 태그·테마가 빠져 있어 "백업"이라는 이름과 실제 범위가 다르다.
  4. `console.log`/`console.error` 사용 (46, 49, 72행) — 프로젝트 자체 규칙 위반. 실패해도 사용자에게 아무 안내가 없다.
- **수정**: 초기화에 확인 다이얼로그, 복원에 최소한의 형태 검증(배열 여부, 필수 키) + 실패 시 `toast.error`.
- **✅ 처리 내역**: 1) 초기화에 확인 다이얼로그 추가(취소/삭제하기), 2) 복원에 `isValidUserInfo`/`isValidWorkoutPlan` 스키마 검증 추가 — 실패 시 토스트로 안내하고 스토어를 건드리지 않음, 4) `console.log`/`console.error` 전부 `toast.error`로 교체. 덤: 가짜 토스트를 띄우던 숨은 목업 버튼도 제거([02 #4](./02-ux-ui.md)).
  ※ 3) 백업 파일에 숏츠·운동 태그·테마 포함은 **아직 미처리** — 백업 포맷 변경이라 별도 결정 필요.

## ✅ 🟡 12. 드로어에서 파일 항목 탭 시 크래시 가능 — 수정 완료

- **위치**: `app/(drawer)/_layout.tsx:81-96` (`handleItemSelect`)
- **문제**: `selectedDate[1].slice(0,-1)`, `selectedDate[2].slice(0,-1)`을 가드 없이 호출한다. 아코디언(연도)을 닫는 400ms 애니메이션 동안에는 `selectedTitle`이 이미 `[]`로 리셋된 상태에서 월/일 항목이 아직 화면에 남아 있어, 그 순간 탭하면 `undefined.slice`로 크래시한다. 가드가 `length === 0`뿐이라 이 경우를 못 막는다.
- **수정**: `if (selectedDate.length < 3) return;`
- **✅ 처리 내역**: 가드를 `length === 0` → `length < 3`으로 교체.

## ✅ 🟢 13. 캘린더 아이콘 렌더 크래시 가능성 — 수정 완료

- **위치**: `app/(drawer)/(tabs)/calendar.tsx:61-65`
- **문제**: `icons[findItem.type]`이 5개 부위 외 값이면 `WorkoutIcon`이 undefined인 채 `<WorkoutIcon />`을 렌더해 크래시. 복원(11번)으로 임의 type이 들어올 수 있는 만큼 방어 필요. `findItem: any` 타입이라 tsc도 못 잡는다.
- **수정**: `icons[...] ?? 기본아이콘` + `any` 제거.
- **✅ 처리 내역**: `getDayIcon`을 재구성 — 아이콘을 못 찾으면(미지의 type 포함) 빈 아이콘/✕ 폴백으로 렌더. `findItem: any`를 `WorkoutPlanTypes | undefined`로 타입 지정.

## ✅ 🟢 14. 차트 스토어 리셋이 빈 문자열로 초기화됨 — 수정 완료

- **위치**: `hooks/use-chart-store.tsx:61-64` — `onReset: () => set({ date: "" })`
- **문제**: 초기값은 현재 연월(`yyyyMM`)인데 리셋은 `""`. 리셋이 호출되면 차트 헤더 제목이 사라지고 모든 월 필터가 무효가 된다.
- **수정**: 초기값과 동일한 로직으로 리셋.
- **✅ 처리 내역**: `onReset`이 현재 연월(`yyyyMM`)을 새로 계산해 리셋하도록 변경.

## ✅ 🟢 15. 날짜 표시가 12시간제인데 오전/오후 표기가 없음 — 수정 완료

- **위치**: `app/(modals)/select-type.tsx:66`, `app/workout/add-multi-plan.tsx:175` — `format(date, "yyyy년 M월 d일 h시 m분")`
- **문제**: `h`는 12시간제라 **오후 1시 5분이 "1시 5분"**으로 표시된다. 분도 패딩이 없다.
- **수정**: `"yyyy년 M월 d일 HH시 mm분"` 또는 `"... a h시 mm분"`.
- **✅ 처리 내역**: 두 곳 모두 `"yyyy년 M월 d일 HH시 mm분"`(24시간제 + 분 패딩)으로 교체.

## ✅ 🟢 16. 숏츠 삭제 다이얼로그의 인덱스 방어 부재 — 수정 완료

- **위치**: `components/shorts/remove-shorts-dialog.tsx:84` — `videos[position].id`
- **문제**: 빠른 스크롤로 `Math.round(offsetY/height)`가 범위를 벗어난 position이 들어오면 `undefined.id` 크래시. `findIndex -1 가드` 규칙과 같은 맥락의 방어 필요.
- **✅ 처리 내역**: `videos[position]`을 변수로 받아 `if (!video) return` 가드 후 삭제하도록 변경.

## ✅ 🟢 17. 권한 상태가 한 번 저장되면 갱신되지 않음 + 이미지 조용한 유실 — 수정 완료

- **위치**: `app/_layout.tsx:75-98`, `331-353`
- **문제**:
  - 권한이 granted일 때만 `setUser(..., true)`를 하고 **회수(설정에서 끔)는 반영하지 않는다**. 영속 스토어라 영원히 true로 남아, 이후 `createAssetAsync`가 throw → 저장 전체가 generic 에러 토스트로 실패한다.
  - 반대로 권한이 없으면 `mediaLibrary && (...)`가 `false`가 되어 **첨부한 사진이 아무 안내 없이 버려진 채 저장**된다.
- **수정**: 저장 시점에 `MediaLibrary.getPermissionsAsync()`로 실시간 확인, 권한 없으면 사용자에게 알리고 진행 여부 선택.
- **✅ 처리 내역**: 세 저장 핸들러(추가/수정/루틴) 모두 영속 `mediaLibrary` 플래그 대신 저장 시점에 `MediaLibrary.requestPermissionsAsync()`로 실시간 확인하도록 교체. 권한이 없으면 "사진 보관함 권한이 없어 사진은 저장되지 않아요" 토스트를 띄우고 사진 없이 저장을 진행(조용한 유실 제거). 루트 레이아웃의 권한 플래그도 granted 여부를 그대로 반영해 회수 시 false로 갱신되게 함.

## ✅ 🟢 18. 저장 성공 토스트의 문법 오류 — 수정 완료

- `app/_layout.tsx:377` "운동 계획**을** 추가되었습니다!!" → "운동 계획**이** 추가되었습니다"
- `app/_layout.tsx:498` "운동 계획**을** 수정되었습니다!!" → "운동 계획**이** 수정되었습니다"
- `app/(drawer)/(tabs)/calendar.tsx:124` "운동한 날짜**을**" → "날짜**를**"
- **✅ 처리 내역**: 세 문구 모두 교정 완료.
