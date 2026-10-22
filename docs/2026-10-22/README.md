# 리치 텍스트 에디터 Android 마무리 · 스크롤 여백 · 툴바 박스

10/21 리치 텍스트 에디터 작업(`docs/2026-10-21/README.md`)의 Android 남은 작업을 처리하고, 검증하며 찾은 문제를 함께 고쳤다. PR #44.
네이티브 패치(`scripts/patch-enriched.js`)가 바뀌어 **OTA 금지 — 3.7.0 새 바이너리로 배포**.

## 한 일

| 무엇 | 플랫폼 | 어디 |
| --- | --- | --- |
| 한글 조합 중 굵게·밑줄·취소선 토글 | Android | 패치 7 (`EnrichedTextWatcher`·`EnrichedTextInputConnectionWrapper`) |
| 제목 줄 높이 iOS와 맞춤 (H1 79px·H2 71px) | Android | 패치 5 수정(줄 간격 배율 → 고정값 더하기) + 패치 8 (`LineHeightSpan`) |
| 숏츠 메모 툴바가 시트 위로 날아가 안 보임 | Android | `note-toolbar-dock.android` — 부모 아래끝 실측 |
| 숏츠 메모 커서 줄이 툴바에 가려짐 | Android | `useNoteSheetEditorInset` |
| 노트를 키보드 띄운 채 닫은 뒤 툴바가 키보드 없이 떠 있음 | Android | `platform-root.android` — reanimated 키보드 감시 상시 구독 |
| 노트 저장 후 '목표 중량'에 포커스·숫자 키패드 | Android | `RichNoteEditor` 언마운트 blur |
| 스크롤한 글이 디바이더 14 아래·툴바 14 위에서 사라짐 | 양쪽 | 패치 9 — iOS `textContainerInset`, Android 잘린 여백 띠 이어 그리기 |
| 툴바 위 빈 박스 | 양쪽 | iOS: `InputAccessoryView`의 투명 칸(안전영역 34)만큼 본문을 덜 비움. Android: 키보드 칸이 툴바보다 낮을 때(하드웨어 키보드) 본문 여백을 툴바 실제 자리에 맞춤 |
| '전체노트 열기' 누를 때 회색 하이라이트 | iOS | `plan-note.tsx` `suppressHighlighting` |

세부 원인·측정값은 `docs/2026-10-21/README.md`의 "10/22 처리".

## 남은 일

> 10/23 진행(`docs/2026-10-23/README.md`): 1은 패치 10으로 고쳤고 타이핑 확인만 남았다. 3은 추정값을 없앴다(RN 보조 막대 패치 4-1). 2는 그대로(갤럭시 실기).

### 1. iOS 문서 끝 입력 시 커서가 키보드 뒤로 내려감 (원래 있던 문제)

- 증상: 전체 노트에서 문서 **끝**에 줄을 계속 추가하면 커서 줄이 키보드 뒤로 내려가고 화면이 따라오지 않는다. 문서 중간 입력은 따라온다.
- 이번 변경과 무관 — 패치 9를 끈 A/B 빌드에서도 같았다.
- 유력한 원인: enriched iOS가 `_performRelayout`에서 `contentSize`를 비동기(`dispatch_async`)로 덮어쓴다. UIKit이 커서로 스크롤하는 시점엔 새 줄이 아직 내용 크기에 없다.
- 고칠 방향: 같은 블록에서 `contentSize`를 넣은 직후 `[textView scrollRangeToVisible:textView.selectedRange]`(포커스 중일 때만)를 부르는 패치를 `scripts/patch-enriched.js`에 추가 → iOS 다시 빌드 → 시뮬레이터에서 화면 자판으로 20줄 이상 쳐서 확인.

### 2. 삼성 키보드 한글 조합 실기 확인

에뮬레이터에 설치할 수 없어 못 봤다. 갤럭시에서 B 켬 → 하 → B 끔 → 하하 → 스페이스 → B 켬 → 하하 = "**하**하하 **하하**"인지 볼 것.

### 3. iOS 툴바 투명 칸 높이 가정

보조 막대 안에선 `measureInWindow`가 0이라 툴바 자리를 잴 수 없어, 투명 칸을 홈 인디케이터 안전영역 값으로 본다(`note-toolbar-dock.ios`, ponytail 주석). 홈 인디케이터 높이가 다른 기기에서 박스가 보이면 재서 바꿀 것.

## 검증 환경 메모

- iOS: iPhone 17 Pro 시뮬레이터(`2C2ADC51…`), orca emulator로 조작. `orca emulator type`은 하드웨어 키 입력이라 소프트 키보드가 숨는다 — 시뮬레이터 재부팅 + `orca emulator kill` 후 다시 attach해야 돌아온다. 키보드 검증은 화면 자판을 탭으로 친다.
- Android: Pixel 6 API 35. AVD를 스냅샷으로 부팅하면 디스크가 스냅샷 시점(10/19)으로 돌아가 설치한 APK·데이터가 사라진다 — 항상 `-no-snapshot-load`. 지금 `hw.keyboard = no`(화면 키보드)로 둠.
- 디스크: 없어진 워크트리(taimen·bluegill·dugong·tuna)의 Xcode DerivedData 약 12GB를 지웠다.
