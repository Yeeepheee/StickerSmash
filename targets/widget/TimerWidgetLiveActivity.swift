import WidgetKit
import SwiftUI
import ActivityKit

struct TimerWidgetLiveActivity: Widget {
    var body: some WidgetConfiguration {
        ActivityConfiguration(for: TimerAttributes.self) { context in
            HStack {
                VStack(alignment: .leading) {
                    Text(context.attributes.title)
                        .font(.headline)
                        .foregroundColor(.white)
                    Text("ID: \(context.attributes.timerId)")
                        .font(.caption)
                        .foregroundColor(.gray)
                }
                Spacer()
                Text(context.state.endTime, style: .timer)
                    .font(.system(.title, design: .monospaced))
                    .foregroundColor(.cyan)
            }
            .padding()
            .background(Color.black.opacity(0.8))
        } dynamicIsland: { context in
            DynamicIsland {
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
                Text(context.state.endTime, style: .timer)
                    .monospacedDigit()
                    .foregroundColor(.cyan)
                    .frame(width: 50)
            } minimal: {
                Text("⏳")
            }
        }
    }
}