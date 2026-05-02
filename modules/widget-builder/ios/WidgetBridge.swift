import ExpoModulesCore
import WidgetKit

public class WidgetBridge: Module {
  public func definition() -> ModuleDefinition {
    Name("WidgetBridge")

    AsyncFunction("saveWidgetSchema") { (json: String) in
      let defaults = UserDefaults(suiteName: "group.com.luminous5972.StickerSmash")
      defaults?.set(json, forKey: "widgetSchema")
      
      WidgetCenter.shared.reloadAllTimelines()
    }
  }
}