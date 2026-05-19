module.exports = {
  type: "widget",
  name: "Widget",
  icon: "../../assets/images/icon.png",
  entitlements: {
    "com.apple.security.application-groups": ["group.com.luminous5972.StickerSmash"],
  },

  sharedSourceFiles: [
    "../../modules/my-widget-library/ios/TimerWidgetLiveActivity.swift",
    "../../modules/my-widget-library/ios/TimerAttributes.swift"
  ]
};