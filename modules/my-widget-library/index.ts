import { requireNativeModule } from 'expo-modules-core';

const NativeTimer = requireNativeModule('MyTimerModule');

export default {
  /**
   * Triggers the platform-specific live timer.
   * iOS: Dynamic Island / Lock Screen Activity
   * Android: Ongoing Notification with Progress
   */
  startLiveActivity(endTime: number, title: string, timerId: string): void {
    NativeTimer.startLiveActivity(endTime, title, timerId);
  },

  /**
   * Clears the timer and removes the notification/activity.
   */
  stopLiveActivity(timerId: string): void {
    NativeTimer.stopLiveActivity(timerId);
  }
};