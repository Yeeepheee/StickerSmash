import { requireNativeModule } from 'expo-modules-core';
import { Asset } from 'expo-asset';

const WidgetBridge = requireNativeModule('WidgetBridge');

// MARK: - Primitives

export type ColorHex = `#${string}`;

export type OverlayAlignment =
  | 'topLeading'    | 'topCenter'    | 'topTrailing'
  | 'centerLeading' | 'center'       | 'centerTrailing'
  | 'bottomLeading' | 'bottomCenter' | 'bottomTrailing';

export type FontWeight =
  | 'ultraLight' | 'thin' | 'light' | 'regular'
  | 'medium' | 'semibold' | 'bold' | 'heavy' | 'black';

// MARK: - NodeOverride

export interface NodeOverride {
  // Text
  value?:         string;
  color?:         ColorHex;
  fontSize?:      number;
  fontWeight?:    FontWeight;
  textAlignment?: 'center' | 'leading' | 'trailing';
  // Image
  src?:           string;
  width?:         number;
  height?:        number;
  // Shared
  backgroundColor?: ColorHex | 'transparent';
  opacity?:       number;   // 0.0 – 1.0
  hidden?:        boolean;  // removes node from layout entirely
  link?:          string;
}

export type WidgetDataMap = Record<string, NodeOverride>;

// MARK: - Element Types

export interface WidgetText {
  type:           'text';
  id?:            string;
  value:          string;
  fontSize?:      number;
  fontWeight?:    FontWeight;
  color?:         ColorHex;
  textAlignment?: 'center' | 'leading' | 'trailing';
  alignment?:     OverlayAlignment;
  opacity?:       number;
  hidden?:        boolean;
  link?:          string;
}

export interface WidgetImage {
  type:         'image';
  id?:          string;
  src:          string;
  width?:       number;
  height?:      number;
  fillHeight?:  boolean;
  contentMode?: 'fit' | 'fill';
  alignment?:   OverlayAlignment;
  isBackground?: boolean;
  opacity?:     number;
  hidden?:      boolean;
  link?:        string;
}

export interface WidgetSpacer {
  type: 'spacer';
  width?: number;
}

export interface WidgetContainer extends WidgetConfig {
  type:       'container';
  id?:        string;
  alignment?: OverlayAlignment;
  opacity?:   number;
  hidden?:    boolean;
  link?:      string;
  width?:     number;
  height?:    number;
}

export type WidgetElement = WidgetText | WidgetImage | WidgetSpacer | WidgetContainer;

// MARK: - Config

export interface WidgetConfig {
  layout:            'vstack' | 'hstack' | 'zstack';
  backgroundColor?:  ColorHex | 'transparent';
  children:          WidgetElement[];
  spacing?:          number;
  cornerRadius?:     number;
  padding?:          number;
  paddingTop?:       number;
  paddingBottom?:    number;
  paddingStart?:     number;
  paddingEnd?:       number;
  contentAlignment?: 'center';
}

export interface MultiSizeWidgetConfig {
  widgetId:        string;   // e.g. "slot0", "slot1"
  small:           WidgetConfig;
  medium?:         WidgetConfig;
  large?:          WidgetConfig;
  remoteConfigUrl?: string;  // optional URL for server-driven overrides
}

// MARK: - Normalization

function normalizeElements(elements: WidgetElement[]): WidgetElement[] {
  return elements.map(child => {
    switch (child.type) {
      case 'text':
        return {
          fontSize:      16,
          fontWeight:    'regular' as FontWeight,
          color:         '#000000' as ColorHex,
          textAlignment: 'leading' as const,
          opacity:       1.0,
          hidden:        false,
          ...child,
        };

      case 'image':
        return {
          width:        50,
          ...(!child.fillHeight && { height: 50 }),
          contentMode:  'fit' as const,
          alignment:    'center' as OverlayAlignment,
          isBackground: false,
          opacity:      1.0,
          hidden:       false,
          ...child,
        };

      case 'container':
        return {
          opacity:         1.0,
          hidden:          false,
          ...child,
          layout:          child.layout          || 'vstack',
          backgroundColor: child.backgroundColor || 'transparent',
          children:        normalizeElements(child.children),
        };

      default:
        return child;
    }
  });
}

// MARK: - API Functions

