# 02. UX · UI 개선

기능은 동작하지만 사용자 경험이나 화면 품질을 해치는 것들. 🔴 높음 / 🟡 중간 / 🟢 낮음.

> ✅ 표시 = 수정 완료 (#4는 2026-07-12, 나머지는 2026-07-14). **15건 전부 수정 완료.**

---

## ✅ 🔴 1. 앱 첫 실행 즉시 권한 3종 연속 팝업 — 수정 완료

- **위치**: `app/_layout.tsx:75-98`
- **문제**: 루트 레이아웃 마운트 시점에 **카메라 → 사진 라이브러리 → 마이크** 권한을 연달아 요청한다. 첫인상이 권한 팝업 3연타이고, 맥락 없는 권한 요청은 거부율을 높이며 App Store 심사에서도 지적 대상이다.
- **수정**: 각 권한은 실제 사용하는 시점(카메라 열 때, 사진 저장할 때, 녹화 시작할 때)에 요청. `expo-camera`의 `useCameraPermissions` 훅 패턴 활용.
- **✅ 처리 내역 (2026-07-14)**: 루트 레이아웃의 일괄 요청 제거. 카메라는 `add-plan/camera` 진입 시(`useCameraPermissions`), 카메라·마이크는 숏츠 촬영 화면 진입 시(`useMicrophonePermissions` 포함), 사진 보관함은 저장 시점(`lib/media.ts`)과 사진 표시 시(`MediaLibrary.usePermissions`)에 요청. 권한 미허용 시 각 화면에 안내 + "권한 허용하기" 버튼 표시. 영속 권한 플래그(`camera`/`mediaLibrary`/`microphone`)는 user store에서 제거.

## ✅ 🔴 2. 세트 "완료"를 취소할 수 없음 — 수정 완료

- **위치**: `hooks/use-workout-plan-store.tsx:46-74`, `components/workout-plan/set-list-item.tsx:74-100`
- **문제**: `setCompleteProgress`는 `진행중 → 완료` 단방향이다. 실수로 누르면 수정 화면에 들어가 세트를 지우고 다시 만드는 것 외에 되돌릴 방법이 없다.
- **수정**: 완료 아이콘 탭 시 토글(진행중 복귀)하거나 롱프레스로 취소.
- **✅ 처리 내역 (2026-07-14)**: `setCompleteProgress`를 토글로 변경(완료 ↔ 진행중), 완료 체크 아이콘을 탭하면 진행중으로 되돌아간다.

## ✅ 🟡 3. 다크/라이트 모두 보조 텍스트 대비가 접근성 기준 미달 — 수정 완료

- **위치**: `constants/Colors.ts`
- **문제**:
  - light: `subText #aaaaaa` on `background #EFEEF3` → 대비 약 2.0:1
  - dark: `subText #666666` on `background #1a1a1a` → 대비 약 2.9:1
  - WCAG AA 최소치(4.5:1, 작은 글씨)에 크게 못 미친다. 날짜·안내문·placeholder가 전부 subText라 체감 범위가 넓다.
- **수정**: light는 `#767680` 계열, dark는 `#9a9aa0` 계열로 조정 검토.
- **✅ 처리 내역 (2026-07-14)**: 제안값 그대로 적용 — light `#767680`, dark `#9a9aa0`.

## ✅ 🟡 4. 초기화 화면의 숨은 버튼이 가짜 토스트를 띄움 — 수정 완료

- **위치**: `app/mypage/reset-data.tsx:134-146`
- **문제**: 화면 우하단의 **보이지 않는 50×50 Pressable**이 남아 있고, 실제 목업 생성 코드는 주석 처리됐는데 토스트("목업데이터 생성 되었습니다")와 `back()`은 그대로 실행된다. 사용자가 우연히 누르면 아무 일도 안 일어났는데 생성됐다는 메시지를 보게 된다.
- **수정**: 개발용 이스터에그면 `__DEV__` 가드로 감싸고, 아니면 삭제.
- **✅ 처리 내역 (2026-07-12)**: 숨은 Pressable을 삭제했다 (reset-data 화면 재작성 시 함께 정리, [01 #11](./01-bugs.md) 참고).

## ✅ 🟡 5. 사진 확대 모달이 이미지를 강제로 늘림 — 수정 완료

- **위치**: `components/workout-plan/image-modal.tsx:16` — `contentFit="fill"` + `aspectRatio: 9/16`
- **문제**: 어떤 비율의 사진이든 9:16으로 **왜곡해서** 보여준다. 가로 사진은 심하게 찌그러진다.
- **수정**: `contentFit="contain"`으로 변경하고 aspectRatio 고정 제거.
- **✅ 처리 내역 (2026-07-14)**: `contentFit="contain"` + aspectRatio 제거, 컨테이너를 전체 화면 기준으로 변경 — 어떤 비율의 사진도 왜곡 없이 표시.

## ✅ 🟡 6. 3대중량 차트의 축이 고정값이라 표시가 어긋남 — 수정 완료

- **위치**: `components/chart/sbd-chart.tsx:84-85`
- **문제**:
  - `maxValue={300}` 고정 — 300kg 넘는 기록(데드리프트 등)은 막대가 잘린다.
  - `yAxisLabelTexts`가 `["0"..."250"]` 6개인데 `stepValue 50 × maxValue 300`이면 라벨이 7개(0~300) 필요 — **축 라벨과 실제 눈금이 어긋나 있다**.
  - 비교 기준이 "최초 입력값(`userInfo[0]`) vs 선택 월 마지막 값"인데 화면 어디에도 이 기준 설명이 없다.
- **수정**: 데이터 최대값 기반으로 maxValue 계산, 라벨은 자동 생성에 맡기기.
- **✅ 처리 내역 (2026-07-14)**: maxValue를 데이터 최대값 +10% 여유를 50kg 단위로 올림(최소 100)으로 동적 계산, `stepValue`/`yAxisLabelTexts` 고정 배열 제거하고 `noOfSections={6}` 자동 라벨 사용. 비교 기준 설명 캡션("회색: 최초 기록 · 컬러: 선택한 달의 마지막 기록")도 추가.

## ✅ 🟡 7. 몸무게 차트가 기록 없는 날을 0kg으로 그림 — 수정 완료

- **위치**: `components/chart/body-chart.tsx` + `lib/function.ts:275-318` (`getMonthlyBodyData`)
- **문제**: 한 달 전체(1~말일)를 0으로 채운 뒤 기록 있는 날만 값을 넣으므로, 기록이 띄엄띄엄 있으면 **라인이 0까지 곤두박질치는 삼각파형**이 된다. 또 `width={310}` 고정이라 기기 폭 대응이 안 된다.
- **수정**: 기록 있는 날만 데이터 포인트로 쓰고 라벨만 날짜로 표시하거나, 직전 값을 이어붙이는 방식(carry-forward). width는 `useWindowDimensions` 기반.
- **✅ 처리 내역 (2026-07-14)**: `getMonthlyBodyData`가 기록 있는 날만 포인트로 반환(x축 라벨 "n일" 추가), 차트는 `useWindowDimensions` 기반 width + `adjustToWidth`로 기기 폭 대응. 포인트가 드물어진 만큼 데이터 포인트를 표시하도록 변경.

## ✅ 🟡 8. 차트 월 이동이 "운동 기록이 있는 달"로만 제한됨 — 수정 완료

- **위치**: `hooks/use-chart-store.tsx:17-60`
- **문제**: 월 네비게이션 후보를 `workoutPlanList`에서만 뽑는다. **몸무게·3대중량만 기록한 달**로는 이동할 수 없어 해당 데이터가 차트에서 영영 안 보인다. 로직도 "전체 기록을 정렬→일자 dedupe→월 dedupe"로 불필요하게 복잡하다.
- **수정**: 단순히 현재 연월에서 ±1개월씩 이동(date-fns `addMonths`)하고, 데이터 없으면 빈 상태를 보여주는 편이 예측 가능하다.
- **✅ 처리 내역 (2026-07-14)**: `use-chart-store`를 `addMonths` ±1 이동으로 재작성(정렬·dedupe 로직 삭제), 시그니처도 `setDate(type)`으로 단순화. `chart-header`의 `workoutPlanList` 구독도 함께 제거.

## ✅ 🟡 9. 계산기 입력 필드를 탭하면 값이 사라짐 — 수정 완료

- **위치**: `app/(modals)/calculate.tsx:128` — `onFocus={() => setInputNumber("")}`
- **문제**: 입력한 중량을 수정하려고 탭하는 순간 전체가 지워진다. kg↔lb 토글 시에도 `Math.round`라 왕복 오차가 생긴다.
- **수정**: onFocus 클리어 대신 `selectTextOnFocus` 사용.
- **✅ 처리 내역 (2026-07-14)**: `selectTextOnFocus`로 교체(탭하면 전체 선택 — 덮어쓰기도 수정도 가능). kg↔lb 토글도 `Math.round` 정수 반올림 → 소수 1자리 반올림으로 왕복 오차 완화.

## ✅ 🟡 10. 검색 화면의 FlashList가 ScrollView 안에 있어 가상화 무효 — 수정 완료

- **위치**: `app/workout/search.tsx:62-117`
- **문제**: `ScrollView` 안에 `FlashList`를 넣으면 높이 제약이 없어 **전체 아이템을 한 번에 렌더**한다(FlashList 경고 대상). 기록이 수백 건이면 키 입력마다 전체 렌더.
- **수정**: 바깥 ScrollView 제거하고 FlashList에 `ListEmptyComponent`/`ListFooterComponent`로 안내문 배치.
- **✅ 처리 내역 (2026-07-14)**: ScrollView 제거, FlashList를 루트로 승격하고 안내문을 `ListEmptyComponent`/`ListFooterComponent`로 이동. 검색어는 있는데 결과가 없을 때 "검색 결과가 없습니다" 문구도 추가.

## ✅ 🟢 11. iPad 지원이 켜져 있는데 레이아웃은 폰 고정 — 수정 완료

- **위치**: `app.json` `supportsTablet: true` + 곳곳의 고정 폭(차트 310, `Dimensions.get` 사용 등)
- **문제**: iPad에서 네이티브 해상도로 뜨지만 화면들이 폰 기준이라 여백·차트가 어색해진다.
- **수정**: 당장 대응 계획이 없으면 `supportsTablet: false`가 오히려 낫다(폰 레이아웃 확대 표시).
- **✅ 처리 내역 (2026-07-14)**: `supportsTablet: false`로 변경. (네이티브 설정 변경이라 다음 배포는 OTA가 아닌 네이티브 빌드 필요.)

## ✅ 🟢 12. 로그인/회원가입 화면이 죽은 채로 남아 있음 — 수정 완료

- **위치**: `app/auth/sign-in.tsx`, `app/auth/sign-up.tsx`
- **문제**: 백엔드가 없어 `onSubmit`이 빈 함수, 소셜 버튼도 무동작이다. 탭·메뉴에선 진입 경로가 없지만 **라우트는 살아 있어** 딥링크(`myapp://auth/sign-in`)로 열린다. 비밀번호 입력에 `secureTextEntry`도 없다. 다크 전용 색 하드코딩으로 라이트 모드에서 깨진다.
- **수정**: 화면 삭제(주석의 supabase 코드 포함). 소셜 로그인 계획이 생기면 그때 다시.
- **✅ 처리 내역 (2026-07-14)**: `app/auth/` 디렉터리 삭제 + `_layout.tsx`의 라우트 등록 2개 제거. 딥링크로도 더 이상 열리지 않는다.

## ✅ 🟢 13. 날짜 선택 시트가 수정 중인 날짜를 반영하지 않음 — 수정 완료

- **위치**: `components/add-plan/select-type-date-sheet.tsx:21` — `useState(new Date().valueOf())`
- **문제**: 시트 내부 state가 항상 "지금"으로 시작한다. 수정/재선택 시 기존 선택값이 아닌 현재 시각이 스피너에 뜬다.
- **수정**: 열릴 때 `usePlanStore().date`로 동기화.
- **✅ 처리 내역 (2026-07-14)**: 시트가 열릴 때 `usePlanStore().date`로 스피너를 동기화.

## ✅ 🟢 14. 노트 모달 placeholder가 다크 모드에서 잘 안 보임 — 수정 완료

- **위치**: `app/(modals)/note.tsx:15-39`
- **문제**: 두 TextInput 모두 `placeholderTextColor` 미지정 — iOS 기본 회색이 다크 배경과 겹친다. 다른 입력들은 `themeColor.subText`를 지정하고 있어 비일관.
- **✅ 처리 내역 (2026-07-14)**: 두 입력 모두 `placeholderTextColor={themeColor.subText}` 지정.

## ✅ 🟢 15. 설정 리스트의 화살표 아이콘이 위를 향함 — 수정 완료

- **위치**: `app/mypage/settings.tsx:39, 55, 71` — `<AntDesign name="up" />`
- **문제**: 이동 가능한 리스트 행의 관례는 오른쪽 화살표(`right`)다. `up`은 "닫기/접기"로 읽힌다.
- **✅ 처리 내역 (2026-07-14)**: 세 행 모두 `right` 화살표로 교체.
