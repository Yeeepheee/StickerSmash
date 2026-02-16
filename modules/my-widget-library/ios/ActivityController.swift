import Foundation
import ActivityKit
import UIKit


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
    
    static let shared = ActivityController()
    
    override init() {
        super.init()
        
        // Clean up expired activities when app becomes active
        NotificationCenter.default.addObserver(
            self,
            selector: #selector(checkForExpiredActivities),
            name: UIApplication.didBecomeActiveNotification,
            object: nil
        )
    }
    
    // MARK: - Start
    
    @objc(startLiveActivity:title:timerId:)
    func startLiveActivity(endTime: Double, title: String, timerId: String) {
        
        let targetDate = Date(timeIntervalSince1970: endTime / 1000)
        
        let attributes = TimerAttributes(
            title: title,
            timerId: timerId
        )
        
        let state = TimerAttributes.ContentState(
            endTime: targetDate
        )
        
        let content = ActivityContent(
            state: state,
            staleDate: targetDate   // Important for Apple-style dimming
        )
        
        do {
            _ = try Activity<TimerAttributes>.request(
                attributes: attributes,
                content: content
            )
        } catch {
            print("Failed to start Live Activity:", error.localizedDescription)
        }
    }
    
    // MARK: - Stop Manually
    
    @objc(stopLiveActivity:)
    func stopLiveActivity(timerId: String) {
        Task {
            for activity in Activity<TimerAttributes>.activities {
                if activity.attributes.timerId == timerId {
                    await end(activity: activity)
                }
            }
        }
    }
    
    // MARK: - Local Cleanup
    
    @objc private func checkForExpiredActivities() {
        Task {
            for activity in Activity<TimerAttributes>.activities {
                if activity.content.state.endTime <= Date() {
                    await end(activity: activity)
                }
            }
        }
    }
    
    private func end(activity: Activity<TimerAttributes>) async {
        let finalState = TimerAttributes.ContentState(endTime: Date())
        
        await activity.end(
            ActivityContent(state: finalState, staleDate: nil),
            dismissalPolicy: .immediate
        )
    }
}
