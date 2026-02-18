import WidgetKit
import SwiftUI

// MARK: - Timeline Entry
struct SimpleWidgetEntry: TimelineEntry {
    let date: Date
    let schema: WidgetSchema?
}

// MARK: - Timeline Provider
struct SimpleWidgetProvider: TimelineProvider {
    
    func placeholder(in context: Context) -> SimpleWidgetEntry {
        SimpleWidgetEntry(date: Date(), schema: nil)
    }
    
    func getSnapshot(in context: Context, completion: @escaping (SimpleWidgetEntry) -> Void) {
        let entry = SimpleWidgetEntry(date: Date(), schema: loadSchema())
        completion(entry)
    }
    
func getTimeline(in context: Context, completion: @escaping (Timeline<SimpleWidgetEntry>) -> Void) {

    let entry = SimpleWidgetEntry(
        date: Date(),
        schema: loadSchema()
    )

    let timeline = Timeline(entries: [entry], policy: .atEnd)
    completion(timeline)
}


    
    // Load JSON schema from App Group
    private func loadSchema() -> WidgetSchema? {
        let defaults = UserDefaults(suiteName: "group.com.luminous5972.StickerSmash")
        guard let json = defaults?.string(forKey: "widgetSchema"),
              let data = json.data(using: .utf8) else { return nil }
        return try? JSONDecoder().decode(WidgetSchema.self, from: data)
    }
}

// MARK: - Widget View
struct SimpleWidgetEntryView: View {
    let entry: SimpleWidgetEntry
    
    var body: some View {
        if let schema = entry.schema {
            WidgetRenderer(schema: schema)
        } else {
            Text("No Content")
                .frame(maxWidth: .infinity, maxHeight: .infinity)
                .background(Color.gray.opacity(0.2))
        }
    }
}

// MARK: - Widget Configuration
struct SimpleWidget: Widget {
    let kind: String = "SimpleWidget"
    
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: SimpleWidgetProvider()) { entry in
            SimpleWidgetEntryView(entry: entry)
        }
        .configurationDisplayName("JSX Widget Builder")
        .description("Render user-defined JSX-like layouts.")
        .supportedFamilies([.systemSmall, .systemMedium, .systemLarge])
    }
}
