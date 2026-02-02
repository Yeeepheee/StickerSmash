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