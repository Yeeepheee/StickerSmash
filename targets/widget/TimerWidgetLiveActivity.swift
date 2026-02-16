import WidgetKit
import SwiftUI
import ActivityKit

struct TimerWidgetLiveActivity: Widget {
    var body: some WidgetConfiguration {
        ActivityConfiguration(for: TimerAttributes.self) { context in
            // Lock Screen / Banner View
            LockScreenTimerView(context: context)
                .activityBackgroundTint(Color.black.opacity(0.6))
                .activitySystemActionForegroundColor(Color.orange)
            
        } dynamicIsland: { context in
            DynamicIsland {
                // Expanded UI
                DynamicIslandExpandedRegion(.leading) {
                    Image(systemName: "timer")
                        .font(.title2)
                        .foregroundStyle(.orange)
                        .padding(.leading, 8)
                }
                
                DynamicIslandExpandedRegion(.trailing) {
                    Text(context.attributes.title)
                        .font(.caption)
                        .foregroundStyle(.secondary)
                        .padding(.trailing, 8)
                }
                
                DynamicIslandExpandedRegion(.center) {
                    Text(timerInterval: Date()...context.state.endTime, countsDown: true)
                        .monospacedDigit()
                        .font(.system(size: 44, weight: .medium, design: .rounded))
                        .foregroundStyle(.orange)
                }
                
            } compactLeading: {
                Image(systemName: "timer")
                    .foregroundStyle(.orange)
            } compactTrailing: {
                Text(timerInterval: Date()...context.state.endTime, countsDown: true)
                    .monospacedDigit()
                    .foregroundStyle(.orange)
                    .frame(width: 50)
            } minimal: {
                Image(systemName: "timer")
                    .foregroundStyle(.orange)
            }
        }
    }
}

// MARK: - Refined Lock Screen View

struct LockScreenTimerView: View {
    let context: ActivityViewContext<TimerAttributes>
    
    var body: some View {
        HStack {
            VStack(alignment: .leading, spacing: 2) {
                Text(context.attributes.title.uppercased())
                    .font(.system(size: 12, weight: .semibold))
                    .foregroundStyle(.orange)
                
                Text(timerInterval: Date()...context.state.endTime, countsDown: true)
                    .monospacedDigit()
                    .font(.system(size: 38, weight: .medium, design: .rounded))
            }
        }
        .padding(.horizontal, 20)
        .padding(.vertical, 15)
    }
}