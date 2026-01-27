import { useEffect, useState, useRef } from 'react';
import { Text, View, StyleSheet, TouchableOpacity, Platform, DeviceEventEmitter } from 'react-native';
import LiveTimer from '@/components/LiveTimer';

export default function Timer() {
  // 1. Initialize with your starting countdown time (e.g., 60 seconds)
  const [seconds, setSeconds] = useState(60);
  const [isActive, setIsActive] = useState(false);

  // Use a ref to store the target end timestamp
  const endTimeRef = useRef<number | null>(null);

  useEffect(() => {
    const stopSub = DeviceEventEmitter.addListener('onTimerStopped', () => {
      setIsActive(false);
    });

    // ADD THIS:
    const resetSub = DeviceEventEmitter.addListener('onTimerReset', () => {
      setIsActive(false);
      setSeconds(60); // Or your default starting time
    });

    return () => {
      stopSub.remove();
      resetSub.remove();
    };
  }, []);

  useEffect(() => {
    let interval: any = null;

    if (isActive) {
      // 2. Calculate the target end time (Now + remaining seconds)
      const targetTime = Date.now() + (seconds * 1000);
      endTimeRef.current = targetTime;

      if (Platform.OS === 'android') {
        LiveTimer.startLiveActivity(targetTime);
      }

      interval = setInterval(() => {
        if (endTimeRef.current) {
          const now = Date.now();
          const remaining = Math.max(0, Math.floor((endTimeRef.current - now) / 1000));

          setSeconds(remaining); // Keep the app UI smooth (updates every 100ms)

          // ONLY update the Android Notification every 5 seconds
          // This saves battery and prevents bridge congestion
          if (Platform.OS === 'android' && remaining % 5 === 0) {
            LiveTimer.startLiveActivity(endTimeRef.current);
          }

          if (remaining <= 0) {
            setIsActive(false);
            if (Platform.OS === 'android') LiveTimer.stopLiveActivity();
            clearInterval(interval);
          }
        }
      }, 100);
    } else {
      if (interval) clearInterval(interval);

      if (Platform.OS === 'android') {
        LiveTimer.stopLiveActivity();
      }

      endTimeRef.current = null;
    }

    return () => { if (interval) clearInterval(interval); };
  }, [isActive]);

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.centerBox}>
        {/* 'seconds' is now correctly defined in the state above */}
        <Text style={styles.timerText}>{formatTime(seconds)}</Text>

        <TouchableOpacity
          style={[styles.button, isActive && { backgroundColor: '#EF4444' }]}
          onPress={() => setIsActive(!isActive)}
        >
          <Text style={styles.buttonText}>{isActive ? 'STOP' : 'START'}</Text>
        </TouchableOpacity>

        {/* Optional Reset Button */}
        {!isActive && seconds !== 60 && (
          <TouchableOpacity
            style={{ marginTop: 20 }}
            onPress={() => setSeconds(60)}
          >
            <Text style={{ color: '#94A3B8' }}>Reset Timer</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerBox: {
    alignItems: 'center',
  },
  timerText: {
    color: '#FFFFFF',
    fontSize: 80,
    fontWeight: '300',
    fontFamily: Platform.select({
      ios: 'Courier',
      android: 'monospace',
    }),
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#38BDF8',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  buttonText: {
    color: '#0F172A',
    fontWeight: 'bold',
    fontSize: 18,
  }
});