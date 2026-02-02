import ExpoModulesCore
import ActivityKit

public class ActivityControllerModule: Module {
  public func definition() -> ModuleDefinition {
    Name("ActivityController")

    Function("startLiveActivity") { (endTime: Double, timerName: String) in
      if #available(iOS 16.2, *) {
        let targetDate = Date(timeIntervalSince1970: endTime)
        
        guard ActivityAuthorizationInfo().areActivitiesEnabled else { return }

        let attributes = TimerAttributes(timerName: timerName)
        let state = TimerAttributes.ContentState(endTime: targetDate)
        let content = ActivityContent(state: state, staleDate: nil)

        do {
          _ = try Activity.request(attributes: attributes, content: content)
        } catch {
          print("Failed to start activity: \(error.localizedDescription)")
        }
      }
    }

    Function("stopLiveActivity") {
      if #available(iOS 16.2, *) {
        Task {
          for activity in Activity<TimerAttributes>.activities {
            await activity.end(dismissalPolicy: .immediate)
          }
        }
      }
    }
  }
}