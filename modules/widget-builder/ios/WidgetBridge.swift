import ExpoModulesCore
import WidgetKit

public class WidgetBridge: Module {
  public func definition() -> ModuleDefinition {
    Name("WidgetBridge")

    AsyncFunction("saveWidgetSchema") { (json: String) in
      let defaults = UserDefaults(suiteName: WidgetConfig.appGroupId)
      defaults?.set(json, forKey: "widgetSchema")
      WidgetCenter.shared.reloadAllTimelines()
    }
  }
}