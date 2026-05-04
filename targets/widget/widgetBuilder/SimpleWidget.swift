import WidgetKit
import SwiftUI

struct SimpleWidgetEntry: TimelineEntry {
    let date: Date
    let config: MultiSizeWidgetConfig?
    let images: [String: Data]
    let remoteData: [String: NodeOverride]
}

struct SimpleWidgetProvider: TimelineProvider {
    
    func placeholder(in context: Context) -> SimpleWidgetEntry {
        SimpleWidgetEntry(date: Date(), config: nil, images: [:], remoteData: [:])
    }
    
    func getSnapshot(in context: Context, completion: @escaping (SimpleWidgetEntry) -> Void) {
        let entry = SimpleWidgetEntry(date: Date(), config: loadConfig(), images: [:], remoteData: [:])
        completion(entry)
    }
    
    func getTimeline(in context: Context, completion: @escaping (Timeline<SimpleWidgetEntry>) -> Void) {
        NSLog("🔄 WIDGET: getTimeline called by system")
        let config = loadConfig()
        let sharedDefaults = UserDefaults(suiteName: "group.com.luminous5972.StickerSmash")
        var remoteOverrides: [String: NodeOverride] = [:]

        let dispatchGroup = DispatchGroup()

        
        if let cachedData = sharedDefaults?.data(forKey: "widget_remote_data"),
        let decoded = try? JSONDecoder().decode([String: NodeOverride].self, from: cachedData) {
            remoteOverrides = decoded
            NSLog("✅ WIDGET: Loaded cached remote data")
        }

        
        if let urlString = config?.remoteConfigUrl, let url = URL(string: urlString) {
            NSLog("🌐 WIDGET: Fetching fresh remote data")
            dispatchGroup.enter()
            var request = URLRequest(url: url)
            request.cachePolicy = .reloadIgnoringLocalCacheData
            URLSession.shared.dataTask(with: request) { data, _, error in
                if let data = data {
                    sharedDefaults?.set(data, forKey: "widget_remote_data")
                    if let decoded = try? JSONDecoder().decode([String: NodeOverride].self, from: data) {
                        remoteOverrides = decoded
                        NSLog("✅ WIDGET: Updated with fresh remote data")
                    }
                } else if let error = error {
                    NSLog("⚠️ WIDGET: Fresh fetch failed, using cache: \(error.localizedDescription)")
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
                NSLog("🏁 WIDGET: Timeline finalizing...")
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
        guard let json = defaults?.string(forKey: "widgetSchema"),
              let data = json.data(using: .utf8) else { 
            NSLog("Widget Error: No JSON found in UserDefaults")
            return nil 
        }
        
        do {
            return try JSONDecoder().decode(MultiSizeWidgetConfig.self, from: data)
        } catch {
            // This will tell you EXACTLY what is failing if your JSON format mismatches!
            NSLog("Widget Decoding Error: \(error)")
            return nil
        }
    }
}

struct SimpleWidgetEntryView: View {
    let entry: SimpleWidgetEntry
    @Environment(\.widgetFamily) var family
    
    var body: some View {
        if let config = entry.config {
            let schemaToRender = currentSchema(for: family, from: config)
            WidgetRenderer(schema: schemaToRender, images: entry.images, remoteData: entry.remoteData, isRoot: true)
        } else {
            Text("No Content").frame(maxWidth: .infinity, maxHeight: .infinity).background(Color.gray.opacity(0.2))
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

struct SimpleWidget: Widget {
    let kind: String = "SimpleWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: SimpleWidgetProvider()) { entry in
            SimpleWidgetEntryView(entry: entry)
        }
        .configurationDisplayName("Dynamic Widget")
        .description("Cross-platform layout renderer.")
        .supportedFamilies([.systemSmall, .systemMedium, .systemLarge])
        .disableContentMarginsIfNeeded()
    }
}

extension WidgetConfiguration {
    func disableContentMarginsIfNeeded() -> some WidgetConfiguration {
        if #available(iOS 17.0, *) {
            return self.contentMarginsDisabled()
        } else {
            return self
        }
    }
}