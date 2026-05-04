import ExpoModulesCore
import WidgetKit
import Foundation

public class WidgetPushSubscriber: ExpoAppDelegateSubscriber {
    public func application(
        _ application: UIApplication,
        didReceiveRemoteNotification userInfo: [AnyHashable : Any],
        fetchCompletionHandler completionHandler: @escaping (UIBackgroundFetchResult) -> Void
    ) {
        NSLog("🚨 WIDGET PUSH SUBSCRIBER HIT!")

        guard let action = userInfo["action"] as? String, action == "UPDATE_WIDGET" else {
            NSLog("❌ Action did not match or was missing.")
            completionHandler(.noData)
            return
        }

        NSLog("✅ Action matched, triggering widget reload...")
        WidgetCenter.shared.reloadAllTimelines()
        NSLog("📡 reloadAllTimelines() called")
        completionHandler(.newData)
    }
}