import WidgetKit
import SwiftUI

// MARK: - Timeline Entry

struct SimpleWidgetEntry: TimelineEntry {
    let date: Date
    let config: MultiSizeWidgetConfig?
    let images: [String: Data]
    let remoteData: [String: NodeOverride]
}

// MARK: - Provider

struct SlotWidgetProvider: TimelineProvider {
    let widgetId: String

    func placeholder(in context: Context) -> SimpleWidgetEntry {
        SimpleWidgetEntry(date: Date(), config: nil, images: [:], remoteData: [:])
    }

    func getSnapshot(in context: Context, completion: @escaping (SimpleWidgetEntry) -> Void) {
        let entry = SimpleWidgetEntry(date: Date(), config: loadConfig(), images: [:], remoteData: [:])
        completion(entry)
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<SimpleWidgetEntry>) -> Void) {
        NSLog("🔄 WIDGET [\(widgetId)]: getTimeline called by system")
        let config = loadConfig()
        let sharedDefaults = UserDefaults(suiteName: "group.com.luminous5972.StickerSmash")
        var remoteOverrides: [String: NodeOverride] = [:]

        let dispatchGroup = DispatchGroup()

        let cacheKey = "widget_remote_data_\(widgetId)"
        if let cachedData = sharedDefaults?.data(forKey: cacheKey),
           let decoded = try? JSONDecoder().decode([String: NodeOverride].self, from: cachedData) {
            remoteOverrides = decoded
            NSLog("✅ WIDGET [\(widgetId)]: Loaded cached remote data")
        }

        if let urlString = config?.remoteConfigUrl, let url = URL(string: urlString) {
            NSLog("🌐 WIDGET [\(widgetId)]: Fetching fresh remote data")
            dispatchGroup.enter()
            var request = URLRequest(url: url)
            request.cachePolicy = .reloadIgnoringLocalCacheData
            URLSession.shared.dataTask(with: request) { data, _, error in
                if let data = data {
                    sharedDefaults?.set(data, forKey: cacheKey)
                    if let decoded = try? JSONDecoder().decode([String: NodeOverride].self, from: data) {
                        remoteOverrides = decoded
                        NSLog("✅ WIDGET [\(widgetId)]: Updated with fresh remote data")
                    }
                } else if let error = error {
                    NSLog("⚠️ WIDGET [\(widgetId)]: Fresh fetch failed, using cache: \(error.localizedDescription)")
                }
                dispatchGroup.leave()
            }.resume()
        }

        dispatchGroup.notify(queue: .main) {
            var downloadedImages: [String: Data] = [:]
            var imageUrls = Set<String>()

            if let config = config {
                self.extractUrls(from: config.small.children, overrides: remoteOverrides, into: &imageUrls)
                if let med = config.medium { self.extractUrls(from: med.children, overrides: remoteOverrides, into: &imageUrls) }
                if let lrg = config.large { self.extractUrls(from: lrg.children, overrides: remoteOverrides, into: &imageUrls) }
            }

            let downloadGroup = DispatchGroup()
            let sharedContainer = FileManager.default.containerURL(forSecurityApplicationGroupIdentifier: "group.com.luminous5972.StickerSmash")

            for urlString in imageUrls {
                downloadGroup.enter()
                if urlString.hasPrefix("http://") || urlString.hasPrefix("https://") {
                    if let url = URL(string: urlString) {
                        var request = URLRequest(url: url)
                        request.setValue("DynamicWidgetApp/1.0 (iOS)", forHTTPHeaderField: "User-Agent")
                        request.timeoutInterval = 3.0
                        URLSession.shared.dataTask(with: request) { data, _, _ in
                            if let data = data { downloadedImages[urlString] = data }
                            downloadGroup.leave()
                        }.resume()
                    } else { downloadGroup.leave() }
                } else if urlString.hasPrefix("shared://") {
                    let filename = String(urlString.dropFirst("shared://".count))
                    if let fileUrl = sharedContainer?.appendingPathComponent(filename),
                       let data = try? Data(contentsOf: fileUrl) { downloadedImages[urlString] = data }
                    downloadGroup.leave()
                } else {
                    downloadGroup.leave()
                }
            }

            downloadGroup.notify(queue: .main) {
                NSLog("🏁 WIDGET [\(self.widgetId)]: Timeline finalizing...")
                let entry = SimpleWidgetEntry(date: Date(), config: config, images: downloadedImages, remoteData: remoteOverrides)
                let nextUpdate = Calendar.current.date(byAdding: .minute, value: 30, to: Date())!
                let timeline = Timeline(entries: [entry], policy: .after(nextUpdate))
                completion(timeline)
            }
        }
    }

    private func extractUrls(from nodes: [WidgetNode], overrides: [String: NodeOverride], into set: inout Set<String>) {
        for node in nodes {
            let override = node.bindId != nil ? overrides[node.bindId!] : nil
            switch node {
            case .image(let img):
                let src = override?.src ?? img.src
                if !src.isEmpty { set.insert(src) }
            case .container(let cont):
                extractUrls(from: cont.children, overrides: overrides, into: &set)
            default: break
            }
        }
    }

    private func loadConfig() -> MultiSizeWidgetConfig? {
        let defaults = UserDefaults(suiteName: "group.com.luminous5972.StickerSmash")
        let key = "widgetSchema_\(widgetId)"
        guard let json = defaults?.string(forKey: key),
              let data = json.data(using: .utf8) else {
            NSLog("Widget [\(widgetId)] Error: No JSON found in UserDefaults for key: \(key)")
            return nil
        }
        do {
            return try JSONDecoder().decode(MultiSizeWidgetConfig.self, from: data)
        } catch {
            NSLog("Widget [\(widgetId)] Decoding Error: \(error)")
            return nil
        }
    }
}

