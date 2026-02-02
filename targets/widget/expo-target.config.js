/** @type {import('@bacons/apple-targets/app.plugin').ConfigFunction} */
module.exports = (config) => ({
  type: "widget",
  name: "TimerWidget", // Name of your widget
  icon: "https://github.com/expo.png", // Optional: separate icon for the widget
  frameworks: ["SwiftUI", "ActivityKit"], // Required for Live Activities
  entitlements: {
    // This allows the app and widget to share data/states
    "com.apple.security.application-groups": ["group.com.luminous5972.StickerSmash"],
  },
});