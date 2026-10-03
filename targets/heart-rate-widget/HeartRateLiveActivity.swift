import ActivityKit
import AppIntents
import SwiftUI
import WidgetKit

// 아일랜드·잠금화면을 탭하면 운동 탭이 열리고, 거기 측정 박스가 떠 있다
private let workoutURL = URL(string: "myapp://workout")

// compact는 심박(왼쪽)과 시간(오른쪽)이 바깥 모서리에서 같은 거리에 있어야 한다
private let compactInset: CGFloat = 4

// 확장 섬·잠금화면은 애플 운동 앱 Live Activity와 같은 배치다 — 393pt 기기 3x 캡처에서 잉크를
// 잰 값에 맞췄다. 글자 칸은 잉크보다 위아래·옆이 비어 있어, 아래 값은 시뮬레이터에서 잉크를 다시
// 재며 칸 기준으로 옮긴 것이다(주석의 목표는 잉크 기준)
private enum Island {
  // 버튼 왼쪽 18.33 · 시간 잉크 오른쪽 18.67 · 버튼 위 18 · 라벨 잉크 아래 20.67
  static let margins = (leading: 18.33, trailing: 18.33, top: 18.0, bottom: 18.0)
  static let button: CGFloat = 50
  static let pause = PauseBars(width: 3.54, height: 23, gap: 5.73)
  static let time = Font.system(size: 38, weight: .semibold, design: .rounded).monospacedDigit()
  // 시간 잉크 중심은 버튼 중심보다 0.83pt 아래
  static let timeNudge: CGFloat = 0.67
  // trailing 칸은 여백보다 더 들어와 놓인다(실측) — 레퍼런스("0:26")처럼 끝이 6일 때 잉크 오른쪽을
  // 18.67에 맞춘다. 고정폭 숫자라 끝자리마다 1pt 안팎, 1은 칸 가운데 서서 3pt쯤 더 들어간다(애플도 같다)
  static let timeShift: CGFloat = 1.33
  // 버튼 아래 → 숫자 잉크 위 18
  static let statsTop: CGFloat = 3.67
}

private enum Lock {
  // 시간 잉크 왼쪽 15.33 · 버튼 오른쪽 15.17 · 버튼 위 19.67 · 라벨 잉크 아래 17.67
  static let padding = (leading: 16.33, trailing: 16.1, top: 20.17, bottom: 16.33)
  static let button: CGFloat = 48
  static let pause = PauseBars(width: 3.64, height: 25.5, gap: 6.7)
  static let time = Font.system(size: 45.5, weight: .semibold, design: .rounded).monospacedDigit()
  // 타이머 글자는 늘 고정폭 숫자라 맨 앞 숫자마다 왼쪽 빈 곳이 다르다(1이 5.2pt로 가장 넓다).
  // 왼쪽 정렬이라 그대로면 1:xx:xx 내내 3.7pt 들어가 보인다 — 맨 앞 숫자의 빈 곳만큼 당긴다.
  // 위 time 글꼴의 고정폭 숫자 글리프 왼쪽 여백(CoreText로 읽은 값)
  static let digitBearing: [Character: CGFloat] = [
    "0": 1.53, "1": 5.20, "2": 3.20, "3": 2.73, "4": 1.53,
    "5": 3.02, "6": 1.93, "7": 3.09, "8": 1.89, "9": 1.89,
  ]
  // 시간 잉크 중심은 버튼 중심보다 1.17pt 아래
  static let timeNudge: CGFloat = 1.17
  // 버튼 아래 → 숫자 잉크 위 23
  static let statsTop: CGFloat = 16.83
}

// 두 화면 공통: 버튼 사이 8. 종료 X는 버튼 지름의 0.44배(섬 22pt)
private let buttonGap: CGFloat = 8
private let endGlyphRatio: CGFloat = 0.44
private let statNumber = Font.system(size: 26.5, weight: .semibold)
private let statLabel = Font.system(size: 16, weight: .semibold)
private let heartSize: CGFloat = 16.5
// 숫자 잉크 아래 → 라벨 잉크 위 9(하트는 8)
private let statGap: CGFloat = 0.5

