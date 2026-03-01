import ExpoModulesCore
import WidgetKit

public class WidgetBridge: Module {
  public func definition() -> ModuleDefinition {
    // Sets the name of the module that you'll use in JS
    Name("WidgetBridge")

    // Defines the async function for saving the schema
    AsyncFunction("saveWidgetSchema") { (json: String) in
      let defaults = UserDefaults(suiteName: "group.com.luminous5972.StickerSmash")
      defaults?.set(json, forKey: "widgetSchema")
      
      // Reload all widget timelines to reflect changes
      WidgetCenter.shared.reloadAllTimelines()
    }
  }
}