// MARK: - Entry View

struct SimpleWidgetEntryView: View {
    let entry: SimpleWidgetEntry
    @Environment(\.widgetFamily) var family

    var body: some View {
        if let config = entry.config {
            let schemaToRender = currentSchema(for: family, from: config)
            WidgetRenderer(schema: schemaToRender, images: entry.images, remoteData: entry.remoteData, isRoot: true)
        } else {
            Text("No Content")
                .frame(maxWidth: .infinity, maxHeight: .infinity)
                .background(Color.gray.opacity(0.2))
        }
    }

    private func currentSchema(for family: WidgetFamily, from config: MultiSizeWidgetConfig) -> WidgetSchema {
        switch family {
        case .systemMedium: return config.medium ?? config.small
        case .systemLarge, .systemExtraLarge: return config.large ?? config.small
        default: return config.small
        }
    }
}

// MARK: - Widget Definitions

struct Slot0Widget: Widget {
    let kind: String = "slot0"
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: SlotWidgetProvider(widgetId: kind)) { entry in
            SimpleWidgetEntryView(entry: entry)
        }
        .configurationDisplayName("News Widget")
        .description("Latest headlines.")
        .supportedFamilies([.systemSmall, .systemMedium, .systemLarge])
        .disableContentMarginsIfNeeded()
    }
}

struct Slot1Widget: Widget {
    let kind: String = "slot1"
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: SlotWidgetProvider(widgetId: kind)) { entry in
            SimpleWidgetEntryView(entry: entry)
        }
        .configurationDisplayName("Weather Widget")
        .description("Current conditions.")
        .supportedFamilies([.systemSmall, .systemMedium, .systemLarge])
        .disableContentMarginsIfNeeded()
    }
}

struct Slot2Widget: Widget {
    let kind: String = "slot2"
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: SlotWidgetProvider(widgetId: kind)) { entry in
            SimpleWidgetEntryView(entry: entry)
        }
        .configurationDisplayName("")
        .description("")
        .supportedFamilies([.systemSmall, .systemMedium, .systemLarge])
        .disableContentMarginsIfNeeded()
    }
}

struct Slot3Widget: Widget {
    let kind: String = "slot3"
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: SlotWidgetProvider(widgetId: kind)) { entry in
            SimpleWidgetEntryView(entry: entry)
        }
        .configurationDisplayName("")
        .description("")
        .supportedFamilies([.systemSmall, .systemMedium, .systemLarge])
        .disableContentMarginsIfNeeded()
    }
}

struct Slot4Widget: Widget {
    let kind: String = "slot4"
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: SlotWidgetProvider(widgetId: kind)) { entry in
            SimpleWidgetEntryView(entry: entry)
        }
        .configurationDisplayName("")
        .description("")
        .supportedFamilies([.systemSmall, .systemMedium, .systemLarge])
        .disableContentMarginsIfNeeded()
    }
}

// MARK: - Convenience Extension

extension WidgetConfiguration {
    func disableContentMarginsIfNeeded() -> some WidgetConfiguration {
        if #available(iOS 17.0, *) {
            return self.contentMarginsDisabled()
        } else {
            return self
        }
    }
}