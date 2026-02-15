import ExpoModulesCore

public class MyTimerModule: Module {
  public func definition() -> ModuleDefinition {
    Name("MyTimerModule")

    Function("startLiveActivity") { (endTime: Double, title: String, timerId: String) in
      if #available(iOS 16.2, *) {
        // We initialize it ONLY when called on a supported device
        let controller = ActivityController()
        controller.startLiveActivity(endTime: endTime, title: title, timerId: timerId)
      } else {
        print("Live Activities are not supported on this iOS version.")
      }
    }

    Function("stopLiveActivity") { (timerId: String) in
      if #available(iOS 16.2, *) {
        let controller = ActivityController()
        controller.stopLiveActivity(timerId: timerId)
      }
    }
  }
}