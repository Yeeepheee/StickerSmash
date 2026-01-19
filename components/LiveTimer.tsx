import { NativeModules, Platform, PermissionsAndroid } from 'react-native';

// 1. Define the interface so TS knows what arguments the Java methods take
interface LiveTimerInterface {
  startLiveActivity(startTime: number): void; // Updated to accept 1 argument
  stopLiveActivity(): void;
}

// 2. Cast NativeModules.LiveTimer to our interface
const { LiveTimer } = NativeModules as { LiveTimer: LiveTimerInterface };

export const startLiveActivity = async (startTime: number) => { // Accept startTime here
  if (Platform.OS === 'android') {
    // Request permission for Android 13+
    if (Platform.Version >= 33) {
      const status = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
      );
      if (status !== 'granted') {
        console.warn("Notification permission denied");
        return;
      }
    }

    if (LiveTimer) {
      // 3. Pass the startTime to the native Java method
      LiveTimer.startLiveActivity(startTime);
    } else {
      console.error("LiveTimer module not found. Run 'npx expo run:android'");
    }
  }
};

export const stopLiveActivity = () => {
  if (Platform.OS === 'android' && LiveTimer) {
    LiveTimer.stopLiveActivity();
  }
};

export default {
  startLiveActivity,
  stopLiveActivity,
};