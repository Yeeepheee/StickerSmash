import WidgetKit
import SwiftUI

struct TimerWidgetLiveActivity: Widget {
    var body: some WidgetConfiguration {
        ActivityConfiguration(for: TimerAttributes.self) { context in
            // Lock Screen UI
            HStack {
                VStack(alignment: .leading) {
                    Text(context.attributes.timerName).font(.headline)
                    Text("Time Remaining")
                }
                Spacer()
                Text(context.state.endTime, style: .timer) // NATIVE COUNTDOWN
                    .font(.title)
            }
            .padding()
        } dynamicIsland: { context in
            DynamicIsland {
                DynamicIslandExpandedRegion(.leading) { Text("⏳") }
                DynamicIslandExpandedRegion(.trailing) {
                    Text(context.state.endTime, style: .timer)
                }
                DynamicIslandExpandedRegion(.bottom) {
                    Text(context.attributes.timerName)
                }
            } compactLeading: {
                Text("⏳")
            } compactTrailing: {
                Text(context.state.endTime, style: .timer)
            } minimal: {
                Text("⏳")
            }
        }
    }
}


// Ensure you target iOS 17.0+ for the #Preview macro
@available(iOS 17.0, *)
#Preview("Lock Screen", as: .content, using: TimerAttributes(timerName: "Pizza Timer")) {
    TimerWidgetLiveActivity()
} contentStates: {
    TimerAttributes.ContentState(endTime: Date().addingTimeInterval(60 * 5)) // 5 mins remaining
    TimerAttributes.ContentState(endTime: Date().addingTimeInterval(10))      // 10 secs remaining
}

@available(iOS 17.0, *)
#Preview("Dynamic Island Compact", as: .dynamicIsland(.compact), using: TimerAttributes(timerName: "Meeting")) {
    TimerWidgetLiveActivity()
} contentStates: {
    TimerAttributes.ContentState(endTime: Date().addingTimeInterval(60 * 15))
}

@available(iOS 17.0, *)
#Preview("Dynamic Island Expanded", as: .dynamicIsland(.expanded), using: TimerAttributes(timerName: "Workout")) {
    TimerWidgetLiveActivity()
} contentStates: {
    TimerAttributes.ContentState(endTime: Date().addingTimeInterval(60 * 25))
}

@available(iOS 17.0, *)
#Preview("Dynamic Island Minimal", as: .dynamicIsland(.minimal), using: TimerAttributes(timerName: "Egg Timer")) {
    TimerWidgetLiveActivity()
} contentStates: {
    TimerAttributes.ContentState(endTime: Date().addingTimeInterval(60))
}
