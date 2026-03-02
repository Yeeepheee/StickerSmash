import { requireNativeModule } from 'expo-modules-core';

const WidgetBridge = requireNativeModule('WidgetBridge');

// --- Types ---

export type ColorHex = `#${string}`;

export interface WidgetText {
  type: 'text';
  value: string;
  fontSize?: number;
  color?: ColorHex;
  alignment?: 'center' | 'leading' | 'trailing';
}

export interface WidgetImage {
  type: 'image';
  src: string;
  width?: number;
  height?: number;
  contentMode?: 'fit' | 'fill';
}

export interface WidgetSpacer {
  type: 'spacer';
}

export type WidgetElement = WidgetText | WidgetImage | WidgetSpacer;

export interface WidgetConfig {
  layout: 'vstack' | 'hstack';
  backgroundColor?: ColorHex;
  children: WidgetElement[];
}

// --- API ---

/**
 * Updates the Android Home Screen Widget with a new configuration.
 * Call this whenever your app data changes.
 */
export async function updateWidget(config: WidgetConfig): Promise<void> {
  try {
    // Map children to ensure they have default values if the developer omitted them
    const normalizedChildren = config.children.map(child => {
      if (child.type === 'text') {
        return {
          fontSize: 16,
          color: '#000000',
          alignment: 'leading',
          ...child
        };
      }
      if (child.type === 'image') {
        return {
          width: 50,
          height: 50,
          contentMode: 'fit',
          ...child
        };
      }
      return child;
    });

    const jsonString = JSON.stringify({
      layout: config.layout,
      backgroundColor: config.backgroundColor || '#ffffff',
      children: normalizedChildren,
    });

    return await WidgetBridge.saveWidgetSchema(jsonString);
  } catch (error) {
    console.error("Widget Update Failed:", error);
    throw error;
  }
}