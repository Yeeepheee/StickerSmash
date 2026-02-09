// components/Timer.tsx
import { useState, useEffect, useRef } from 'react';
import { Text, View, StyleSheet, TouchableOpacity } from 'react-native';
import LiveTimer from '@/components/LiveTimer'; // Your TS wrapper

interface TimerProps {
  title: string;
  timerId: string;
  initialSeconds?: number;
}

export default function Timer({ title, timerId, initialSeconds = 60 }: TimerProps) {
  const [seconds, setSeconds] = useState(initialSeconds);
  const [isActive, setIsActive] = useState(false);
  const endTimeRef = useRef<number | null>(null);

  useEffect(() => {
    let interval: any = null;

    if (isActive) {
      if (!endTimeRef.current) {
         endTimeRef.current = Date.now() + (seconds * 1000);
         // Pass the unique ID and Title to Java
         LiveTimer.startLiveActivity(endTimeRef.current, title, timerId);
      }

      interval = setInterval(() => {
        const remaining = Math.max(0, Math.floor((endTimeRef.current! - Date.now()) / 1000));
        setSeconds(remaining);
        
        if (remaining <= 0) {
          setIsActive(false);
          LiveTimer.stopLiveActivity(timerId); // Stop specific ID
          endTimeRef.current = null;
          clearInterval(interval);
        }
      }, 1000);
    } else {
      clearInterval(interval);
      LiveTimer.stopLiveActivity(timerId);
      endTimeRef.current = null;
    }

    return () => clearInterval(interval);
  }, [isActive]);

  return (
    <View style={styles.timerContainer}>
      <Text style={styles.label}>{title}: {seconds}s</Text>
      <TouchableOpacity 
        style={[styles.btn, isActive && { backgroundColor: 'red' }]} 
        onPress={() => setIsActive(!isActive)}
      >
        <Text>{isActive ? 'Stop' : 'Start'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  timerContainer: { flexDirection: 'row', alignItems: 'center', padding: 10 },
  label: { color: 'white', marginRight: 10 },
  btn: { backgroundColor: '#38BDF8', padding: 5, borderRadius: 4 }
});