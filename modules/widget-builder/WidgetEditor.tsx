import React, { useState } from "react";
import { View, TextInput, Button, Alert, StyleSheet } from "react-native";
import { buildWidgetSchema } from "./widgetCompiler";
import { saveWidgetSchema } from "./widgetBridge";

export default function WidgetEditor() {
  const [code, setCode] = useState(
`<VStack background="#ffffff">
  <Text fontSize="22" color="#000000">Hello World</Text>
  <Text fontSize="16" color="#ff9900">24° Sunny</Text>
</VStack>`
  );

  const handleBuild = async () => {
    try {
      const schema = buildWidgetSchema(code);
      await saveWidgetSchema(JSON.stringify(schema));
      Alert.alert("Success", "Widget updated!");
    } catch (err: any) {
      Alert.alert("Build Error", err.message);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        multiline
        value={code}
        onChangeText={setCode}
        style={styles.editor}
        spellCheck={false}
        autoCapitalize="none"
      />
      <Button title="Sync to Widget" onPress={handleBuild} color="#007AFF" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  editor: { 
    flex: 1, 
    backgroundColor: "#fff", 
    padding: 15, 
    fontFamily: "Courier", 
    borderRadius: 8,
    marginBottom: 20,
    textAlignVertical: "top",
    borderWidth: 1,
    borderColor: '#ddd'
  },
});