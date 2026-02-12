import { NativeModules, Platform } from 'react-native';

const { ActivityController, LiveTimer: AndroidModule } = NativeModules;

const LiveTimer = {
  /**
   * Starts a native Live Activity (iOS) or Notification Timer (Android)
   */
  startLiveActivity: (endTime: number, title: string, timerId: string) => {
    if (Platform.OS === 'ios') {
      ActivityController?.startLiveActivity(endTime, title, timerId);
    } else {
      AndroidModule?.startLiveActivity(endTime, title, timerId);
    }
  },

  /**
   * Stops a specific native timer by its unique ID
   */
  stopLiveActivity: (timerId: string) => {
    if (Platform.OS === 'ios') {
      ActivityController?.stopLiveActivity(timerId);
    } else {
      AndroidModule?.stopLiveActivity(timerId);
    }
  }
};

export default LiveTimer;