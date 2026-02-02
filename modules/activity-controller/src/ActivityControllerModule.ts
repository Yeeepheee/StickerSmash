import { requireNativeModule, Platform } from 'expo-modules-core';

// 1. Link to the native "ActivityController" module
// This matches Name("ActivityController") in your Swift file
const NativeModule = requireNativeModule('ActivityController');

/**
 * Starts a Live Activity for iOS or handles logic for Android
 * @param endTime The timestamp in milliseconds
 */
export const startLiveActivity = (endTime: number) => {
  if (Platform.OS === 'ios') {
    // Convert ms to seconds for the Swift Date(timeIntervalSince1970:)
    const secondsSinceEpoch = endTime / 1000;
    return NativeModule.startLiveActivity(secondsSinceEpoch);
  } else {
    // If you haven't built the Android side yet, 
    // this prevents the app from crashing.
    console.warn("Live Activities are not supported on Android.");
  }
};

/**
 * Stops all active Live Activities
 */
export const stopLiveActivity = () => {
  if (Platform.OS === 'ios') {
    return NativeModule.stopLiveActivity();
  }
};

export default {
  startLiveActivity,
  stopLiveActivity,
};