import { requireNativeModule } from 'expo-modules-core';

const WidgetBridge = requireNativeModule('WidgetBridge');

export type ColorHex = `#${string}`;

export type OverlayAlignment =
  | 'topLeading' | 'topCenter' | 'topTrailing'
  | 'centerLeading' | 'center' | 'centerTrailing'
  | 'bottomLeading' | 'bottomCenter' | 'bottomTrailing';

export interface WidgetText {
  id?: string; // <-- ADDED: Identifier for remote data binding
  type: 'text';
  value: string;
  fontSize?: number;
  color?: ColorHex;
  textAlignment?: 'center' | 'leading' | 'trailing';
  alignment?: OverlayAlignment;
  link?: string; 
}

export interface WidgetImage {
  id?: string; // <-- ADDED: Identifier for remote data binding
  type: 'image';
  src: string;
  width?: number;
  height?: number;
  contentMode?: 'fit' | 'fill';
  alignment?: OverlayAlignment;
  isBackground?: boolean;
  link?: string;
}

export interface WidgetSpacer {
  type: 'spacer';
}

export interface WidgetContainer extends WidgetConfig {
  id?: string; // <-- ADDED: Identifier for remote data binding (e.g. override background colors)
  type: 'container';
  alignment?: OverlayAlignment;
  link?: string;
}

export type WidgetElement = WidgetText | WidgetImage | WidgetSpacer | WidgetContainer;

export interface WidgetConfig {
  layout: 'vstack' | 'hstack' | 'zstack';
  backgroundColor?: ColorHex | 'transparent';
  children: WidgetElement[];
}

export interface MultiSizeWidgetConfig {
  small: WidgetConfig;   
  medium?: WidgetConfig; 
  large?: WidgetConfig;  
  remoteConfigUrl?: string; // URL now points to a Key-Value dictionary instead of a layout schema
}

function normalizeElements(elements: WidgetElement[]): WidgetElement[] {
  return elements.map(child => {
    switch (child.type) {
      case 'text':
        return { fontSize: 16, color: '#000000', textAlignment: 'leading', alignment: 'center', ...child };
      case 'image':
        return { width: 50, height: 50, contentMode: 'fit', alignment: 'center', isBackground: false, ...child };
      case 'container':
        return {
          alignment: 'center',
          ...child,
          layout: child.layout || 'vstack',
          backgroundColor: child.backgroundColor || 'transparent',
          children: normalizeElements(child.children)
        };
      default:
        return child;
    }
  });
}

export async function updateMultiSizeWidget(config: MultiSizeWidgetConfig): Promise<void> {
  try {
    const finalConfig = {
      small: { ...config.small, children: normalizeElements(config.small.children) },
      medium: config.medium ? { ...config.medium, children: normalizeElements(config.medium.children) } : undefined,
      large: config.large ? { ...config.large, children: normalizeElements(config.large.children) } : undefined,
      remoteConfigUrl: config.remoteConfigUrl
    };

    const jsonString = JSON.stringify(finalConfig);
    return await WidgetBridge.saveWidgetSchema(jsonString);
  } catch (error) {
    console.error("Widget Update Failed:", error);
    throw error;
  }
}