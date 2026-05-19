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
        NSAppTransportSecurity: { NSAllowsArbitraryLoads: true },
        AppGroupIdentifier: process.env.APP_GROUP_ID
      },
      bundleIdentifier: process.env.BUNDLE_ID,
      entitlements: {
        "com.apple.security.application-groups": [
          process.env.APP_GROUP_ID
        ]
      }
    },
    android: {
      googleServicesFile: "private/google-services.json",
      adaptiveIcon: { backgroundColor: "#E6F4FE" },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
      package: process.env.BUNDLE_ID,
      permissions: [
        "READ_CALENDAR",
        "WRITE_CALENDAR",
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
      ["expo-calendar",
        {
          calendarPermission: "Allow this app to read your calendar to display events on the widget."
        }
      ],
      "patch-project",
      "@bacons/apple-targets",
      "expo-notifications"
    ],
    experiments: {
      typedRoutes: true,
      reactCompiler: true
    },
    extra: {
      eas: {
        projectId: process.env.EXPO_PUBLIC_PROJECT_ID
      }
    }
  }
};