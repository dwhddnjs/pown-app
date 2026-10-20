# 전체 노트·숏츠 메모 리치 텍스트 에디터

전체 노트와 숏츠 메모 본문을 리치 텍스트로 바꿨다. iOS는 끝났고, Android는 **한글 조합 중 서식 토글** 하나가 남았다(아래 "남은 작업 1").

- 라이브러리: `react-native-enriched@0.4.1` (Software Mansion, Expo 리치 텍스트 가이드 1순위). RN 0.79를 지원하는 마지막 판이라 **버전 고정**. 0.5+와 후속 `react-native-enriched-html`은 RN 0.81+ → SDK 54 이상으로 올릴 때 옮긴다.
- 서식 9종: 굵게 · 밑줄 · 취소선 · 제목1 · 제목2 · 글머리 · 번호 · 체크리스트 · 인용. 글자색·이탤릭은 넣지 않았다(글자색은 라이브러리 API가 없고, 이탤릭은 iOS가 sb 글꼴·한글 기울임을 합성하지 않는다).
- 네이티브 의존성이 추가돼 **OTA 금지** — version·runtimeVersion 3.7.0.

## 현황

| 범위 | iOS | Android |
| --- | --- | --- |
| 에디터·서식 툴바·서식 9종 | 완료 | 완료 |
| 읽기 화면 (계획 폼 미리보기·목록 카드) | 완료 | 완료 — iOS와 줄 위치 0.6pt 안 |
| 줄 높이 1.5배·마커(점·체크박스·번호) 정렬 | 완료 | 완료 — 제목 줄만 0.3pt 차이 (남은 작업 2) |
| 툴바가 키보드와 같이 움직임 | 완료 (키보드 보조 막대) | 완료 (녹화 프레임으로 확인) |
| 한글 조합 중 굵게·밑줄·취소선 켜고 끄기 | 완료 | **미완료** (남은 작업 1) |
| 숏츠 메모 시트 | 완료 | 미검증 (남은 작업 3) |

## 구조

| 파일 | 역할 |
| --- | --- |
| `lib/rich-note.ts` | 저장 형식(`content`에 `<html>…</html>`, 퀵 노트는 평문) 판별·평문 추출·파싱·저장 정규화 |
| `components/rich-note.tsx` | 에디터 `RichNoteEditor`·`htmlStyle`과 읽기 렌더러 `RichNoteText` — 같은 치수를 한 곳에서 쓴다 |
| `components/note-format-toolbar.tsx` | 서식 툴바 (9개 도구 + 키보드 내리기) |
| `components/note-toolbar-dock.{ios,android}.tsx` | 툴바 자리 — iOS는 `InputAccessoryView`(키보드 보조 막대), Android는 키보드 윗변에 붙인다 |
| `constants/text-metrics.{ios,android}.ts` | `enrichedUlMarginLeft`·`enrichedOlMarginLeft` — 라이브러리의 플랫폼별 목록 들여쓰기 차이 보정 |
| `plugins/with-sb-font-family.js` | Android에서 sb-l을 400(SB_L)·700(SB_M) 패밀리로 등록 — 굵게가 가짜 굵게가 되지 않게 |
| `scripts/patch-enriched.js` | 라이브러리 패치 (postinstall) — 아래 표 |

## 라이브러리 패치 (`scripts/patch-enriched.js`)

버전을 올리면 항목마다 아직 필요한지 확인한다. 패치마다 표식(`POWN_ENRICHED_PATCH …`)이 있어 두 번 돌려도 한 번만 걸린다.

| # | 플랫폼 | 문제 | 패치 |
| --- | --- | --- | --- |
| 1 | iOS | SB 어그로는 세 굵기 모두 weightClass 400이라 CoreText가 굵다고 보지 않아 굵게가 아무것도 안 바뀜 | `FontExtension.mm` — sb-l ↔ sb-m 이름으로 잇고 sb-m을 굵은 글꼴로 침 |
| 2 | 양쪽 | 이 판에 `autoCorrect`·`spellCheck` prop이 없어 추천 단어 바가 뜸 | iOS 자동 수정·맞춤법 끔, Android `NO_SUGGESTIONS` |
| 3 | iOS | 한글 자판이 글자를 다시 조합할 때 앞 글자 서식을 받아, 굵게를 꺼도 다시 굵어지고 제목에서 줄을 바꿔도 제목이 이어짐 | 다시 조합된 앞 글자는 원래 서식, 갈라져 나온 새 글자는 친 때 서식으로 돌려놓음 |
| 4 | iOS | JS로 키보드 높이를 따라가면 툴바가 늦게 깜빡 붙고 내려갈 때 뜸 (reanimated `useAnimatedKeyboard`는 iOS 26에서 애니메이션 중 0) | 텍스트뷰가 `inputAccessoryViewID`로 응답 → RN `InputAccessoryView`가 키보드 보조 막대로 붙임 |
| 5 | 양쪽 | `lineHeight` 미지원 — 글자 1.2배로 빽빽함 | iOS 레이아웃 매니저 줄 간격(자연 줄 × 0.25), Android 정수 지표 기준 배율로 1.5em. 마커는 자연 줄 가운데(기준선 0.2em 위)에 그림 |
| 5-a | Android | 15+ EditText가 한국어 로케일 글꼴(Noto CJK)을 줄 높이 최솟값으로 써서 줄이 1.3배·첫 줄 5.9 아래 | `isLocalePreferredLineHeightForMinimumUsed = false`, `isFallbackLineSpacing = false`, `includeFontPadding = false` |
| 6 | Android | 화면에 붙을 때 `setTextIsSelectable`이 글 전체를 다시 넣으며 커서 자리 제목을 글 끝까지 늘림 → **저장하면 본문이 `<h1>`이 됨** | 그 호출을 값 넣기 보호(transaction)로 감쌈 |

