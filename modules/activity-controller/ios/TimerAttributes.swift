import ActivityKit
import Foundation

// This structure defines the "schema" of your Live Activity
struct TimerAttributes: ActivityAttributes {
    public struct ContentState: Codable, Hashable {
        // Dynamic data: This changes (the time remaining)
        var endTime: Date
    }

    // Static data: This stays the same (e.g., the title of the timer)
    var timerName: String
}