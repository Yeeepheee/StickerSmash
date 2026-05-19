// app/test.tsx (or wherever this lives)

import { useState, useEffect } from "react";
import { AppState, ScrollView, View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import * as Notifications from "expo-notifications";
import PushTokenDebugger from "@/components/Pushtokendebugger";
import { registerCalendarWidget, refreshCalendarWidget } from '@/components/widgets/CalendarWidget';

import { WIDGET_TESTS, registerTestWidget, runAllTests } from '@/components/widgets/TestWidget';
import { seedSharedAssets } from '@/modules/widget-builder';

async function seedWidgetAssets() {
  await seedSharedAssets([
    { module: require('@/assets/images/dot_blue.png'), filename: 'dot_blue.png' },
  ]);
}

// LIVE UPDATE EXAMPLE (commented out)
// Use this pattern whenever you want to push a new image into a widget at
// runtime — e.g. a freshly downloaded avatar, a generated chart, a QR code.
//
// import * as FileSystem from 'expo-file-system';
// import * as ImagePicker from 'expo-image-picker';
// import { writeWidgetData } from '@/modules/widget-builder';
//
// async function updateWidgetWithLiveImage() {
//   // 1. Get a local image URI from anywhere — camera, picker, network, canvas
//   const result = await ImagePicker.launchImageLibraryAsync({ base64: false });
//   if (result.canceled) return;
//   const localUri = result.assets[0].uri;
//
//   // 2. Overwrite the shared file (force: true so the old version is replaced)
//   await seedSharedAsset(localUri, 'avatar.jpg', true);
//
//   // 3. Push a data override so the widget reloads and picks up the new file.
//   //    The node with id 'user_avatar' must already exist in your widget schema.
//   await writeWidgetData('slot0', {
//     user_avatar: { src: 'shared://avatar.jpg' },
//   });
// }
//

export default function Test() {
  const [running, setRunning] = useState<string | null>(null);
  const [last, setLast]       = useState<string | null>(null);

  useEffect(() => {
    const subscription = Notifications.addNotificationReceivedListener(notification => {
      console.log("[TEST] Push received:", notification.request.content.data);
    });
    return () => subscription.remove();
  }, []);

  useEffect(() => {
    registerCalendarWidget();
    refreshCalendarWidget();
    const sub = AppState.addEventListener('change', state => {
      if (state === 'active') refreshCalendarWidget();
    });
    return () => sub.remove();
  }, []);

  // Seed shared assets on mount so shared:// image tests work
  useEffect(() => {
    seedWidgetAssets().catch(e =>
      console.warn('[TEST] seedWidgetAssets failed:', e)
    );
  }, []);

  async function run(label: string, fn: () => Promise<void>) {
    setRunning(label);
    setLast(null);
    try {
      await fn();
      setLast(`✓ ${label}`);
    } catch (e: any) {
      setLast(`✗ ${label}: ${e?.message ?? e}`);
    } finally {
      setRunning(null);
    }
  }

  async function runAll() {
    setRunning('Run All');
    setLast(null);
    try {
      await runAllTests(2000);
      setLast('✓ All tests complete');
    } catch (e: any) {
      setLast(`✗ runAll: ${e?.message ?? e}`);
    } finally {
      setRunning(null);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Status bar */}
      {(running || last) && (
        <View style={[styles.status, last?.startsWith('✗') && styles.statusError]}>
          {running
            ? <><ActivityIndicator color="#fff" /><Text style={styles.statusText}>  {running}</Text></>
            : <Text style={styles.statusText}>{last}</Text>
          }
        </View>
      )}

      {/* Setup */}
      <Text style={styles.section}>Setup</Text>
      <TouchableOpacity
        style={[styles.btn, styles.btnSetup]}
        onPress={() => run('Register widget', registerTestWidget)}
        disabled={!!running}
      >
        <Text style={styles.btnText}>Register test widget</Text>
      </TouchableOpacity>

      {/* Individual tests mapped automatically from your single index.ts export */}
      <Text style={styles.section}>Individual Tests</Text>
      {WIDGET_TESTS.map(({ label, fn }) => (
        <TouchableOpacity
          key={label}
          style={[styles.btn, running === label && styles.btnActive]}
          onPress={() => run(label, fn)}
          disabled={!!running}
        >
          <Text style={styles.btnText}>{label}</Text>
          {running === label && <ActivityIndicator color="#fff" style={{ marginLeft: 8 }} />}
        </TouchableOpacity>
      ))}

      {/* Run all */}
      <Text style={styles.section}>Automation</Text>
      <TouchableOpacity
        style={[styles.btn, styles.btnAll]}
        onPress={runAll}
        disabled={!!running}
      >
        <Text style={styles.btnText}>▶  Run all tests (2 s delay)</Text>
      </TouchableOpacity>

      <Text style={styles.section}>Push Notifications</Text>
      <PushTokenDebugger />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 40,
    gap: 8,
  },
  section: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8E8E93',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 16,
    marginBottom: 2,
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  btnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  btnSetup: {
    backgroundColor: '#34C759',
  },
  btnAll: {
    backgroundColor: '#AF52DE',
  },
  btnActive: {
    opacity: 0.7,
  },
  status: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1C1C1E',
    borderRadius: 10,
    padding: 12,
    marginBottom: 4,
  },
  statusError: {
    backgroundColor: '#FF3B30',
  },
  statusText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
  },
});