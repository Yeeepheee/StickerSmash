import ActivityKit
import SwiftUI

struct TimerAttributes: ActivityAttributes {
    public struct ContentState: Codable, Hashable {
        var endTime: Date
    }
    // Static data: Unique to this specific Live Activity instance
    var title: String
    var timerId: String 
}
