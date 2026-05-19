import ExpoModulesCore
import WidgetKit

private let appGroup: String = "group.com.luminous5972.StickerSmash"

public class WidgetBridge: Module {

    // MARK: - Static Push Handler
    @objc public static func handlePushNotification(_ userInfo: [AnyHashable: Any]) {
        guard let action = userInfo["action"] as? String, action == "UPDATE_WIDGET" else { return }

        if let widgetId = userInfo["widgetId"] as? String {
            WidgetCenter.shared.reloadTimelines(ofKind: widgetId)
        } else {
            WidgetCenter.shared.reloadAllTimelines()
        }
    }

    // MARK: - Module Definition
    public func definition() -> ModuleDefinition {
        Name("WidgetBridge")

        AsyncFunction("writeWidgetData") { (data: [String: Any], widgetId: String) in
            let defaults = UserDefaults(suiteName: appGroup)
            let key = "widget_remote_data_\(widgetId)"

            var merged: [String: Any] = [:]
            if let existing = defaults?.data(forKey: key),
               let decoded = try? JSONSerialization.jsonObject(with: existing) as? [String: Any] {
                merged = decoded
            }
            for (k, v) in data { merged[k] = v }

            do {
                let jsonData = try JSONSerialization.data(withJSONObject: merged)
                defaults?.set(jsonData, forKey: key)
            } catch {
                NSLog("❌ writeWidgetData [\(widgetId)]: JSONSerialization failed: \(error)")
            }
            WidgetCenter.shared.reloadTimelines(ofKind: widgetId)
        }

        AsyncFunction("saveWidgetSchema") { (json: String, widgetId: String) in
            let defaults = UserDefaults(suiteName: appGroup)
            defaults?.set(json, forKey: "widgetSchema_\(widgetId)")
            WidgetCenter.shared.reloadTimelines(ofKind: widgetId)
        }

        AsyncFunction("removeWidgetSchema") { (widgetId: String) in
            let defaults = UserDefaults(suiteName: appGroup)
            defaults?.removeObject(forKey: "widgetSchema_\(widgetId)")
            defaults?.removeObject(forKey: "widget_remote_data_\(widgetId)")
            if #available(iOS 16.0, *) {
                WidgetCenter.shared.invalidateConfigurationRecommendations()
            }
        }

        AsyncFunction("getSlotInfo") { () -> [String: Any] in
            let defaults = UserDefaults(suiteName: appGroup)
            let allSlots = ["slot0", "slot1", "slot2", "slot3", "slot4"]

            let assignments = allSlots.reduce(into: [String: Int]()) { dict, slotId in
                if defaults?.string(forKey: "widgetSchema_\(slotId)") != nil {
                    dict[slotId] = allSlots.firstIndex(of: slotId)!
                }
            }

            return [
                "maxSlots": 5,
                "usedSlots": assignments.count,
                "availableSlots": 5 - assignments.count,
                "assignments": assignments
            ]
        }

      AsyncFunction("seedSharedAsset") { (localPath: String, filename: String, force: Bool) -> String in
          guard let container = FileManager.default.containerURL(
              forSecurityApplicationGroupIdentifier: appGroup
          ) else {
              throw NSError(domain: "WidgetBridge", code: 1,
                            userInfo: [NSLocalizedDescriptionKey: "App group container not found"])
          }

          let dest = container.appendingPathComponent(filename)

          if FileManager.default.fileExists(atPath: dest.path) {
              if !force { return "exists" }
              try FileManager.default.removeItem(at: dest)
          }

          let src = URL(fileURLWithPath: localPath)
          try FileManager.default.copyItem(at: src, to: dest)
          return "copied"
      }
    }
}