import ActivityKit
import SwiftUI

struct TimerAttributes: ActivityAttributes {
    public struct ContentState: Codable, Hashable {
        var endTime: Date
        var isExpiring: Bool = false
    }
    var timerName: String
}
