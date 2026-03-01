import { requireNativeModule } from 'expo-modules-core';

const WidgetBridge = requireNativeModule('WidgetBridge');

export async function saveWidgetSchema(json: string): Promise<void> {
  return await WidgetBridge.saveWidgetSchema(json);
}