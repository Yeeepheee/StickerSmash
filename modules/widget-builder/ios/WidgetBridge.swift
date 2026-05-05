import ExpoModulesCore
import WidgetKit

public class WidgetBridge: Module {
  public func definition() -> ModuleDefinition {
    Name("WidgetBridge")

    AsyncFunction("saveWidgetSchema") { (json: String, widgetId: String) in
      let defaults = UserDefaults(suiteName: "group.com.luminous5972.StickerSmash")
      let key = "widgetSchema_\(widgetId)"   // e.g. "widgetSchema_slot1"
      defaults?.set(json, forKey: key)
      WidgetCenter.shared.reloadTimelines(ofKind: widgetId) // reload only the affected widget
    }
  }
}