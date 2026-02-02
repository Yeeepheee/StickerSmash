import type { StyleProp, ViewStyle } from 'react-native';

export type StartActivityPayload = {
  /**
   * The Unix timestamp (in seconds) when the timer should end.
   */
  endTime: number;
  
  /**
   * The name of the timer to display in the Live Activity.
   */
  timerName?: string;
};

export type ActivityControllerModuleEvents = {
  // Define events here if you plan to send data from Swift back to JS
  // e.g., onActivityExpired: (event: { id: string }) => void;
};
