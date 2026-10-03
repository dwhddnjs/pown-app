import HealthKit
import SwiftUI
import WatchKit

// 아이폰 포운이 startWatchApp(toHandle:)으로 깨우면 여기로 운동 구성이 온다
final class AppDelegate: NSObject, WKApplicationDelegate {
  func handle(_ workoutConfiguration: HKWorkoutConfiguration) {
    Task { @MainActor in await WatchWorkout.shared.start(workoutConfiguration) }
  }
}

@main
struct PownWatchApp: App {
  @WKApplicationDelegateAdaptor private var delegate: AppDelegate

  var body: some Scene {
    WindowGroup { ContentView() }
  }
}

// 앱 테마의 fail(#F13C33) — 아이폰 측정 박스의 하트·종료 버튼과 같은 빨강
private let pownRed = Color(red: 241 / 255, green: 60 / 255, blue: 51 / 255)

struct ContentView: View {
  @ObservedObject private var workout = WatchWorkout.shared

  var body: some View {
    if workout.isRunning {
      MetricsView(workout: workout)
    } else {
      VStack(spacing: 8) {
        Image(systemName: "heart.fill")
          .font(.system(size: 28))
          .foregroundStyle(pownRed)
        // 대기 안내, 또는 시작이 실패했으면 그 안내
        Text(workout.status)
          .font(.footnote)
          .multilineTextAlignment(.center)
          .foregroundStyle(.secondary)
      }
      .padding()
    }
  }
}

// 아이폰 측정 박스와 같은 구성: 심박 → 운동 시간 → 활동·총 칼로리 → 중지·종료.
// 숫자는 Live Activity처럼 시스템 rounded, 일시정지면 전부 흐린다
private struct MetricsView: View {
  @ObservedObject var workout: WatchWorkout
  @State private var confirmEnd = false

  var body: some View {
    let dim: Color? = workout.isPaused ? .secondary : nil

    ScrollView {
      VStack(alignment: .leading, spacing: 6) {
        HStack(spacing: 5) {
          Circle()
            .fill(workout.isPaused ? Color.secondary : pownRed)
            .frame(width: 6, height: 6)
          Text(workout.isPaused ? tr("일시정지", "Paused") : tr("측정 중", "Measuring"))
            .font(.footnote)
            .foregroundStyle(.secondary)
        }

        HStack(alignment: .firstTextBaseline, spacing: 4) {
          Image(systemName: "heart.fill")
            .font(.system(size: 18))
            .foregroundStyle(dim ?? pownRed)
          Text(workout.heartRate.map(String.init) ?? "--")
            .font(.system(size: 40, weight: .semibold, design: .rounded))
            .foregroundStyle(dim ?? .primary)
          Text("bpm")
            .font(.footnote)
            .foregroundStyle(.secondary)
        }

        // 일시정지 중엔 빌더 경과 시간이 멈춰 있어 그대로 그리면 된다
        TimelineView(.periodic(from: .now, by: 1)) { context in
          Text(formatElapsed(workout.elapsed(at: context.date)))
            .font(.system(size: 28, weight: .semibold, design: .rounded))
            .foregroundStyle(dim ?? .primary)
        }

        HStack(alignment: .top) {
          Stat(label: tr("활동 칼로리", "Active"), value: workout.activeKcal, dim: dim)
          Stat(label: tr("총 칼로리", "Total"), value: workout.totalKcal, dim: dim)
        }

        // 앱 박스와 같은 색 규칙 — 중지는 회색 면, 종료는 빨강
        HStack(spacing: 8) {
          PillButton(
            title: workout.isPaused ? tr("재개", "Resume") : tr("중지", "Pause"),
            fill: Color.gray.opacity(0.3)
          ) { workout.togglePause() }
          PillButton(title: tr("종료", "End"), fill: pownRed) { confirmEnd = true }
        }
        .padding(.top, 4)
      }
      .monospacedDigit()
      .lineLimit(1)
      .frame(maxWidth: .infinity, alignment: .leading)
    }
    .confirmationDialog(tr("측정을 종료할까요?", "End this session?"), isPresented: $confirmEnd) {
      Button(tr("종료", "End"), role: .destructive) { workout.end() }
    }
  }
}

// 라벨 위·숫자 아래 한 칸 — 아이폰 측정 박스의 Stat과 같은 배치
private struct Stat: View {
  let label: String
  let value: Int
  let dim: Color?

  var body: some View {
    VStack(alignment: .leading, spacing: 0) {
      Text(label)
        .font(.caption2)
        .foregroundStyle(.secondary)
      HStack(alignment: .firstTextBaseline, spacing: 2) {
        Text("\(value)")
          .font(.system(size: 18, weight: .medium, design: .rounded))
          .foregroundStyle(dim ?? .primary)
        Text("kcal")
          .font(.caption2)
          .foregroundStyle(.secondary)
      }
    }
    .frame(maxWidth: .infinity, alignment: .leading)
  }
}

private struct PillButton: View {
  let title: String
  let fill: Color
  let action: () -> Void

  var body: some View {
    Button(action: action) {
      Text(title)
        .font(.system(size: 15, weight: .semibold))
        .frame(maxWidth: .infinity)
        .padding(.vertical, 10)
        .background(fill, in: Capsule())
        .contentShape(Capsule())
    }
    .buttonStyle(.plain)
  }
}

// 아이폰 박스(formatElapsed)와 같은 표기: 1시간 전엔 m:ss, 넘으면 h:mm:ss
private func formatElapsed(_ interval: TimeInterval) -> String {
  let seconds = Int(interval)
  let hours = seconds / 3600
  let minutes = seconds / 60 % 60
  let rest = seconds % 60
  return hours > 0
    ? String(format: "%d:%02d:%02d", hours, minutes, rest)
    : String(format: "%d:%02d", minutes, rest)
}
