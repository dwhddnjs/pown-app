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

struct ContentView: View {
  @ObservedObject private var workout = WatchWorkout.shared

  var body: some View {
    VStack(spacing: 4) {
      if workout.isRunning {
        Text(workout.heartRate.map(String.init) ?? "--")
          .font(.system(size: 48, weight: .bold, design: .rounded))
          .monospacedDigit()
        Text("bpm").foregroundStyle(.secondary)
      } else {
        // 대기 안내, 또는 시작이 실패했으면 그 이유(스파이크 진단용)
        Text(workout.status)
          .font(.footnote)
          .multilineTextAlignment(.center)
      }
    }
    .padding()
  }
}