private let timeYellow = Color(red: 251 / 255, green: 231 / 255, blue: 83 / 255)
private let heartRed = Color(red: 235 / 255, green: 82 / 255, blue: 77 / 255)
private let buttonFill = Color(red: 57 / 255, green: 57 / 255, blue: 55 / 255)

@main
struct HeartRateWidgetBundle: WidgetBundle {
  var body: some Widget {
    HeartRateLiveActivity()
  }
}

struct HeartRateLiveActivity: Widget {
  var body: some WidgetConfiguration {
    ActivityConfiguration(for: HeartRateAttributes.self) { context in
      LockScreenView(state: context.state)
        .widgetURL(workoutURL)
    } dynamicIsland: { context in
      DynamicIsland {
        // 버튼·시간은 카메라 양옆 띠에 둔다 — 아래 칸(bottom)에 넣으면 카메라 밑으로 밀려 위가 비어 보인다
        DynamicIslandExpandedRegion(.leading) {
          ControlButtons(state: context.state, size: Island.button, pause: Island.pause)
            .frame(maxWidth: .infinity, alignment: .leading)
        }
        // 카메라 옆이라 칸이 좁다(약 103pt) — 10분이 넘어 다섯 글자가 되면 그대로는 "11:…"로
        // 잘린다. 시간 칸이 먼저 자리를 잡게 하고, 넘치는 만큼만 글자를 줄인다
        DynamicIslandExpandedRegion(.trailing, priority: 1) {
          TimeLabel(
            state: context.state, font: Island.time, alignment: .trailing, nudge: Island.timeNudge)
            .minimumScaleFactor(0.6)
            .frame(height: Island.button)
            .frame(maxWidth: .infinity, alignment: .trailing)
            .offset(x: Island.timeShift)
        }
        DynamicIslandExpandedRegion(.bottom) {
          StatsRow(state: context.state)
            .padding(.top, Island.statsTop)
        }
      } compactLeading: {
        HStack(spacing: 3) {
          Image(systemName: "heart.fill")
            .foregroundStyle(context.state.isPaused ? .secondary : Color.red)
          Text(context.state.bpmText)
            .monospacedDigit()
            .foregroundStyle(context.state.isPaused ? .secondary : .primary)
        }
        .padding(.leading, compactInset)
      } compactTrailing: {
        TimerText(state: context.state, alignment: .trailing)
          .monospacedDigit()
          .foregroundStyle(context.state.isPaused ? .secondary : .primary)
          .padding(.trailing, compactInset)
      } minimal: {
        // 다른 앱의 Live Activity(음악·타이머)와 같이 뜨면 섬이 둘로 갈리고 이 작은 원만 남는다 —
        // 하트만 두면 "숫자가 사라졌다"로 보인다. 심박이 있으면 숫자를 보인다
        if let bpm = context.state.heartRate {
          Text("\(bpm)")
            .font(.system(size: 15, weight: .semibold, design: .rounded))
            .monospacedDigit()
            .minimumScaleFactor(0.6)
            .lineLimit(1)
            .foregroundStyle(context.state.isPaused ? .secondary : heartRed)
        } else {
          Image(systemName: "heart.fill")
            .foregroundStyle(context.state.isPaused ? .secondary : heartRed)
        }
      }
      .contentMargins(.leading, Island.margins.leading, for: .expanded)
      .contentMargins(.trailing, Island.margins.trailing, for: .expanded)
      .contentMargins(.top, Island.margins.top, for: .expanded)
      .contentMargins(.bottom, Island.margins.bottom, for: .expanded)
      .widgetURL(workoutURL)
      .keylineTint(.red)
    }
  }
}

private extension HeartRateAttributes.ContentState {
  var isPaused: Bool { pausedElapsed != nil }
  // 최근 30초 안에 심박이 없으면 멈춘 숫자 대신 "--"
  var bpmText: String { heartRate.map(String.init) ?? "--" }
}

