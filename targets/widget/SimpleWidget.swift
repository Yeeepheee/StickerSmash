import WidgetKit
import SwiftUI

// MARK: - Timeline Entry
// SimpleWidget.swift

struct SimpleWidgetEntry: TimelineEntry {
    let date: Date
    let schema: WidgetSchema?
    let images: [String: Data] // <-- Add this to hold pre-fetched images
}

// MARK: - Timeline Provider
// SimpleWidget.swift

struct SimpleWidgetProvider: TimelineProvider {
    
    func placeholder(in context: Context) -> SimpleWidgetEntry {
        SimpleWidgetEntry(date: Date(), schema: nil, images: [:])
    }
    
    func getSnapshot(in context: Context, completion: @escaping (SimpleWidgetEntry) -> Void) {
        // For a quick snapshot, you can just return empty images, or perform the fetch.
        let entry = SimpleWidgetEntry(date: Date(), schema: loadSchema(), images: [:])
        completion(entry)
    }
    
    func getTimeline(in context: Context, completion: @escaping (Timeline<SimpleWidgetEntry>) -> Void) {
        let schema = loadSchema()
        var downloadedImages: [String: Data] = [:]
        
        let dispatchGroup = DispatchGroup()
        
        // 1. Find all image nodes and download their data
        if let children = schema?.children {
            for node in children {
                if case .image(let imageNode) = node, let url = URL(string: imageNode.src) {
                    dispatchGroup.enter()
                    
                    URLSession.shared.dataTask(with: url) { data, response, error in
                        if let data = data {
                            // Store the data keyed by the URL string
                            downloadedImages[imageNode.src] = data 
                        }
                        dispatchGroup.leave()
                    }.resume()
                }
            }
        }
        
        // 2. Wait for all downloads to finish, then create the timeline
        dispatchGroup.notify(queue: .main) {
            let entry = SimpleWidgetEntry(
                date: Date(),
                schema: schema,
                images: downloadedImages // <-- Pass the downloaded data
            )
            
            let timeline = Timeline(entries: [entry], policy: .atEnd)
            completion(timeline)
        }
    }
    
    private func loadSchema() -> WidgetSchema? {
        let defaults = UserDefaults(suiteName: "group.com.luminous5972.StickerSmash")
        guard let json = defaults?.string(forKey: "widgetSchema"),
              let data = json.data(using: .utf8) else { return nil }
        return try? JSONDecoder().decode(WidgetSchema.self, from: data)
    }
}

// MARK: - Widget View
// SimpleWidget.swift

struct SimpleWidgetEntryView: View {
    let entry: SimpleWidgetEntry
    
    var body: some View {
        if let schema = entry.schema {
            // Pass the images down to the renderer
            WidgetRenderer(schema: schema, images: entry.images) 
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
