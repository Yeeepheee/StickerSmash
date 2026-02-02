import Foundation
import ActivityKit

// 1. Define the data structure for the Live Activity
struct TimerAttributes: ActivityAttributes {
    public struct ContentState: Codable, Hashable {
        // This is the timestamp when the timer should end
        var endTime: Date
    }
    // Static data (doesn't change)
    var timerName: String
}

@available(iOS 16.1, *)
@objc(ActivityController)
class ActivityController: NSObject {
    
    // Reference to the active activity so we can stop it later
    private var currentActivity: Activity<TimerAttributes>?

    @objc(startLiveActivity:timerName:)
    func startLiveActivity(endTime: Double, timerName: String) {
        if #available(iOS 16.2, *) {
            // Prepare the static attributes
            let attributes = TimerAttributes(timerName: timerName)
            
            // Prepare the dynamic state (converting JS timestamp to Swift Date)
            let initialContentState = TimerAttributes.ContentState(
                endTime: Date(timeIntervalSince1970: endTime)
            )
            
            let activityContent = ActivityContent(state: initialContentState, staleDate: nil)
            
            do {
                // 2. Request the Live Activity
                currentActivity = try Activity<TimerAttributes>.request(
                    attributes: attributes,
                    content: activityContent,
                    pushType: nil // Use nil for local-only updates
                )
                print("✅ Live Activity Started: \(currentActivity?.id ?? "unknown")")
            } catch (let error) {
                print("❌ Error starting Live Activity: \(error.localizedDescription)")
            }
        }
    }

    @objc(stopLiveActivity)
    func stopLiveActivity() {
        if #available(iOS 16.2, *) {
            Task {
                // 3. End all active activities of this type
                for activity in Activity<TimerAttributes>.activities {
                    await activity.end(dismissalPolicy: .immediate)
                }
                print("✅ Live Activity Stopped")
            }
        }
    }

    @objc static func requiresMainQueueSetup() -> Bool { return true }
}