// 위젯은 문구가 몇 개뿐이라 워치 앱처럼 시스템 언어로 고른다. 앱 문구(lib/i18n.ts의
// heartRate.activeKcal·totalKcal)와 같은 말을 쓴다
private func tr(_ ko: String, _ en: String) -> String {
  Locale.preferredLanguages.first?.hasPrefix("ko") == true ? ko : en
}

// 잠금화면: [운동 시간 ……… 중지·종료] / [심박 · 활동 칼로리 · 총 칼로리].
// 애플처럼 라이트 모드에서도 어두운 카드다
private struct LockScreenView: View {
  let state: HeartRateAttributes.ContentState

  var body: some View {
    VStack(spacing: 0) {
      HStack(spacing: 0) {
        TimeLabel(state: state, font: Lock.time, alignment: .leading, nudge: Lock.timeNudge)
          .frame(height: Lock.button)
          // 그리는 순간의 맨 앞 숫자 기준 — 위젯은 심박 갱신 때마다(몇 초) 다시 그려져, 자릿수가
          // 바뀌는 순간에만 잠깐 어긋난다
          .offset(x: -(TimerText.text(for: state).first.flatMap { Lock.digitBearing[$0] } ?? 0))
        Spacer(minLength: 0)
        ControlButtons(state: state, size: Lock.button, pause: Lock.pause)
      }
      StatsRow(state: state)
        .padding(.top, Lock.statsTop)
    }
    .padding(.leading, Lock.padding.leading)
    .padding(.trailing, Lock.padding.trailing)
    .padding(.top, Lock.padding.top)
    .padding(.bottom, Lock.padding.bottom)
    .environment(\.colorScheme, .dark)
    .activityBackgroundTint(Color.black)
    .activitySystemActionForegroundColor(.white)
  }
}

// 노란 운동 시간. 일시정지면 앱 박스처럼 흐린다
private struct TimeLabel: View {
  let state: HeartRateAttributes.ContentState
  let font: Font
  let alignment: Alignment
  let nudge: CGFloat

  var body: some View {
    TimerText(state: state, alignment: alignment)
      .font(font)
      .lineLimit(1)
      .foregroundStyle(state.isPaused ? .secondary : timeYellow)
      .offset(y: nudge)
  }
}

// 세 칸은 위 줄과 같은 좌우 여백 안에서 앞·사이·뒤 간격을 똑같이 나눈다 — 애플 캡처 두 장이
// 모두 이 규칙으로 0.35pt 안에서 맞았다. 칸 폭(라벨 길이)이 바뀌면 위치도 따라 바뀐다
private struct StatsRow: View {
  let state: HeartRateAttributes.ContentState

  var body: some View {
    HStack(alignment: .top, spacing: 0) {
      Spacer(minLength: 0)
      StatColumn(value: state.bpmText, isPaused: state.isPaused) {
        Image(systemName: "heart.fill")
          .font(.system(size: heartSize))
          .foregroundStyle(state.isPaused ? .secondary : heartRed)
          // 하트 잉크 위는 라벨 잉크 위보다 1pt 높다(애플) — 칸 기준으론 0.5 내린다
          .offset(y: 0.5)
      }
      Spacer(minLength: 0)
      StatColumn(value: "\(state.activeKcal)", isPaused: state.isPaused) {
        Text(tr("활동 칼로리", "Active")).font(statLabel)
      }
      Spacer(minLength: 0)
      StatColumn(value: "\(state.totalKcal)", isPaused: state.isPaused) {
        Text(tr("총 칼로리", "Total")).font(statLabel)
      }
      Spacer(minLength: 0)
    }
    .lineLimit(1)
  }
}

// 숫자 위·라벨 아래 한 칸. 일시정지면 숫자만 흐린다 — 라벨은 그대로(앱 박스와 같은 규칙)
private struct StatColumn<Label: View>: View {
  let value: String
  let isPaused: Bool
  @ViewBuilder let label: Label

