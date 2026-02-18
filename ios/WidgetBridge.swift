import Foundation
import WidgetKit
import React

@objc(WidgetBridge)
class WidgetBridge: NSObject {

  @objc
  func saveWidgetSchema(_ json: String, resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock) {
    let defaults = UserDefaults(suiteName: "group.com.luminous5972.StickerSmash")
    defaults?.set(json, forKey: "widgetSchema")
    defaults?.synchronize()
    
    // Reload all widget timelines
    WidgetCenter.shared.reloadAllTimelines()
    
    resolver("success")
  }

  @objc
  static func requiresMainQueueSetup() -> Bool {
    return false
  }
}
