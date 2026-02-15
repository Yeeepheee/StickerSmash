import { useState, useEffect, useRef } from 'react';
import { Text, View, StyleSheet, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LiveTimer from '@/modules/my-widget-library';

interface TimerProps {
  title: string;
  timerId: string;
  initialSeconds?: number;
}

/**
 * Example of using the live activity abstraction 
 */
export default function Timer({ title, timerId, initialSeconds = 60 }: TimerProps) {
  const [seconds, setSeconds] = useState(initialSeconds);
  const [isActive, setIsActive] = useState(false);
  const endTimeRef = useRef<number | null>(null);

  useEffect(() => {
    const resumeTimer = async () => {
      const savedEndTime = await AsyncStorage.getItem(`timer_end_${timerId}`);
      if (savedEndTime) {
        const endTimestamp = parseInt(savedEndTime, 10);
        const remaining = Math.max(0, Math.floor((endTimestamp - Date.now()) / 1000));

        if (remaining > 0) {
          endTimeRef.current = endTimestamp;
          setSeconds(remaining);
          setIsActive(true);
        } else {
          await cleanUp();
        }
      }
    };
    resumeTimer();
  }, []);

  const cleanUp = async () => {
    await AsyncStorage.removeItem(`timer_end_${timerId}`);
    LiveTimer.stopLiveActivity(timerId); //<-----------------
    endTimeRef.current = null;
    setIsActive(false);
  };

  useEffect(() => {
    let interval: any = null;

    if (isActive) {
      if (!endTimeRef.current) {
        const endTimestamp = Date.now() + (seconds * 1000);
        endTimeRef.current = endTimestamp;
        AsyncStorage.setItem(`timer_end_${timerId}`, endTimestamp.toString());
        LiveTimer.startLiveActivity(endTimestamp, title, timerId); //<-----------------
      }

      interval = setInterval(() => {
        const remaining = Math.max(0, Math.floor((endTimeRef.current! - Date.now()) / 1000));
        setSeconds(remaining);

        if (remaining <= 0) {
          clearInterval(interval);
          cleanUp();
        }
      }, 1000);
    } else {
      clearInterval(interval);
      if (seconds === 0 || endTimeRef.current) {
         cleanUp();
      }
    }

    return () => clearInterval(interval);
  }, [isActive]);

  const toggleTimer = () => {
    if (!isActive && seconds === 0) setSeconds(initialSeconds);
    setIsActive(!isActive);
  };

  return (
    <View style={styles.timerContainer}>
      <Text style={styles.label}>{title}: {seconds}s</Text>
      <TouchableOpacity 
        style={[styles.btn, isActive && { backgroundColor: 'red' }]} 
        onPress={toggleTimer}
      >
        <Text style={styles.btnText}>{isActive ? 'Stop' : 'Start'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  timerContainer: { flexDirection: 'row', alignItems: 'center', padding: 10, backgroundColor: '#1e293b', margin: 5, borderRadius: 8 },
  label: { color: 'white', marginRight: 10, fontSize: 18, fontWeight: '600' },
  btn: { backgroundColor: '#38BDF8', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 4 },
  btnText: { color: 'white', fontWeight: 'bold' }
});