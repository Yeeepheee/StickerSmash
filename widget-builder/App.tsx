import React, { useState } from "react";
import { SafeAreaView, TextInput, Button, Alert, StyleSheet } from "react-native";
import { buildWidgetSchema } from "./widgetCompiler";
import { WidgetBridge } from "./native/WidgetBridge";

export default function App() {
  const [code, setCode] = useState(
`<VStack background="#ffffff">
  <Text fontSize="22" color="#000000">Hello World</Text>
  <Text fontSize="16" color="#ff9900">24° Sunny</Text>
  <Image src="https://upload.wikimedia.org/wikipedia/commons/3/38/Kakagaywiki.jpg" width="40" height="40" />
</VStack>`
  );

  const handleBuild = async () => {
    try {
      const schema = buildWidgetSchema(code);
      await WidgetBridge.saveWidgetSchema(JSON.stringify(schema));
      Alert.alert("Success", "Widget updated!");
    } catch (err: any) {
      Alert.alert("Build Error", err.message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <TextInput
        multiline
        value={code}
        onChangeText={setCode}
        style={styles.editor}
        spellCheck={false}
        autoCapitalize="none"
      />
      <Button title="Build Widget" onPress={handleBuild} color="#007AFF" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f5f5f5" },
  editor: { 
    flex: 1, 
    backgroundColor: "#fff", 
    padding: 15, 
    fontFamily: "Courier", 
    borderRadius: 8,
    marginBottom: 20,
    textAlignVertical: "top"
  },
});