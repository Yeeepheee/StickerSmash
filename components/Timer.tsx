import { useEffect, useState, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { Text, View, StyleSheet, TouchableOpacity, Platform, DeviceEventEmitter } from 'react-native';
import LiveTimer from '@/components/LiveTimer';

export default function Timer() {
  const [seconds, setSeconds] = useState(60);
  const [isActive, setIsActive] = useState(false);
  const endTimeRef = useRef<number | null>(null);

  // --- ADDED: AppState listener to handle background re-entry ---
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active' && isActive && endTimeRef.current) {
        const now = Date.now();
        const remaining = Math.max(0, Math.floor((endTimeRef.current - now) / 1000));
        setSeconds(remaining);
        
        // If the timer finished while in the background
        if (remaining <= 0) {
          setIsActive(false);
          LiveTimer.stopLiveActivity();
        }
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription.remove();
  }, [isActive]);

  useEffect(() => {
    const stopSub = DeviceEventEmitter.addListener('onTimerStopped', () => setIsActive(false));
    const resetSub = DeviceEventEmitter.addListener('onTimerReset', () => {
      setIsActive(false);
      setSeconds(60);
    });
    return () => { stopSub.remove(); resetSub.remove(); };
  }, []);

  useEffect(() => {
    let interval: any = null;

    if (isActive) {
      // If we are starting fresh (no end time yet)
      if (!endTimeRef.current) {
         endTimeRef.current = Date.now() + (seconds * 1000);
         LiveTimer.startLiveActivity(endTimeRef.current);
      }

      interval = setInterval(() => {
        if (endTimeRef.current) {
          const now = Date.now();
          const remaining = Math.max(0, Math.floor((endTimeRef.current - now) / 1000));

          setSeconds(remaining);

          if (Platform.OS === 'android' && remaining % 5 === 0) {
            LiveTimer.startLiveActivity(endTimeRef.current);
          }

          if (remaining === 10) {
            LiveTimer.updateLiveActivity(endTimeRef.current, true);
          }
          
          if (remaining <= 0) {
            setIsActive(false);
            LiveTimer.stopLiveActivity();
            endTimeRef.current = null; // Clear it so it can restart
            clearInterval(interval);
          }
        }
      }, 100);
    } else {
      if (interval) clearInterval(interval);
      // Only stop if we were actually active (prevents double calls)
      LiveTimer.stopLiveActivity();
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
        <Text style={styles.timerText}>{formatTime(seconds)}</Text>
        <TouchableOpacity
          style={[styles.button, isActive && { backgroundColor: '#EF4444' }]}
          onPress={() => setIsActive(!isActive)}
        >
          <Text style={styles.buttonText}>{isActive ? 'STOP' : 'START'}</Text>
        </TouchableOpacity>
        {!isActive && seconds !== 60 && (
          <TouchableOpacity style={{ marginTop: 20 }} onPress={() => setSeconds(60)}>
            <Text style={{ color: '#94A3B8' }}>Reset Timer</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  centerBox: { alignItems: 'center' },
  timerText: {
    color: '#FFFFFF',
    fontSize: 80,
    fontWeight: '300',
    fontFamily: Platform.select({ ios: 'Courier', android: 'monospace' }),
    marginBottom: 20,
  },
  button: { backgroundColor: '#38BDF8', paddingVertical: 12, paddingHorizontal: 30, borderRadius: 8 },
  buttonText: { color: '#0F172A', fontWeight: 'bold', fontSize: 18 }
});