import { useEffect, useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import * as Clipboard from "expo-clipboard";

export default function PushTokenDebugger() {
  const [token, setToken] = useState<string | null>(null);
  const [status, setStatus] = useState<string>("idle");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    getToken();
  }, []);

  async function getToken() {
    setStatus("requesting permissions...");
    const { status: perm } = await Notifications.requestPermissionsAsync();
    if (perm !== "granted") {
      setStatus("error: permission denied");
      return;
    }

    setStatus("fetching token...");
    const result = await Notifications.getExpoPushTokenAsync({
      projectId: process.env.EXPO_PUBLIC_PROJECT_ID,
    });

    setToken(result.data);
    setStatus("ready");
    console.log("PUSH TOKEN:", result.data);
  }

  async function copy() {
    if (!token) return;
    await Clipboard.setStringAsync(token);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>push token</Text>
      <Text style={styles.status}>{status}</Text>
      {token && (
        <>
          <Text style={styles.token} selectable>
            {token}
          </Text>
          <Pressable style={styles.button} onPress={copy}>
            <Text style={styles.buttonText}>
              {copied ? "copied" : "copy to clipboard"}
            </Text>
          </Pressable>
        </>
      )}
      <Pressable style={styles.retryButton} onPress={getToken}>
        <Text style={styles.retryText}>retry</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, gap: 8 },
  label: {
    fontSize: 11,
    fontWeight: "500",
    textTransform: "uppercase",
    color: "#888",
    letterSpacing: 1,
  },
  status: { fontSize: 14, color: "#555" },
  token: {
    fontSize: 13,
    fontFamily: "monospace",
    backgroundColor: "#f4f4f4",
    padding: 12,
    borderRadius: 8,
    color: "#111",
  },
  button: {
    backgroundColor: "#111",
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontWeight: "500" },
  retryButton: { padding: 8, alignItems: "center" },
  retryText: { color: "#888", fontSize: 13 },
});