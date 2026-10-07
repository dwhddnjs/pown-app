import HealthKit
import SwiftUI
import WatchKit

// 아이폰 포운이 startWatchApp(toHandle:)으로 깨우면 여기로 운동 구성이 온다
final class AppDelegate: NSObject, WKApplicationDelegate {
  func handle(_ workoutConfiguration: HKWorkoutConfiguration) {
    Task { @MainActor in await WatchWorkout.shared.start(workoutConfiguration) }
  }

  // 운동 중 앱이 죽었다 다시 떴다
  func handleActiveWorkoutRecovery() {
    Task { @MainActor in await WatchWorkout.shared.recover() }
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

// 아이폰 측정 박스와 같은 구성: 심박·상태 → 운동 시간 → 활동·총 칼로리 → 중지·종료. 스크롤 없이 늘 한 화면이다 —
// 40mm(본문 약 145×160pt)에 맞춘 크기이고, 글자 크기를 키워 넘치면 숫자가 줄어든다(버튼은 늘 맨 아래에 보인다).
// 일시정지면 숫자가 전부 흐려지고 버튼이 "재개"로 바뀐다. 숫자는 Live Activity처럼 시스템 rounded
private struct MetricsView: View {
  @ObservedObject var workout: WatchWorkout
  @State private var confirmEnd = false

  var body: some View {
    let dim: Color? = workout.isPaused ? .secondary : nil

    VStack(alignment: .leading, spacing: 2) {
      // 상태는 심박 줄 오른쪽 끝에 — 좁은 화면(40mm)에서 안 들어가면 뺀다(일시정지는 흐린 숫자·"재개" 버튼으로 보인다)
      ViewThatFits(in: .horizontal) {
        HStack(alignment: .firstTextBaseline, spacing: 4) {
          HeartRateLabel(heartRate: workout.heartRate, dim: dim)
          Spacer(minLength: 0)
          StatusLabel(isPaused: workout.isPaused)
        }
        HeartRateLabel(heartRate: workout.heartRate, dim: dim)
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

      Spacer(minLength: 0)

      // 앱 박스와 같은 색 규칙 — 중지는 회색 면, 종료는 빨강. 자리가 모자라면 위 숫자가 먼저 줄어든다
      HStack(spacing: 8) {
        PillButton(
          title: workout.isPaused ? tr("재개", "Resume") : tr("중지", "Pause"),
          fill: Color.gray.opacity(0.3)
        ) { workout.togglePause() }
        PillButton(title: tr("종료", "End"), fill: pownRed) { confirmEnd = true }
      }
      .layoutPriority(1)
    }
    .monospacedDigit()
    .lineLimit(1)
    .minimumScaleFactor(0.5)
    .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
    .scenePadding(.horizontal)
    .confirmationDialog(tr("측정을 종료할까요?", "End this session?"), isPresented: $confirmEnd) {
      Button(tr("종료", "End"), role: .destructive) { workout.end() }
    }
  }
}

// 하트 · 심박 · bpm
private struct HeartRateLabel: View {
  let heartRate: Int?
  let dim: Color?

  var body: some View {
    HStack(alignment: .firstTextBaseline, spacing: 4) {
      Image(systemName: "heart.fill")
        .font(.system(size: 18))
        .foregroundStyle(dim ?? pownRed)
      Text(heartRate.map(String.init) ?? "--")
        .font(.system(size: 36, weight: .semibold, design: .rounded))
        .foregroundStyle(dim ?? .primary)
      Text("bpm")
        .font(.footnote)
        .foregroundStyle(.secondary)
    }
  }
}

// 아이폰 박스 상태와 같은 표시 — 재는 중이면 빨간 점, 멈췄으면 회색 점
private struct StatusLabel: View {
  let isPaused: Bool

  var body: some View {
    HStack(spacing: 3) {
      Circle()
        .fill(isPaused ? Color.secondary : pownRed)
        .frame(width: 6, height: 6)
      Text(isPaused ? tr("일시정지", "Paused") : tr("측정 중", "Measuring"))
        .font(.caption2)
        .foregroundStyle(.secondary)
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
      // 40mm에선 칸이 75pt쯤이라 네 자리(1000kcal~)부터 잘린다 — 잘리지 않게 줄인다. 높이는 고정한다 —
      // 안 그러면 아래 버튼 앞 Spacer와 자리를 다투다 세로로 먼저 줄어든다
      .minimumScaleFactor(0.7)
      .fixedSize(horizontal: false, vertical: true)
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
        .padding(.vertical, 8)
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
