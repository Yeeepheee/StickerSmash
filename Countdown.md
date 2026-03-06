# Countdown Activity

This module provides a unified API to maintain active, ticking countdown timers in the system UI, using **Foreground Services** on Android and **ActivityKit** on iOS.

----------

## API Usage

The module is accessed through a single TypeScript interface that handles the platform-specific logic under the hood.

TypeScript

```typescript
import CountdownTimer from 'expo-countdown-activity';

// Start a timer
// endTime: Timestamp in milliseconds 
// title: The text shown in the notification/activity 
// timerId: A unique string to identify this specific timer 
CountdownTimer.startLiveActivity(
  Date.now() + 60000, 
  "Pizza Delivery", 
  "order_123"
);

// Stop a specific timer manually
CountdownTimer.stopLiveActivity("order_123");

```

----------

## Android Implementation

On Android, the module utilizes a persistent **Foreground Service** to keep timers running even if the app is killed.

### Architecture

-   **The Bridge (`CountdownActivityModule.kt`)**: Maps JavaScript calls to Android Intents (`ACTION_START` or `ACTION_STOP`).
    
-   **The Core (`TimerService.kt`)**:
    
    -   **Multi-Timer Management**: Uses a `ConcurrentHashMap` to track multiple sessions.
        
    -   **Foreground Anchor**: The service promotes the first active timer to be the "Foreground Anchor" to satisfy Android system requirements.
        
    -   **The Tick Logic**: Uses a `Handler` to update the notification every 1000ms.
        
-   **Data Structure (`TimerSession`)**: Encapsulates the `endTime`, `title`, and the specific `runnable` for each timer.
    

### Maintenance

-   **Service Type**: Uses `FOREGROUND_SERVICE_TYPE_SPECIAL_USE` for Android 14+ compatibility.
    
-   **Permissions**: Requires `FOREGROUND_SERVICE`, `POST_NOTIFICATIONS`, and `FOREGROUND_SERVICE_SPECIAL_USE` in the manifest.
    

----------

## iOS Implementation

On iOS, the module uses **ActivityKit** to render UI on the Lock Screen and Dynamic Island.

### Architecture

-   **The Bridge (`CountdownActivityModule.swift`)**: Checks for iOS 16.2+ compatibility before initializing the controller.
    
-   **The Controller (`ActivityController.swift`)**: A singleton that requests new activities and manages the `Activity<TimerAttributes>` lifecycle.
    
-   **Data Schema (`TimerAttributes.swift`)**: Defines `title` as static data and `endTime` as dynamic `ContentState`.
    
-   **The UI (`TimerWidgetLiveActivity.swift`)**: A SwiftUI implementation defining the **Dynamic Island** (Expanded, Compact, and Minimal) and **Lock Screen** views.
    

### Maintenance

-   **Native Ticking**: Uses `Text(timerInterval:countsDown:)` so the system handles the countdown updates with zero battery impact on your app.
    
-   **Cleanup***: The `checkForExpiredActivities` function automatically dismisses activities when the `endTime` is reached. 


*Most likely won't work and would require push notification

----------

## Improvements

### Remote Updates (Push Notifications)

To make this production-ready, you can transition from local timers to server-side updates.

-   **iOS Improvement**: Capture the `pushToken` from the `Activity` object. Your backend can then send APNs payloads to update the `ContentState` (like changing status from "Cooking" to "Delivering") without the app being open.
    
-   **Android Improvement**: Integrate **Firebase Cloud Messaging (FCM)**. When a data message is received, the app can start or update the `TimerService` with new data.
    

### Interactive UI

-   **iOS**: Add **App Intents** (iOS 17+) to include buttons in the Dynamic Island for actions like "Cancel Order" or "Snooze".
    
-   **Android**: Add `addAction` to the `NotificationCompat.Builder` to include interactive buttons in the notification drawer.
    

----------

## ⚠️ Requirements

-   **Android**: Min SDK 24, Target SDK 36. Requires
    
-   **iOS**: Version 16.2+ and a physical device for Dynamic Island testing.