## 남은 작업

### 1. Android 한글 조합 중 서식 토글 (미완료)

굵게(밑줄·취소선도 같음)를 끈 뒤 한글을 치면 앞 글자 서식이 새 글자까지 늘어난다. 영어는 정상이다.

- 재현 (Pixel 6 에뮬레이터, Gboard 한국어): B 켬 → '하' → B 끔 → '하하' → 스페이스 → B 켬 → '하하'. 기대 "**하**하하 **하하**", 실제 "**하하하** 하하".
- 원인 (네이티브 로그로 확인):
    1. Gboard는 '하' 뒤 'ㅎ'을 받침으로 붙여 '핳'을 만든다 (굵게 0-1 그대로).
    2. 'ㅏ'가 오면 '핳'을 '하하'로 갈아 끼우는데, 서식 범위 안에서 글자가 늘어 굵게가 0-2로 퍼진다.
    3. B를 끈 상태(`spanState` 없음)여도 이미 늘어난 서식은 남는다.
- 시도: `EnrichedTextWatcher`에서 "다시 조합돼 늘어난 새 글자 구간에서 꺼 둔 서식을 잘라 내는" 패치 → 결과 "하하하 **하하**"로 직접 굵게 한 첫 글자까지 풀려 **되돌렸다**.
- 다음 단계:
    - [ ] 잘라 낸 뒤 첫 글자 굵게가 언제 사라지는지 로그로 찾기 (다음 자모의 갈아 끼우기가 다시 지울 가능성)
    - [ ] iOS 패치 3처럼 `beforeTextChanged`에서 바꾸기 전 서식을 기억했다가, 앞 글자는 원래 서식·새 글자는 친 때 서식으로 돌려놓는 방식 시도
    - [ ] 삼성 키보드에서도 같은 순서 확인 (조합 방식이 다를 수 있다)

### 2. Android 제목 줄 0.3pt 짧음

Android는 글꼴 지표를 정수 픽셀로 올리고 줄 간격 배율이 전역 하나라, 제목(20·18) 줄마다 iOS보다 약 0.3pt 짧다. 제목 4개짜리 노트 끝에서 1pt 남짓. 고치려면 제목 span(`EnrichedH*Span`)에 `LineHeightSpan`으로 줄 높이를 직접 정해야 한다. 에디터에서만 생기는 차이이고 읽기 화면은 iOS와 같다.

### 3. Android 숏츠 메모 시트 미검증

iOS에서는 작성·서식·저장·다시 열기를 확인했다. Android는 확인하지 못했다. 볼 것: 시트 키보드 처리(`keyboardBehavior="extend"` + `NOTE_DOCK_EXTRA_INSET`), 툴바 위치, 저장.

### 4. 함께 고친 원래 버그 (확인용)

- 숏츠 메모: 시트가 이미 키보드만큼 내용 영역을 줄이는데 본문 칸이 키보드 높이를 한 번 더 빼서, 키보드가 뜨면 본문 칸이 0으로 접혀 안 보였다.
- 계획 폼 '기구 종류': 스크롤뷰 안 `flex: 1`로 높이가 0으로 접혀 테두리 윗변만 선처럼 보였다.

## 검증

- 타입 체크 두 플랫폼 · 린트 에러 0.
- iOS 시뮬레이터(iPhone 17 Pro)·Android 에뮬레이터(Pixel 6, API 35)에서 같은 노트를 pt/dp로 나란히 비교했다. 첫 줄은 예전 본문 입력칸과 같은 자리(iOS 16.0pt / Android 16.0dp), 줄 간격 24.0.
- 툴바·키보드 동기화는 화면 녹화 프레임으로 확인 (iOS 매 프레임 ±1px, Android 5~7px 일정).
- 시뮬레이터 데이터: iOS에 오늘 날짜 "바벨 벤치프레스 60kg" 예시 계획(전체 노트 예시)이 남아 있다. 확인 후 지워도 된다. Android 에뮬레이터에는 iOS 데이터 복사본을 넣었다.
