import React, { useState } from "react";
import { SafeAreaView, TextInput, Button, Alert } from "react-native";
import { buildWidgetSchema } from "./parser/widgetPipeline";
import { WidgetBridge } from "./native/WidgetBridge";

export default function App() {
  const [code, setCode] = useState(
`<VStack background="#ffffff">
  <Text fontSize="22" color="#000000">Hello Sam</Text>
  <Text fontSize="16" color="#ff9900">24° Sunny</Text>
</VStack>`
  );

  const handleBuild = async () => {
    try {
      const schema = buildWidgetSchema(code);

      // Send schema to native widget
      await WidgetBridge.saveWidgetSchema(JSON.stringify(schema));

      Alert.alert("Success", "Widget updated!");
    } catch (err: any) {
      Alert.alert("Error", err.message);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, padding: 20 }}>
      <TextInput
        multiline
        value={code}
        onChangeText={setCode}
        style={{ flex: 1, backgroundColor: "#fff", padding: 10, fontFamily: "Courier" }}
      />
      <Button title="Build Widget" onPress={handleBuild} />
    </SafeAreaView>
  );
}