/**
 * Sends the full widget layout schema (structure + default values).
 * Call this when setting up or redesigning a widget slot.
 * Bound nodes use the `id` field as a key — data can be updated
 * independently later via writeWidgetData() without re-sending the schema.
 */
export async function updateMultiSizeWidget(config: MultiSizeWidgetConfig): Promise<void> {
  try {
    const { widgetId, ...schema } = config;

    const finalConfig = {
      small:           { ...schema.small,   children: normalizeElements(schema.small.children) },
      medium:          schema.medium ? { ...schema.medium,  children: normalizeElements(schema.medium.children)  } : undefined,
      large:           schema.large  ? { ...schema.large,   children: normalizeElements(schema.large.children)   } : undefined,
      remoteConfigUrl: schema.remoteConfigUrl,
    };

    const jsonString = JSON.stringify(finalConfig);
    return await WidgetBridge.saveWidgetSchema(jsonString, widgetId);
  } catch (error) {
    console.error(`updateMultiSizeWidget failed [${config.widgetId}]:`, error);
    throw error;
  }
}

/**
 * Pushes runtime data overrides to a widget slot.
 * Keys must match the `id` field of nodes in the schema.
 * Only the provided keys are updated — all others keep their current values.
 * Triggers an immediate widget reload.
 *
 * @example
 * await writeWidgetData('slot0', {
 *   event_title_0: { value: 'Team standup', fontWeight: 'medium' },
 *   event_time_0:  { value: '9:00 AM', color: '#888888' },
 *   event_dot_0:   { backgroundColor: '#FF3B30' },
 *   stale_event:   { hidden: true },
 * })
 */
export async function writeWidgetData(widgetId: string, data: WidgetDataMap): Promise<void> {
  try {
    return await WidgetBridge.writeWidgetData(data, widgetId);
  } catch (error) {
    console.error(`writeWidgetData failed [${widgetId}]:`, error);
    throw error;
  }
}

/**
 * Clears the schema and cached data for a widget slot,
 * returning it to the default "No Content" state.
 */
export async function removeWidget(widgetId: string): Promise<void> {
  try {
    return await WidgetBridge.removeWidgetSchema(widgetId);
  } catch (error) {
    console.error(`removeWidget failed [${widgetId}]:`, error);
    throw error;
  }
}

/**
 * Returns slot usage info — how many slots are used vs available.
 */
export async function getSlotInfo(): Promise<{
  maxSlots:        number;
  usedSlots:       number;
  availableSlots:  number;
  assignments:     Record<string, number>;
}> {
  try {
    return await WidgetBridge.getSlotInfo();
  } catch (error) {
    console.error('getSlotInfo failed:', error);
    throw error;
  }
}


/**
 * Copies a bundled app asset into the platform's widget-accessible shared
 * storage so it can be referenced in widget schemas via the `shared://` scheme.
 *
 * Safe to call on every launch (skips the copy if the file already exists).
 * Pass force: true to overwrite (use for live-updating images like avatars).
 *
 * @example
 * await seedSharedAsset(require('../assets/dot_blue.png'), 'dot_blue.png');
 * // schema: { type: 'image', src: 'shared://dot_blue.png' }
 */
export async function seedSharedAsset(
  module: number,
  filename: string,
  force = false,
): Promise<'copied' | 'exists'> {
  try {
    const [asset] = await Asset.loadAsync(module);
    if (!asset.localUri) throw new Error('Could not resolve local URI for asset');
    const localPath = asset.localUri.replace('file://', '');
    return await WidgetBridge.seedSharedAsset(localPath, filename, force);
  } catch (error) {
    console.error(`seedSharedAsset failed [${filename}]:`, error);
    throw error;
  }
}

/**
 * Seeds multiple assets in parallel.
 *
 * @example
 * await seedSharedAssets([
 *   { module: require('../assets/dot_blue.png'), filename: 'dot_blue.png' },
 *   { module: require('../assets/avatar.jpg'),   filename: 'avatar.jpg'   },
 * ]);
 */
export async function seedSharedAssets(
  assets: Array<{ module: number; filename: string; force?: boolean }>,
): Promise<void> {
  await Promise.all(
    assets.map(({ module, filename, force }) => seedSharedAsset(module, filename, force))
  );
}