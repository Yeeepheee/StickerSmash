import { NativeModules } from "react-native";

// Access the native module
export const WidgetBridge: {
  /**
   * Save a widget schema JSON string to App Group storage
   * and reload all widget timelines.
   * @param json JSON string representing widget layout
   */
  saveWidgetSchema: (json: string) => Promise<void>;
} = NativeModules.WidgetBridge;
