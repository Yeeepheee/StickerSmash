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
            NSLog("❌ Action did not match or was missing. userInfo: \(userInfo)")
            completionHandler(.noData)
            return
        }

        NSLog("✅ Action matched: \(action)")

        let sharedDefaults = UserDefaults(suiteName: "group.com.luminous5972.StickerSmash")

        guard let json = sharedDefaults?.string(forKey: "widgetSchema") else {
            NSLog("❌ No widgetSchema found in UserDefaults")
            completionHandler(.noData)
            return
        }

        NSLog("📋 widgetSchema found, extracting URL...")

        // Parse just the remoteConfigUrl without needing the full model
        guard let data = json.data(using: .utf8),
              let jsonObject = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
              let urlString = jsonObject["remoteConfigUrl"] as? String,
              let url = URL(string: urlString) else {
            NSLog("❌ Failed to extract remoteConfigUrl from widgetSchema")
            completionHandler(.noData)
            return
        }

        NSLog("🌐 Fetching remote data from: \(urlString)")

        var bgTask: UIBackgroundTaskIdentifier = .invalid
        bgTask = application.beginBackgroundTask {
            NSLog("⏰ Background task expired before completion")
            completionHandler(.failed)
            application.endBackgroundTask(bgTask)
            bgTask = .invalid
        }

        NSLog("⏳ Background task started: \(bgTask.rawValue)")

        var request = URLRequest(url: url)
        request.cachePolicy = NSURLRequest.CachePolicy.reloadIgnoringLocalCacheData

        URLSession.shared.dataTask(with: request) { data, response, error in
            if let error = error {
                NSLog("❌ Network error: \(error.localizedDescription)")
                self.endTask(bgTask, app: application, handler: completionHandler, result: .failed)
                return
            }

            if let httpResponse = response as? HTTPURLResponse {
                NSLog("📡 HTTP response status: \(httpResponse.statusCode)")
            }

            guard let data = data else {
                NSLog("❌ No data received from remote URL")
                self.endTask(bgTask, app: application, handler: completionHandler, result: .failed)
                return
            }

            NSLog("📥 Data received: %@", String(data: data, encoding: .utf8) ?? "Could not convert to string")

            sharedDefaults?.set(data, forKey: "widget_remote_data")
            NSLog("💾 Remote data saved to UserDefaults")

            WidgetCenter.shared.reloadAllTimelines()
            NSLog("📡 reloadAllTimelines() called")

            self.endTask(bgTask, app: application, handler: completionHandler, result: .newData)
        }.resume()
    }

    private func endTask(_ task: UIBackgroundTaskIdentifier, app: UIApplication, handler: @escaping (UIBackgroundFetchResult) -> Void, result: UIBackgroundFetchResult) {
        NSLog("🏁 Ending background task: \(task.rawValue) with result: \(result.rawValue)")
        DispatchQueue.main.async {
            handler(result)
            if task != .invalid {
                app.endBackgroundTask(task)
            }
        }
    }
}