import { requireNativeModule } from 'expo-modules-core';

const NativeModule = requireNativeModule('ActivityController');

export default {
  startLiveActivity(endTime: number, timerName: string = "Timer") {
    // PASS BOTH ARGUMENTS HERE
    return NativeModule?.startLiveActivity?.(endTime, timerName);
  },
  stopLiveActivity() {
    return NativeModule?.stopLiveActivity?.();
  }
};