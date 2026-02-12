import Foundation
import ActivityKit

struct TimerAttributes: ActivityAttributes {
    public struct ContentState: Codable, Hashable {
        var endTime: Date
    }
    // Static data: Unique to this specific Live Activity instance
    var title: String
    var timerId: String 
}

@available(iOS 16.2, *)
@objc(ActivityController)
class ActivityController: NSObject {
    
    @objc(startLiveActivity:title:timerId:)
    func startLiveActivity(endTime: Double, title: String, timerId: String) {
        let attributes = TimerAttributes(title: title, timerId: timerId)
        
        // JS sends milliseconds (Date.now()), iOS needs seconds
        let state = TimerAttributes.ContentState(endTime: Date(timeIntervalSince1970: endTime / 1000))
        let content = ActivityContent(state: state, staleDate: nil)
        
        do {
            _ = try Activity.request(attributes: attributes, content: content)
        } catch {
            print("❌ iOS Error: \(error.localizedDescription)")
        }
    }

    @objc(stopLiveActivity:)
    func stopLiveActivity(timerId: String) {
        Task {
            // Find the specific activity matching this unique timerId
            for activity in Activity<TimerAttributes>.activities where activity.attributes.timerId == timerId {
                await activity.end(nil, dismissalPolicy: .immediate)
            }
        }
    }

    @objc static func requiresMainQueueSetup() -> Bool { return true }
}