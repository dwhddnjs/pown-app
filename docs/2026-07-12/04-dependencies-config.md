# 04. 의존성 · 설정 · 프로젝트 관리

`package.json`, `app.json`, 개발 환경 차원의 문제들. 🔴 높음 / 🟡 중간 / 🟢 낮음.

> ✅ 표시 = 2026-07-12 처리 완료. **10건 전부 처리 완료.**
> ⚠️ **주의**: #3(네이티브 패키지 제거)·#5·#9(app.json 네이티브 설정 변경) 때문에 **다음 배포는 `eas update`(OTA)가 아닌 새 네이티브 빌드**(`eas build`)여야 하고, `app.json`의 `version`/`runtimeVersion`을 함께 올려야 한다.

---

## ✅ 🔴 1. `typescript ~5.3.3` → `~5.8.3` 업그레이드 (필수) — 수정 완료

- Expo SDK 53의 `tsconfig.base.json`이 `"module": "preserve"`(TS 5.4+)를 사용해 **현재 버전으로는 `npx tsc --noEmit`이 실행조차 안 된다** (자세한 내용은 [01-bugs #1](./01-bugs.md)).
- TS 5.8.3으로 검사 시 에러 0개 확인 완료 — 올리기만 하면 된다.
- **✅ 처리 내역 (2026-07-12)**: `typescript ~5.8.3` 설치 완료, `npx tsc --noEmit` 정상 통과 확인.

```bash
npm install -D typescript@~5.8.3
npx tsc --noEmit   # 정상 동작 확인
```

## ✅ 🟡 2. `zustand ^5.0.0-rc.2` — 릴리스 후보 버전 고정 — 수정 완료

- 프로젝트의 사실상 DB 레이어가 **RC 버전**에 걸려 있다. 5.0 정식이 나온 지 오래이므로 `^5.0.0` 정식으로 교체 권장. (semver 상 `^5.0.0-rc.2`는 정식 5.x로 올라가긴 하지만 lockfile에 rc가 박혀 있을 수 있으니 확인 필요)
- **✅ 처리 내역 (2026-07-12)**: `package.json`을 `^5.0.0`으로 교체하고 재설치 — 실제 설치 버전 **5.0.4** 확인. zustand는 순수 JS라 OTA로 배포 가능.

## ✅ 🟡 3. 미사용 의존성 8개 — 제거하면 빌드·번들 다이어트 — 수정 완료

코드 전체를 grep 한 결과 아래 패키지는 **어디서도 import되지 않는다**:

| 패키지 | 비고 |
|---|---|
| `@tanstack/react-query` | 백엔드 없음 — 사용처 없음 |
| `@rneui/themed` (rc 버전) | 사용처 없음 |
| `@react-native-google-signin/google-signin` | **네이티브 모듈** — 제거 시 네이티브 빌드도 가벼워짐 |
| `@react-navigation/stack` | expo-router는 native-stack 사용 |
| `react-native-url-polyfill` | supabase 흔적으로 추정 |
| `react-native-linear-gradient` | 사용처 없음 |
| `expo-secure-store` | 사용처 없음 |
| `expo-web-browser` | 사용처 없음 |

- 주의: 제거는 JS 변경이 아니라 **네이티브 의존성 변경**이므로 제거 후에는 `eas update`(OTA)가 아닌 **새 네이티브 빌드**가 필요하다. `runtimeVersion`도 올려야 한다.
- **✅ 처리 내역 (2026-07-12)**: 전체 소스 grep으로 8개 모두 import 0건을 재확인한 뒤 `npm uninstall`로 제거. `npx tsc --noEmit`·`npx expo lint` 통과 확인. **다음 배포는 네이티브 빌드 필수**(위 주의사항, 문서 상단 ⚠️ 참고).

## ✅ 🟡 4. 린터 부재 — 반복 문제를 잡을 장치가 없다 — 수정 완료

- 이 진단에서 나온 문제 상당수(미사용 import·변수, rules-of-hooks, 소문자 컴포넌트명, console.log)는 lint가 자동으로 잡는 부류다.
- SDK 53 표준 구성:

```bash
npx expo lint          # eslint-config-expo 자동 설정
```

- `no-console` 규칙을 켜면 "프로덕션 console.log 금지" 프로젝트 규칙도 강제된다. (현재 위반 4곳: `workout.tsx:89`, `reset-data.tsx:46,49,72`)
- **✅ 처리 내역 (2026-07-12)**: `npx expo lint`로 `eslint-config-expo` 도입(`eslint.config.js` 생성, `npm run lint` 스크립트 추가) + `no-console: error` 규칙 추가. 최초 실행 시 **46 에러 / 138 경고** → 에러 0으로 정리:
  - 소문자 화면 컴포넌트 6개를 PascalCase로 변경 (`calendar`→`Calendar`, `chart`→`Chart`, `calculate`→`Calculate`, `calendarWorkout`→`CalendarWorkout`, `note`→`Note`, `settings`→`Settings`) — rules-of-hooks 오탐의 원인이었다.
  - forwardRef 3곳(`RefView`, `SetCounterSheet`, `SearchWorkoutTagSheet`)에 `displayName` 추가.
  - 마지막 남은 `console.log`(`workout.tsx:89`) 제거 — measureLayout 에러 콜백을 조용한 no-op으로.
  - `app/_layout.tsx`의 헤더 콜백 훅 호출(React Navigation이 컴포넌트로 렌더해 실제로는 유효)은 사유 주석과 함께 파일 단위 `eslint-disable react-hooks/rules-of-hooks` — [03 #1](./03-refactoring.md) 구조 개선 때 예외 제거 예정.
  - 남은 **경고 138건**(미사용 import·변수, exhaustive-deps)은 [03 #11](./03-refactoring.md) 죽은 코드 정리에서 처리할 것.
  - CLAUDE.md의 "린터 없음" 서술도 갱신.

## ✅ 🟡 5. `aps-environment: development` 엔타이틀먼트 — 수정 완료

- **위치**: `app.json` → `ios.entitlements`
- 푸시 알림 코드가 전혀 없는데 push 엔타이틀먼트(개발 환경)가 선언돼 있다. 쓰지 않으면 제거 — 심사 시 "푸시 쓰는데 설명 없음" 류의 혼선을 예방한다. 나중에 푸시를 붙일 계획이면 production 배포 시 값이 자동 전환되는지 확인 필요.
- **✅ 처리 내역 (2026-07-12)**: `ios.entitlements` 블록 제거. 네이티브 설정 변경이므로 다음 네이티브 빌드부터 반영.

## ✅ 🟡 6. `packagerOpts`는 SDK 53에서 무시되는 레거시 키 — 수정 완료

- **위치**: `app.json:37-52`
- `sourceExts`에 svg를 넣은 설정인데, 이 역할은 이미 `metro.config.js`가 하고 있다. 혼란만 주므로 삭제 가능.
- **✅ 처리 내역 (2026-07-12)**: `packagerOpts` 블록 삭제. SVG 변환은 `metro.config.js`가 계속 담당 — 동작 변화 없음.

## ✅ 🟢 7. 버전 표기 불일치 — 수정 완료

- `package.json` `version: 1.0.0` vs `app.json` `version: 2.0.1`.
- `appVersionSource: "remote"`라 실제 배포에는 영향 없지만, 리포지토리만 보는 사람에게 혼란을 준다. package.json도 2.0.1로 맞추거나 무시한다는 걸 인지.
- **✅ 처리 내역 (2026-07-12)**: `package.json` `version`을 `2.0.1`로 통일.

## ✅ 🟢 8. 번들 ID가 `com.anonymous.workout-app` — 확인 완료 (의도적 유지)

- 템플릿 기본값(anonymous)이 그대로 출시됐다. **이미 App Store에 올라간 앱이라면 변경 불가**(새 앱 취급)이므로 그대로 두는 게 맞다 — 다만 의도된 상태임을 팀 차원에서 알고 있어야 한다. Android 쪽 `com.anonymous.workoutapp`도 동일.
- **✅ 처리 내역 (2026-07-12)**: 이미 출시된 앱이라 변경 시 새 앱 취급되므로 **변경 없이 유지**로 확정. 코드 변경 없음.

## ✅ 🟢 9. 폰트 로딩 이원화 — 수정 완료 (제안과 반대 방향)

- `app.json`의 `expo-font` 플러그인은 `SB_M.otf`만 네이티브 임베드하고, `SB_B`/`SB_L`은 `app/_layout.tsx`의 `useFonts`로 런타임 로드한다.
- 동작엔 문제없지만 세 폰트 모두 플러그인으로 임베드하면 런타임 로딩(스플래시 대기)이 사라지고 코드도 준다.
- **✅ 처리 내역 (2026-07-12)**: 원래 제안(전부 임베드)과 **반대로 `useFonts` 일원화**로 처리 — 플러그인 임베드 폰트는 iOS는 PostScript명, Android는 파일명으로 참조해야 해서 코드 전체가 쓰는 `"sb-m"`/`"sb-b"`/`"sb-l"` **별칭과 호환되지 않는다** (전 코드 fontFamily 문자열 교체가 필요해 리스크 대비 이득이 없음). 어차피 `useFonts`가 세 폰트를 모두 로드하고 있어 임베드된 SB_M은 참조되지 않는 죽은 설정이었다 → `app.json`에서 `expo-font` 플러그인 항목 삭제. 동작 변화 없음(다음 네이티브 빌드부터 바이너리에서 중복 임베드 제거).

## 🟢 10. CLAUDE.md 문서 오류 (수정 완료)

- CLAUDE.md가 `use-note-store`를 영속 스토어로 분류하고 있었는데, 실제 코드는 `persist` 없는 임시 스토어다. 이번 진단에서 발견되어 **CLAUDE.md를 바로잡았다**.
