---
name: verify
description: iOS 시뮬레이터에서 Pown 앱을 띄우고 화면을 클릭으로 조작해 변경을 눈으로 검증한다. 빌드/실행/터치 주입/좌표 매핑 레시피.
---

# Pown — iOS 시뮬레이터 검증

Pown은 **iOS 세로(portrait) 전용** 운동 기록 앱이다. `expo-dev-client` + 네이티브 모듈
(`@react-native-google-signin/google-signin`, `expo-camera` 등)을 쓰므로 **Expo Go로는 못 띄운다.**
네이티브 dev build가 필요하다. bundle id는 `com.anonymous.workout-app`, scheme은 `myapp`.

## 1. 빌드 & 실행

`ios/`는 CNG(gitignore)라 없으면 `run:ios`가 prebuild부터 한다. **첫 빌드 10~25분**이므로
`run_in_background: true`로 돌리고 완료 알림을 기다릴 것.

```bash
xcrun simctl list devices available | grep -B1 -A5 'iPhone'
SIM=<udid>
xcrun simctl boot $SIM; open -a Simulator
npx expo run:ios --device $SIM     # ← 백그라운드로
```

빌드 후 앱은 dev launcher로 열린다. dev server(8081)가 떠 있어야 번들이 로드된다.
Pown은 portrait 고정이라 시뮬레이터를 회전시킬 일이 없다.

## 2. 터치 주입 — `cliclick` (접근성 권한 필요)

- `xcrun simctl`에는 tap 명령이 **없다**.
- `osascript`의 `click at {x,y}`는 실제 CGEvent를 만들지 않아 **먹지 않는다**.
- `idb-companion`은 최신 Xcode에서 잘 동작하지 않는다. 시간 낭비하지 말 것.
- **`brew install cliclick`** 가 정답. 단, 시스템 설정 > 개인정보 보호 및 보안 > **손쉬운 사용**에서
  터미널(Warp 등)을 허용해야 한다. 막혀 있으면 사용자에게 켜 달라고 요청할 것.

### 좌표 매핑 (핵심)

스크린샷은 device 픽셀(@3x), 클릭은 macOS 스크린 포인트다. 베젤 오프셋은 **상하 비대칭**이다.

```bash
# 창 위치/크기
osascript -e 'tell application "System Events" to tell process "Simulator" \
  to return {position, size} of first window'
# 예: position=2103,162  size=456x972   (device = 402x874 pt)
# 좌우 베젤 27씩, 상단 71(=베젤27+타이틀44), 하단 27  → 71+874+27=972 ✓
```

```bash
tap() {  # usage: tap <pt_x> <pt_y>
  OX=2103; OY=162; BX=27; BY=71     # ← 창 이동 시 OX/OY 재측정
  osascript -e 'tell application "Simulator" to activate'; sleep 0.4
  cliclick m:$((OX+BX+$1)),$((OY+BY+$2)) w:80 c:$((OX+BX+$1)),$((OY+BY+$2))
}
```

스크린샷 픽셀 → pt 변환: `pt = 원본픽셀 / 3` (device 402x874pt = 1206x2622px).

축소본을 보고 좌표를 읽을 때는 **`sips -Z N` 이 긴 변을 N으로 맞춘다**는 걸 잊지 말 것.
세로 스크린샷을 `-Z 420` 하면 폭은 420이 아니라 **193**이다. 폭을 420으로 착각하면 배율이
통째로 틀어져 클릭이 엉뚱한 데 떨어진다. 매번 실제 크기를 읽고 배율을 계산할 것:

```bash
sips -Z 420 shot.png --out small.png
sips -g pixelWidth small.png     # → 193
# 배율 = 402 / 193 = 2.083   →   pt = 표시좌표 × 2.083
```

버튼 중심을 정확히 알아야 하면 원본을 crop해서 볼 것 — 축소본에서 눈대중한 중심은 자주 빗나간다.
`sips -c <height> <width> --cropOffset <y> <x> shot.png`

캡처: `xcrun simctl io $SIM screenshot "$SHOTS/01-home.png"`

**캡처물은 전부 임시 파일이다.** 저장소 안에 쓰지 말고 스크래치패드에 모을 것.
세션 시작 때 한 번 잡아두면 된다:

```bash
SHOTS=$(mktemp -d)   # 또는 Claude Code가 알려주는 scratchpad 경로
```

**탭이 안 먹으면 앱을 의심하기 전에 창 위치부터 다시 재라.** 시뮬레이터 창은 재시작·
사용자 조작으로 슬며시 움직인다. 오프셋이 낡으면 모든 클릭이 창 밖으로 나가고, 그게
"버튼이 죽었다"처럼 보인다. **캡처 직전마다** 창 위치를 다시 잰다:

```bash
osascript -e 'tell application "System Events" to tell process "Simulator" \
  to return {position, size} of first window'
```

앱 코드가 아니라 입력이 문제인지 가르는 가장 빠른 방법은 **딥링크**다. 딥링크로 화면이
뜨는데 탭으로는 안 뜨면 좌표/창 위치 문제다.

## 3. 앱까지 도달하기

1. dev launcher에서 **"pown" dev server 카드** 클릭 → 번들 로드
2. dev menu 안내 시트가 뜨면 **Continue**
3. dev menu가 열리면 우상단 **X**로 닫기

