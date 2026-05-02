import ExpoModulesCore

public class CountdownActivityModule: Module {
  public func definition() -> ModuleDefinition {
    Name("CountdownActivityModule")

    Function("startLiveActivity") { (endTime: Double, title: String, timerId: String) in
      if #available(iOS 16.2, *) {
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