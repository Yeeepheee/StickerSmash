module.exports = {
  type: "widget",
  name: "TimerWidget",
  icon: "../../assets/images/icon.png", // Point to your app icon
  entitlements: {
    "com.apple.security.application-groups": ["group.com.luminous5972.StickerSmash"],
  },
  // This tells the Widget Target where to find the Swift UI code 
  // that you kept inside your module folder.
  sharedSourceFiles: [
    "../../modules/my-widget-library/ios/TimerWidgetLiveActivity.swift",
    "../../modules/my-widget-library/ios/TimerAttributes.swift"
  ]
};