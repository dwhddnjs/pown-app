import ActivityKit
import AppIntents
import SwiftUI
import WidgetKit

// 아일랜드·잠금화면을 탭하면 운동 탭이 열리고, 거기 측정 박스가 떠 있다
private let workoutURL = URL(string: "myapp://workout")

// compact는 심박(왼쪽)과 시간(오른쪽)이 바깥 모서리에서 같은 거리에 있어야 한다
private let compactInset: CGFloat = 4

// 확장 뷰 여백. 한 줄은 카메라(섬 위쪽 37pt) 아래에 놓이므로 위는 하드웨어 자리다 —
// 나머지 세 변을 같게 둔다: 잉크에서 섬 가장자리까지 좌 28.5 = 우 28.5 = 아래 28.5pt
// (시뮬레이터 캡처 실측). 왼쪽 아래 불꽃에서 곡선까지도 19pt 넘게 떨어진다
private let expandedInset = (leading: 28.0, trailing: 28.0, top: 12.0, bottom: 26.0)

// 버튼 지름 = 왼쪽 두 줄(심박·칼로리)의 잉크 높이. 숫자 위 여백·글자 아래 여백을 뺀 실측값
private let buttonSize: CGFloat = 36.5

@main
struct HeartRateWidgetBundle: WidgetBundle {
  var body: some Widget {
    HeartRateLiveActivity()
  }
}

struct HeartRateLiveActivity: Widget {
  var body: some WidgetConfiguration {
    ActivityConfiguration(for: HeartRateAttributes.self) { context in
      ActivityRow(state: context.state)
        .padding(16)
        .widgetURL(workoutURL)
    } dynamicIsland: { context in
      // 카메라 아래 한 줄만 쓴다 — 가운데 시간이 카메라와 겹치지 않게 양옆(leading/trailing)은 비운다
      DynamicIsland {
        DynamicIslandExpandedRegion(.bottom) {
          ActivityRow(state: context.state)
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
        TimerText(state: context.state)
          .foregroundStyle(context.state.isPaused ? .secondary : .primary)
          .padding(.trailing, compactInset)
      } minimal: {
        Image(systemName: "heart.fill")
          .foregroundStyle(context.state.isPaused ? .secondary : Color.red)
      }
      .contentMargins(.leading, expandedInset.leading, for: .expanded)
      .contentMargins(.trailing, expandedInset.trailing, for: .expanded)
      .contentMargins(.top, expandedInset.top, for: .expanded)
      .contentMargins(.bottom, expandedInset.bottom, for: .expanded)
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

// 일시정지면 숫자를 흐린다 — 앱의 측정 박스와 같은 규칙
private let bigNumber = Font.system(size: 28, weight: .semibold, design: .rounded)
private let heartNumber = Font.system(size: 20, weight: .semibold, design: .rounded)

// 확장 섬과 잠금화면이 같이 쓰는 한 줄: [심박·칼로리] [운동 시간] [일시정지·종료].
// 양옆 칸을 같은 폭으로 둬야 가운데 시간이 한가운데 온다 — Spacer로 벌리면 양옆 폭
// 차이만큼 시간이 한쪽으로 밀린다
private struct ActivityRow: View {
  let state: HeartRateAttributes.ContentState

  var body: some View {
    HStack(spacing: 0) {
      VStack(alignment: .leading, spacing: 2) {
        HStack(alignment: .firstTextBaseline, spacing: 3) {
          Image(systemName: "heart.fill")
            .font(.system(size: 13))
            .foregroundStyle(state.isPaused ? .secondary : Color.red)
          Text(state.bpmText)
            .font(heartNumber)
            .foregroundStyle(state.isPaused ? .secondary : .primary)
          Text("bpm")
            .font(.caption2)
            .foregroundStyle(.secondary)
        }
        HStack(spacing: 3) {
          Image(systemName: "flame.fill")
            .foregroundStyle(state.isPaused ? .secondary : Color.orange)
          Text("\(state.activeKcal) kcal")
        }
        .font(.footnote)
        .foregroundStyle(.secondary)
      }
      .monospacedDigit()
      .lineLimit(1)
      // 두 줄 묶음은 숫자 위 여백이 글자 아래 여백보다 커서, 줄 박스 가운데로 세우면 잉크가
      // 시간·버튼보다 1.75pt 내려앉는다(실측) — 잉크 중심을 맞춘다
      .offset(y: -1.75)
      .frame(maxWidth: .infinity, alignment: .leading)

      TimerText(state: state, centered: true)
        .font(bigNumber)
        .lineLimit(1)
        .minimumScaleFactor(0.65)
        .foregroundStyle(state.isPaused ? .secondary : .primary)

      // 앱 박스와 같은 색 규칙 — 중지는 회색, 종료는 빨강
      HStack(spacing: 8) {
        ControlButton(
          action: state.isPaused ? "resume" : "pause",
          symbol: state.isPaused ? "play.fill" : "pause.fill",
          tint: .primary,
          fill: Color.gray.opacity(0.3))
        ControlButton(action: "end", symbol: "xmark", tint: .red, fill: Color.red.opacity(0.25))
      }
      .frame(maxWidth: .infinity, alignment: .trailing)
    }
  }
}

// 누르면 앱이 앞으로 나오지 않고 그 자리에서 처리된다 (HeartRateControlIntent)
private struct ControlButton: View {
  let action: String
  let symbol: String
  let tint: Color
  let fill: Color

  var body: some View {
    Button(intent: HeartRateControlIntent(action: action)) {
      Image(systemName: symbol)
        .font(.system(size: 14, weight: .bold))
        .foregroundStyle(tint)
        .frame(width: buttonSize, height: buttonSize)
        .background(fill, in: Circle())
    }
    .buttonStyle(.plain)
  }
}

private struct TimerText: View {
  let state: HeartRateAttributes.ContentState
  // 확장 섬은 가운데, 컴팩트는 오른쪽 끝에 붙인다
  var centered = false

  var body: some View {
    Group {
      if let paused = state.pausedElapsed {
        Text(Self.format(paused))
      } else {
        // Text(timerInterval:)은 글자 길이와 상관없이 받은 폭을 다 차지한다 —
        // 가장 긴 글자를 숨겨 깔아 폭을 잡고, 그 안에 얹는다.
        // 위젯은 갱신(최소 60초마다) 때만 다시 그려지므로 1시간 1분 전에 미리 넓힌다
        Text(Date().timeIntervalSince(state.timerStart) >= 3540 ? "0:00:00" : "00:00")
          .hidden()
          .overlay(alignment: centered ? .center : .trailing) {
            // 시스템이 알아서 센다 — 앱이 매초 갱신하지 않아도 된다
            Text(timerInterval: state.timerStart...Date.distantFuture, countsDown: false)
              .multilineTextAlignment(centered ? .center : .trailing)
          }
      }
    }
    .monospacedDigit()
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
