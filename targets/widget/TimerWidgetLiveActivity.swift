import WidgetKit
import SwiftUI
import ActivityKit

struct TimerWidgetLiveActivity: Widget {
    var body: some WidgetConfiguration {
        // Use the unified TimerAttributes
        ActivityConfiguration(for: TimerAttributes.self) { context in
            // Lock Screen / Notification UI
            HStack {
                VStack(alignment: .leading) {
                    Text(context.attributes.title) // Displays "Pizza", "Gym", etc.
                        .font(.headline)
                        .foregroundColor(.white)
                    Text("ID: \(context.attributes.timerId)") // Just for verification
                        .font(.caption)
                        .foregroundColor(.gray)
                }
                Spacer()
                // style: .timer automatically handles the countdown 1Hz tick natively
                Text(context.state.endTime, style: .timer)
                    .font(.system(.title, design: .monospaced))
                    .foregroundColor(.cyan)
            }
            .padding()
            .background(Color.black.opacity(0.8))
        } dynamicIsland: { context in
            DynamicIsland {
                // Expanded UI (Long press)
                DynamicIslandExpandedRegion(.leading) {
                    Image(systemName: "timer")
                        .foregroundColor(.cyan)
                }
                DynamicIslandExpandedRegion(.trailing) {
                    Text(context.state.endTime, style: .timer)
                        .font(.title2)
                        .monospacedDigit()
                        .foregroundColor(.cyan)
                }
                DynamicIslandExpandedRegion(.bottom) {
                    Text(context.attributes.title)
                        .font(.headline)
                }
            } compactLeading: {
                Text("⏳")
            } compactTrailing: {
                // The compact view shown when only one activity is active
                Text(context.state.endTime, style: .timer)
                    .monospacedDigit()
                    .foregroundColor(.cyan)
                    .frame(width: 50)
            } minimal: {
                // Minimal "bubble" shown when multiple apps have live activities
                Text("⏳")
            }
        }
    }
}