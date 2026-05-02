// app.config.js
export default {
  expo: {
    name: "StickerSmash",
    slug: "StickerSmash",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "stickersmash",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
      appleTeamId: process.env.APPLE_TEAM_ID,
      infoPlist: {
        NSSupportsLiveActivities: true,
        NSSupportsLiveActivitiesFrequentUpdates: true,
        UIBackgroundModes: ["remote-notification", "fetch"],
        NSAppTransportSecurity: { NSAllowsArbitraryLoads: true }
      },
      bundleIdentifier: process.env.BUNDLE_ID ?? "com.luminous5972.StickerSmash",
      entitlements: {
        "com.apple.security.application-groups": [
          `group.${process.env.BUNDLE_ID ?? "com.luminous5972.StickerSmash"}`
        ]
      }
    },
    android: {
      googleServicesFile: "private/google-services.json",
      adaptiveIcon: { backgroundColor: "#E6F4FE" },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
      package: process.env.BUNDLE_ID ?? "com.luminous5972.StickerSmash",
      permissions: [
        "android.permission.READ_EXTERNAL_STORAGE",
        "android.permission.WRITE_EXTERNAL_STORAGE",
        "android.permission.READ_MEDIA_VISUAL_USER_SELECTED",
        "android.permission.ACCESS_MEDIA_LOCATION",
        "android.permission.READ_MEDIA_AUDIO",
        "android.permission.READ_MEDIA_IMAGES"
      ]
    },
    web: {
      output: "static",
      favicon: "./assets/images/favicon.png"
    },
    plugins: [
      "expo-router",
      ["expo-splash-screen", {
        image: "./assets/images/splash-icon.png",
        imageWidth: 200,
        resizeMode: "contain",
        backgroundColor: "#ffffff",
        dark: { backgroundColor: "#000000" }
      }],
      ["expo-media-library", {
        photosPermission: "Allow $(PRODUCT_NAME) to access your photos.",
        savePhotosPermission: "Allow $(PRODUCT_NAME) to save photos.",
        isAccessMediaLocationEnabled: true,
        granularPermissions: ["audio", "photo"]
      }],
      "patch-project",
      "@bacons/apple-targets"
    ],
    experiments: {
      typedRoutes: true,
      reactCompiler: true
    }
  }
};