진입 화면은 `(drawer)/(tabs)/workout`(운동 탭)이다.

### 딥링크는 라우트 확인용으로만

`xcrun simctl openurl $SIM "myapp://..."` 는 iOS가 **"'pown'에서 열겠습니까?" 확인 다이얼로그**를
띄운다(앱 종료 상태여도 뜬다). "열기"를 눌러야 진행된다. 라우트 존재/부재 확인에는 유용하지만,
일반 플로우는 그냥 UI를 클릭하는 게 빠르다.

## 4. 드라이브할 만한 플로우

탭 바(하단): **운동 · 차트 · [＋] · 캘린더 · 내 숏츠**. 가운데 [＋]는 탭이 아니라
FAB 오버레이를 토글한다(`tabPress`에서 `setFabOpen`). 오버레이의 두 버튼:

- **운동 추가** → `/(modals)/select-type` (부위 선택: 가슴/등/어깨/하체/팔)
  → `/add-plan/{type}` (운동·중량 필수 입력, 세트·회수·컨디션·글·사진은 선택) → 저장
  → 운동 탭 리스트에 오늘 날짜로 쌓인다.
- **루틴** → `/workout/multi-plan`

회귀가 잘 드러나는 전체 경로:

```
운동 탭(기록 목록) → [＋] → 운동 추가 → select-type(부위) → /add-plan/{type}
  → 운동/중량 입력 → 저장 → 운동 탭에 기록 추가 확인
차트 탭(gifted-charts) / 캘린더 탭 / 내 숏츠 탭
편집: 기록 항목 → /edit-plan/{type}/{id}
마이페이지(drawer): 내 정보 · 설정 · 테마 · 데이터 초기화
```

- **테마 라이트/다크 둘 다 확인.** 테마는 마이페이지 > 테마에서 전환(`use-user-store`).
  색상은 인라인 배열로 주입되므로 다크에서 대비/가독성 회귀가 잘 난다.
- 데이터가 없으면 차트·캘린더가 빈 상태다. 화면을 검증하려면 먼저 기록을 1~2개 추가해 둘 것.

## 5. 함정

- **조작 후에는 반드시 스크린샷으로 상태를 확인하고 다음 단계로 갈 것.** "모달이 닫혔겠지"
  가정하고 다음 좌표를 눌렀다가, 모달이 남아 있어 클릭이 엉뚱한 데 떨어진 적이 있다.
  빗나간 클릭은 조용히 다른 걸 누른다.
- **expo dev-client의 톱니 FAB가 헤더 우측 버튼을 덮을 수 있다.** 가려지면 FAB를 아래로
  드래그해 치우고 누를 것. 단 드래그가 탭으로도 인식돼 dev menu가 열릴 수 있으니, 열리면
  X로 닫고 다시 누른다. (Pown 자체의 [＋] FAB 오버레이와 혼동하지 말 것.)
- 좌표가 빗나가면 **베젤 오프셋을 의심할 것.** 상하 비대칭(71/27)이다. 균일하다고 가정하면
  버튼 경계 근처에서 아슬하게 빗나가 아무 반응이 없다.
- **`@gorhom/bottom-sheet` 시트가 열려 있으면** 뒤 화면 좌표는 시트에 가려 안 먹는다.
  시트를 먼저 닫거나(백드롭 탭/아래로 드래그) 시트 내부 좌표를 눌러야 한다.
- `typedRoutes` 타입(`.expo/types/router.d.ts`)은 `expo export`로는 생성되지 않는다.
  `expo start`를 잠깐 띄워야 생긴다. 라우트 문자열을 tsc로 검증하려면 이게 먼저다.
- **`git checkout -- <파일>` 로 실험을 되돌리지 말 것.** 스테이징되지 않은 변경이 함께 날아간다.
  실험 되돌리기는 Edit으로 역편집하거나, 미리 `git stash` 할 것.
- 앱 재시작은 `xcrun simctl terminate $SIM com.anonymous.workout-app` + `launch`.
  ⌘R(리로드)로는 네이티브 네비게이션 상태가 초기화되지 않아 헤더 관련 검증이 오염된다.

## 5-1. 애니메이션은 스크린샷으로 검증되지 않는다

등장 **순서**와 **감속 곡선**은 정지 프레임으로 판정할 수 없다. `simctl io screenshot` 자체가
수백 ms 걸려 원하는 프레임을 못 잡는다. 애니메이션 변경은 "요소가 뜬다"까지만 확인하고,
곡선·순서는 코드 수준 보장으로 남긴 뒤 문서에 그렇게 적을 것. 잡았다고 우기지 말 것.

## 6. 기록

화면에서 본 것은 **글로 옮겨 적는다.** "다크 모드에서 저장 버튼 텍스트 대비 정상", "저장 후
운동 탭 최상단에 오늘 기록이 추가됨" 처럼, 이미지를 열지 않고도 판정을 재구성할 수 있게 쓴다.
스크린샷은 검증을 *수행하는 수단*이지 결과물이 아니다 — 스크래치패드에 두고 저장소엔 커밋하지 않는다.

사용자에게 화면을 직접 보여줘야 하면 `sips -Z 480` 으로 리사이즈해 Artifact 페이지에 data URI로
임베드하고 링크를 전달한다. 휘발성 증거로 취급한다.