  var body: some View {
    VStack(spacing: statGap) {
      Text(value)
        .font(statNumber)
        .monospacedDigit()
        .foregroundStyle(isPaused ? .secondary : .primary)
      label
    }
  }
}

// 앱 박스와 같은 색 규칙 — 중지는 회색 면, 종료는 빨강
private struct ControlButtons: View {
  let state: HeartRateAttributes.ContentState
  let size: CGFloat
  let pause: PauseBars

  var body: some View {
    HStack(spacing: buttonGap) {
      ControlButton(action: state.isPaused ? "resume" : "pause", fill: buttonFill, size: size) {
        if state.isPaused {
          Image(systemName: "play.fill")
            .font(.system(size: pause.height, weight: .semibold))
            .foregroundStyle(.white)
        } else {
          pause
        }
      }
      ControlButton(action: "end", fill: Color.red.opacity(0.25), size: size) {
        Image(systemName: "xmark")
          .font(.system(size: size * endGlyphRatio, weight: .bold))
          .foregroundStyle(.red)
      }
    }
  }
}

// 애플 운동 앱의 일시정지 — 둥근 막대 둘. SF Symbol pause는 굵기 단계(semibold 3.0·bold 3.7pt)
// 사이 값이라 실측 크기로 직접 그린다
private struct PauseBars: View {
  let width: CGFloat
  let height: CGFloat
  let gap: CGFloat

  var body: some View {
    HStack(spacing: gap) {
      Capsule().frame(width: width, height: height)
      Capsule().frame(width: width, height: height)
    }
    .foregroundStyle(.white)
  }
}

// 누르면 앱이 앞으로 나오지 않고 그 자리에서 처리된다 (HeartRateControlIntent)
private struct ControlButton<Label: View>: View {
  let action: String
  let fill: Color
  let size: CGFloat
  @ViewBuilder let label: Label

  var body: some View {
    Button(intent: HeartRateControlIntent(action: action)) {
      label
        .frame(width: size, height: size)
        .background(fill, in: Circle())
    }
    .buttonStyle(.plain)
  }
}

private struct TimerText: View {
  let state: HeartRateAttributes.ContentState
  let alignment: Alignment

  var body: some View {
    Group {
      if let paused = state.pausedElapsed {
        Text(Self.format(paused))
      } else {
        // Text(timerInterval:)은 글자 길이와 상관없이 받은 폭을 다 차지한다 —
        // 지금 자릿수의 가장 긴 글자를 숨겨 깔아 폭을 잡고, 그 안에 얹는다. 미리 넓게 잡으면
        // 좁은 섬 칸에서 글자가 줄어든다. 위젯은 갱신(최소 60초마다) 때만 다시 그려지므로
        // 자릿수가 바뀌기 1분 전에 넓힌다
        Text(Self.widest(Date().timeIntervalSince(state.timerStart)))
          .hidden()
          .overlay(alignment: alignment) {
            // 시스템이 알아서 센다 — 앱이 매초 갱신하지 않아도 된다
            Text(timerInterval: state.timerStart...Date.distantFuture, countsDown: false)
              .multilineTextAlignment(alignment == .leading ? .leading : .trailing)
          }
      }
    }
  }

  // 지금 보이는 글자
  static func text(for state: HeartRateAttributes.ContentState) -> String {
    format(state.pausedElapsed ?? Int(Date().timeIntervalSince(state.timerStart)))
  }

  static func widest(_ elapsed: TimeInterval) -> String {
    elapsed >= 3540 ? "0:00:00" : elapsed >= 540 ? "00:00" : "0:00"
  }

  static func format(_ seconds: Int) -> String {
    let hours = seconds / 3600
    let minutes = seconds / 60 % 60
    let rest = seconds % 60
    return hours > 0
      ? String(format: "%d:%02d:%02d", hours, minutes, rest)
      : String(format: "%d:%02d", minutes, rest)
  }
}
