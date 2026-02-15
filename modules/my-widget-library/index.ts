import { requireNativeModule, Platform } from 'expo-modules-core';

// 'MyTimerModule' must match the Name("...") in your Swift file
const NativeModule = requireNativeModule('MyTimerModule');

const LiveTimer = {
  /**
   * Starts a native Live Activity (iOS) or Notification Timer (Android)
   */
  startLiveActivity: (endTime: number, title: string, timerId: string) => {
    if (Platform.OS === 'ios') {
      // In Expo Modules, functions are called directly on the required module
      NativeModule.startLiveActivity(endTime, title, timerId);
    } else {
      // Assuming you have an Android implementation in the same module
      NativeModule.startLiveActivityAndroid?.(endTime, title, timerId);
    }
  },

  /**
   * Stops a specific native timer by its unique ID
   */
  stopLiveActivity: (timerId: string) => {
    if (Platform.OS === 'ios') {
      NativeModule.stopLiveActivity(timerId);
    } else {
      NativeModule.stopLiveActivityAndroid?.(timerId);
    }
  }
};

export default LiveTimer;