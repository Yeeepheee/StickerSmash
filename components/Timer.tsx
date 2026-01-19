import { useEffect, useState, useRef } from 'react';
import { Text, View, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { DeviceEventEmitter } from 'react-native';
import LiveTimer from '@/components/LiveTimer';
export default function Timer() {
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  
  // FIXED: We use a ref to store the startTime so it doesn't 
  // reset every time the component re-renders.
  const startTimeRef = useRef<number | null>(null);
useEffect(() => {
  // Listen for the Stop signal from the Notification Button
  const sub = DeviceEventEmitter.addListener('onTimerStopped', () => {
    setIsActive(false); 
  });

  return () => sub.remove();
}, []);

useEffect(() => {
  let interval: any = null;

  if (isActive) {
    startTimeRef.current = Date.now(); 

    if (Platform.OS === 'android') {
      LiveTimer.startLiveActivity(startTimeRef.current);
    }

    interval = setInterval(() => {
      if (startTimeRef.current) {
        const now = Date.now();
        const elapsed = Math.floor((now - startTimeRef.current) / 1000);
        setSeconds(elapsed);
      }
    }, 100); 
  } else {
    // If we are stopping, clean up everything
    if (interval) clearInterval(interval);
    
    // Only call native stop if the ref wasn't already cleared by the listener
    if (Platform.OS === 'android' && startTimeRef.current !== null) {
      LiveTimer.stopLiveActivity();
    }
    
    startTimeRef.current = null;
    setSeconds(0);
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
        <TouchableOpacity style={styles.button} onPress={() => setIsActive(!isActive)}>
          <Text style={styles.buttonText}>{isActive ? 'STOP' : 'START'}</Text>
        </TouchableOpacity>
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
      web: 'monospace',
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