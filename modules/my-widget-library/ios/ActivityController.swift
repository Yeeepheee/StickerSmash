import Foundation
import ActivityKit

struct TimerAttributes: ActivityAttributes {
    public struct ContentState: Codable, Hashable {
        var endTime: Date
    }
    
    var title: String
    var timerId: String 
}

@available(iOS 16.2, *)
@objc(ActivityController)
class ActivityController: NSObject {
    
    //@objc(startLiveActivity:title:timerId:)
    // func startLiveActivity(endTime: Double, title: String, timerId: String) {
    //     let attributes = TimerAttributes(title: title, timerId: timerId)
        
    //     let state = TimerAttributes.ContentState(endTime: Date(timeIntervalSince1970: endTime / 1000))
    //     let content = ActivityContent(state: state, staleDate: nil)
        
    //     do {
    //         // Specified the generic type <TimerAttributes> to ensure compiler clarity
    //         _ = try Activity<TimerAttributes>.request(attributes: attributes, content: content)
    //     } catch {
    //         print("❌ iOS Error: \(error.localizedDescription)")
    //     }
    // }

@objc(startLiveActivity:title:timerId:)
func startLiveActivity(endTime: Double, title: String, timerId: String) {
    let targetDate = Date(timeIntervalSince1970: endTime / 1000)
    let attributes = TimerAttributes(title: title, timerId: timerId)
    let state = TimerAttributes.ContentState(endTime: targetDate)

    // STALE DATE tells iOS: "After this time, this notification is old/invalid"
    let content = ActivityContent(state: state, staleDate: targetDate)
    
    do {
        _ = try Activity<TimerAttributes>.request(attributes: attributes, content: content)
    } catch {
        print("Error: \(error)")
    }
}
    

    @objc(stopLiveActivity:)
    func stopLiveActivity(timerId: String) {
        Task {
            for activity in Activity<TimerAttributes>.activities where activity.attributes.timerId == timerId {
                await activity.end(nil, dismissalPolicy: .immediate)
            }
        }
    }

    @objc static func requiresMainQueueSetup() -> Bool { return true }
}