import Foundation
import ActivityKit

struct TimerAttributes: ActivityAttributes {
    public struct ContentState: Codable, Hashable {
        var endTime: Date
        var isExpiring: Bool
    }
    var timerName: String
}

@available(iOS 16.2, *)
@objc(ActivityController)
class ActivityController: NSObject {
    
    @objc(startLiveActivity:timerName:)
    func startLiveActivity(endTime: Double, timerName: String) {
        let attributes = TimerAttributes(timerName: timerName)
        let state = TimerAttributes.ContentState(
            endTime: Date(timeIntervalSince1970: endTime), 
            isExpiring: false
        )
        
        let staleDate = Date(timeIntervalSince1970: endTime).addingTimeInterval(60)
        let content = ActivityContent(state: state, staleDate: staleDate)
        
        do {
            _ = try Activity.request(attributes: attributes, content: content)
            print("✅ Activity Started")
        } catch {
            print("❌ Error: \(error.localizedDescription)")
        }
    }

    @objc(updateLiveActivity:isExpiring:)
    func updateLiveActivity(endTime: Double, isExpiring: Bool) {
        Task {
            let newState = TimerAttributes.ContentState(
                endTime: Date(timeIntervalSince1970: endTime),
                isExpiring: isExpiring
            )
            
            let alertConfiguration = isExpiring ? AlertConfiguration(title: "Timer Ending!", body: "Your timer is almost up", sound: .default) : nil
            
            for activity in Activity<TimerAttributes>.activities {
                // Pass alertConfiguration to trigger a notification/Dynamic Island expansion
                await activity.update(ActivityContent(state: newState, staleDate: nil), alertConfiguration: alertConfiguration)
            }
        }
    }

    @objc(stopLiveActivity)
    func stopLiveActivity() {
        Task {
            for activity in Activity<TimerAttributes>.activities {
                await activity.end(nil, dismissalPolicy: .immediate)
            }
        }
    }

    @objc static func requiresMainQueueSetup() -> Bool { return true }
}
