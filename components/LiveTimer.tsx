import { NativeModules, Platform, PermissionsAndroid } from 'react-native';


// Standardize the Native Module access
const NativeActivity = Platform.select({
  ios: NativeModules.ActivityController,
  android: NativeModules.LiveTimer, // Match your actual Java getName()
});

export const startLiveActivity = async (endTime: number, timerName: string = "Timer") => {
  // 1. Android Permission Guard
  if (Platform.OS === 'android' && Platform.Version >= 33) {
    const granted = await PermissionsAndroid.request('android.permission.POST_NOTIFICATIONS');
    if (granted !== 'granted') return;
  }

  // 2. Unified Execution
  if (!NativeActivity) {
    console.error("Native Activity module not linked.");
    return;
  }

  // iOS expects seconds, Android usually handles ms (or depends on your Java logic)
  const formattedTime = Platform.OS === 'ios' ? endTime / 1000 : endTime;
  
  // Call the native side (names must match your @objc and @ReactMethod)
  NativeActivity.startLiveActivity(formattedTime, timerName);
};

const updateLiveActivity = (endTime: number, isExpiring: boolean) => {
  if (Platform.OS === 'ios') {
    NativeActivity?.updateLiveActivity(endTime / 1000, isExpiring);
  }
};

export const stopLiveActivity = () => {
  NativeActivity?.stopLiveActivity();
};

const LiveTimer = {
  startLiveActivity,
  updateLiveActivity,
  stopLiveActivity,
};

export default LiveTimer;