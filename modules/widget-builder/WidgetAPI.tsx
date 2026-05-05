import { requireNativeModule } from 'expo-modules-core';

const WidgetBridge = requireNativeModule('WidgetBridge');

export type ColorHex = `#${string}`;

export type OverlayAlignment =
  | 'topLeading' | 'topCenter' | 'topTrailing'
  | 'centerLeading' | 'center' | 'centerTrailing'
  | 'bottomLeading' | 'bottomCenter' | 'bottomTrailing';

export interface WidgetText {
  id?: string;
  type: 'text';
  value: string;
  fontSize?: number;
  color?: ColorHex;
  textAlignment?: 'center' | 'leading' | 'trailing';
  alignment?: OverlayAlignment;
  link?: string;
}

export interface WidgetImage {
  id?: string;
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
  id?: string;
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
  widgetId: string;        // e.g. "slot1", "slot2"
  small: WidgetConfig;
  medium?: WidgetConfig;
  large?: WidgetConfig;
  remoteConfigUrl?: string;
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
    const { widgetId, ...schema } = config;

    const finalConfig = {
      small: { ...schema.small, children: normalizeElements(schema.small.children) },
      medium: schema.medium ? { ...schema.medium, children: normalizeElements(schema.medium.children) } : undefined,
      large: schema.large ? { ...schema.large, children: normalizeElements(schema.large.children) } : undefined,
      remoteConfigUrl: schema.remoteConfigUrl
    };

    const jsonString = JSON.stringify(finalConfig);
    return await WidgetBridge.saveWidgetSchema(jsonString, widgetId);
  } catch (error) {
    console.error(`Widget Update Failed [${config.widgetId}]:`, error);
    throw error;
  }
}