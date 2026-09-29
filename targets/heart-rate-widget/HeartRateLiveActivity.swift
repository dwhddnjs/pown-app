import ActivityKit
import SwiftUI
import WidgetKit

// 아일랜드·잠금화면을 탭하면 운동 탭이 열리고, 거기 측정 박스가 떠 있다
private let workoutURL = URL(string: "myapp://workout")

// 위젯은 앱의 언어 설정(MMKV)을 못 읽는다 — 기기 언어를 따른다.
// Locale.current는 번들이 가진 현지화(위젯엔 ko.lproj가 없다)로 좁혀져 한국어 기기에서도
// en이 나온다. 사용자가 고른 언어 목록을 직접 본다 (앱 기본값도 같은 기준이다)
private let isKorean = Locale.preferredLanguages.first?.hasPrefix("ko") ?? false

// compact는 심박(왼쪽)과 시간(오른쪽)이 바깥 모서리에서 같은 거리에 있어야 한다
private let compactInset: CGFloat = 4

@main
struct HeartRateWidgetBundle: WidgetBundle {
  var body: some Widget {
    HeartRateLiveActivity()
  }
}

struct HeartRateLiveActivity: Widget {
  var body: some WidgetConfiguration {
    ActivityConfiguration(for: HeartRateAttributes.self) { context in
      VStack(spacing: 6) {
        HStack(alignment: .firstTextBaseline) {
          HeartValue(state: context.state)
          Spacer()
          TimeValue(state: context.state)
        }
        KcalRow(state: context.state)
      }
      .padding(16)
      .widgetURL(workoutURL)
    } dynamicIsland: { context in
      // 확장 뷰는 두 줄: 카메라 양옆에 심박·시간, 아래에 칼로리.
      // 여백은 시스템 기본만 쓴다 — 더 얹으면 배너가 커 보인다
      DynamicIsland {
        DynamicIslandExpandedRegion(.leading) {
          HeartValue(state: context.state)
        }
        DynamicIslandExpandedRegion(.trailing) {
          TimeValue(state: context.state)
        }
        DynamicIslandExpandedRegion(.bottom) {
          KcalRow(state: context.state)
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

private struct HeartValue: View {
  let state: HeartRateAttributes.ContentState

  var body: some View {
    HStack(alignment: .firstTextBaseline, spacing: 3) {
      Image(systemName: "heart.fill")
        .font(.headline)
        .foregroundStyle(state.isPaused ? .secondary : Color.red)
      Text(state.bpmText)
        .font(bigNumber)
        .monospacedDigit()
        .foregroundStyle(state.isPaused ? .secondary : .primary)
      Text("bpm")
        .font(.caption)
        .foregroundStyle(.secondary)
    }
  }
}

private struct TimeValue: View {
  let state: HeartRateAttributes.ContentState

  var body: some View {
    HStack(alignment: .firstTextBaseline, spacing: 3) {
      if state.isPaused {
        Image(systemName: "pause.fill")
          .font(.headline)
          .foregroundStyle(.secondary)
      }
      TimerText(state: state)
        .font(bigNumber)
        .foregroundStyle(state.isPaused ? .secondary : .primary)
    }
  }
}

private struct KcalRow: View {
  let state: HeartRateAttributes.ContentState

  var body: some View {
    HStack {
      HStack(spacing: 4) {
        Image(systemName: "flame.fill")
          .foregroundStyle(state.isPaused ? .secondary : Color.orange)
        Text("\(isKorean ? "활동" : "Active") \(state.activeKcal) kcal")
      }
      Spacer()
      Text("\(isKorean ? "총" : "Total") \(state.totalKcal) kcal")
    }
    .font(.subheadline)
    .monospacedDigit()
    .foregroundStyle(.secondary)
  }
}

private struct TimerText: View {
  let state: HeartRateAttributes.ContentState

  var body: some View {
    Group {
      if let paused = state.pausedElapsed {
        Text(Self.format(paused))
      } else {
        // Text(timerInterval:)은 글자 길이와 상관없이 받은 폭을 다 차지한다 —
        // 가장 긴 글자를 숨겨 깔아 폭을 잡고, 그 안에 오른쪽 정렬로 얹는다.
        // 위젯은 갱신(최소 60초마다) 때만 다시 그려지므로 1시간 1분 전에 미리 넓힌다
        Text(Date().timeIntervalSince(state.timerStart) >= 3540 ? "0:00:00" : "00:00")
          .hidden()
          .overlay(alignment: .trailing) {
            // 시스템이 알아서 센다 — 앱이 매초 갱신하지 않아도 된다
            Text(timerInterval: state.timerStart...Date.distantFuture, countsDown: false)
              .multilineTextAlignment(.trailing)
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
