import ExpoModulesCore
import WidgetKit
import Foundation

public class WidgetPushSubscriber: ExpoAppDelegateSubscriber {
  public func application(
      _ application: UIApplication,
      didReceiveRemoteNotification userInfo: [AnyHashable: Any],
      fetchCompletionHandler completionHandler: @escaping (UIBackgroundFetchResult) -> Void
  ) {
      var action: String? = nil
      var payloadData: [AnyHashable: Any] = userInfo

      if let body = userInfo["body"] as? [AnyHashable: Any] {
          action = body["action"] as? String
          payloadData = body
      } else if let data = userInfo["data"] as? [AnyHashable: Any] {
          action = data["action"] as? String
          payloadData = data
      }

      if action == nil {
          action = userInfo["action"] as? String
      }

      guard action == "UPDATE_WIDGET" else {
          completionHandler(.noData)
          return
      }

      WidgetBridge.handlePushNotification(payloadData)
      completionHandler(.newData)
  }
}