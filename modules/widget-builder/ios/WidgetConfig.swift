import Foundation

struct WidgetConfig {
    static var appGroupId: String {
        Bundle.main.object(forInfoDictionaryKey: "WIDGET_APP_GROUP_ID") as? String
            ?? ""
    }
}