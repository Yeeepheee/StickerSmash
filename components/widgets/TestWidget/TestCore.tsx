/**
 * TestCore.tsx
 *
 * Shared primitives, schema shells, and registration
 */

import {
  updateMultiSizeWidget,
  writeWidgetData,
  type WidgetConfig,
} from '@/modules/widget-builder';

export { updateMultiSizeWidget, writeWidgetData };

export const WIDGET_ID = 'slot3';

// MARK: Palette
export const C = {
  white:     '#FFFFFF' as const,
  black:     '#000000' as const,
  gray:      '#8E8E93' as const,
  lightGray: '#E5E5EA' as const,
  red:       '#FF3B30' as const,
  orange:    '#FF9500' as const,
  yellow:    '#FFCC00' as const,
  green:     '#34C759' as const,
  teal:      '#5AC8FA' as const,
  blue:      '#007AFF' as const,
  purple:    '#AF52DE' as const,
  pink:      '#FF2D55' as const,
};

// MARK: Element builders
export function txt(
  value: string,
  opts: {
    id?:      string;
    size?:    number;
    weight?:  any;
    color?:   string;
    align?:   'leading' | 'center' | 'trailing';
    opacity?: number;
    hidden?:  boolean;
  } = {}
) {
  return {
    type:          'text' as const,
    value,
    ...(opts.id !== undefined ? { id: opts.id }                  : {}),
    fontSize:      opts.size    ?? 13,
    fontWeight:    opts.weight  ?? 'regular',
    color:         (opts.color  ?? C.black) as any,
    textAlignment: opts.align   ?? 'leading',
    ...(opts.opacity !== undefined ? { opacity: opts.opacity }   : {}),
    ...(opts.hidden  !== undefined ? { hidden:  opts.hidden  }   : {}),
  };
}

/** Solid-coloured rectangle with a centred label. */
export function swatch(
  label: string,
  bg: string,
  fg = C.white,
  w?: number,
  h?: number
) {
  return {
    type:            'container' as const,
    layout:          'vstack'   as const,
    backgroundColor: bg as any,
    ...(w !== undefined ? { width:  w } : {}),
    ...(h !== undefined ? { height: h } : {}),
    children: [txt(label, { size: 10, color: fg, align: 'center' })],
  };
}

/** 1 dp horizontal rule. */
export function rule(color = C.lightGray) {
  return {
    type:            'container' as const,
    layout:          'hstack'   as const,
    backgroundColor: color      as any,
    height:          1,
    children:        [] as any[],
  };
}

/** Compact section header bar. */
export function sectionHeader(label: string) {
  return {
    type:            'container' as const,
    layout:          'hstack'   as const,
    backgroundColor: C.lightGray as any,
    paddingTop:      3,
    paddingBottom:   3,
    paddingStart:    6,
    children:        [txt(label, { size: 10, weight: 'semibold', color: C.gray })],
  };
}

// MARK: Small widget - status panel (shared by every test)
// Node IDs:  sm_name  sm_label  sm_status
export const smallSchema: WidgetConfig = {
  layout:          'vstack',
  backgroundColor: C.white,
  children: [
    txt('WIDGET TEST', { size: 9, weight: 'semibold', color: C.gray, align: 'center' }),
    { type: 'spacer' },
    txt('', { id: 'sm_name',   size: 14, weight: 'bold',     color: C.blue,  align: 'center' }),
    txt('', { id: 'sm_label',  size: 10, weight: 'regular',  color: C.gray,  align: 'center' }),
    { type: 'spacer' },
    txt('', { id: 'sm_status', size: 10, weight: 'semibold', color: C.green, align: 'center' }),
  ],
};

// MARK: Medium widget - EXPECTED vs RENDERED panel (shared by every test)
// Node IDs:  med_e1…med_e4  (left - expected description)
//            med_r1…med_r4  (right - actual rendered sample)
export const mediumSchema: WidgetConfig = {
  layout:          'hstack',
  backgroundColor: C.white,
  children: [
    // Left: expected
    {
      type:            'container',
      layout:          'vstack',
      backgroundColor: 'transparent',
      paddingEnd:      8,
      children: [
        txt('EXPECTED', { size: 9, weight: 'semibold', color: C.gray }),
        { type: 'spacer' },
        txt('', { id: 'med_e1', size: 11, color: C.black }),
        txt('', { id: 'med_e2', size: 11, color: C.black }),
        txt('', { id: 'med_e3', size: 11, color: C.black }),
        txt('', { id: 'med_e4', size: 11, color: C.black }),
        { type: 'spacer' },
      ],
    },
    {
      type:            'container',
      layout:          'vstack',
      backgroundColor: C.lightGray,
      width:           1,
      children:        [],
    },
    {
      type:            'container',
      layout:          'vstack',
      backgroundColor: 'transparent',
      paddingStart:    8,
      children: [
        txt('RENDERED', { size: 9, weight: 'semibold', color: C.gray }),
        { type: 'spacer' },
        txt('', { id: 'med_r1', size: 11, color: C.black }),
        txt('', { id: 'med_r2', size: 11, color: C.black }),
        txt('', { id: 'med_r3', size: 11, color: C.black }),
        txt('', { id: 'med_r4', size: 11, color: C.black }),
        { type: 'spacer' },
      ],
    },
  ],
};

// MARK: Large widget shell
// Node ID in header:  lg_tag
// Keep testChildren ≤ 7 items to stay inside the ~190 dp content budget.
export function makeLarge(testChildren: any[]): WidgetConfig {
  return {
    layout:          'vstack',
    backgroundColor: C.white,
    children: [
      {
        type:            'container',
        layout:          'hstack',
        backgroundColor: C.blue,
        paddingTop:      6,
        paddingBottom:   6,
        paddingStart:    12,
        children: [
          txt('WidgetTest', { size: 12, weight: 'semibold', color: C.white }),
          { type: 'spacer' },
          txt('', { id: 'lg_tag', size: 11, color: C.white }),
        ],
      },
      {
        type:            'container',
        layout:          'vstack',
        backgroundColor: 'transparent',
        padding:         10,
        spacing:         6,
        children:        testChildren,
      },
      { type: 'spacer' },
    ],
  };
}

// MARK: setStatus - updates small widget + large header tag
// Call this at the end of every runTest_N() after updateMultiSizeWidget().
export async function setStatus(
  num: number,
  name: string,
  detail: string,
  statusColor: string = C.blue
): Promise<void> {
  await writeWidgetData(WIDGET_ID, {
    sm_name:   { value: `Test ${num}` },
    sm_label:  { value: name },
    sm_status: { value: detail, color: statusColor as any },
    lg_tag:    { value: `#${num} ${name}` },
  });
}

// MARK: setMedium - convenience helper to fill all 8 medium panel slots
// Writes plain string values to med_e1–e4 (left/expected column) and
// med_r1–r4 (right/rendered column).  For richer overrides (color, fontSize,
// opacity, etc.) call writeWidgetData() directly instead.
export async function setMedium(
  e1: string, e2: string, e3: string, e4: string,
  r1: string, r2: string, r3: string, r4: string,
): Promise<void> {
  await writeWidgetData(WIDGET_ID, {
    med_e1: { value: e1 }, med_e2: { value: e2 },
    med_e3: { value: e3 }, med_e4: { value: e4 },
    med_r1: { value: r1 }, med_r2: { value: r2 },
    med_r3: { value: r3 }, med_r4: { value: r4 },
  });
}

// MARK: clearMedium - blanks all medium panel slots
// Call before writing only some slots so stale values don't linger.
export async function clearMedium(): Promise<void> {
  await writeWidgetData(WIDGET_ID, {
    med_e1: { value: '' }, med_e2: { value: '' },
    med_e3: { value: '' }, med_e4: { value: '' },
    med_r1: { value: '' }, med_r2: { value: '' },
    med_r3: { value: '' }, med_r4: { value: '' },
  });
}

// MARK: registerTestWidget - call once before running any test
export async function registerTestWidget(): Promise<void> {
  await updateMultiSizeWidget({
    widgetId: WIDGET_ID,
    small:  smallSchema,
    medium: mediumSchema,
    large:  makeLarge([
      txt('No test loaded yet.', { color: C.gray, align: 'center' }),
      txt('Call registerTestWidget() then runTest_N()', { size: 11, color: C.gray, align: 'center' }),
    ]),
  });
  await writeWidgetData(WIDGET_ID, {
    sm_name:   { value: 'Ready' },
    sm_label:  { value: 'call runTest_N()' },
    sm_status: { value: '● Idle', color: C.gray as any },
    lg_tag:    { value: 'idle' },
    med_e1: { value: '' }, med_e2: { value: '' },
    med_e3: { value: '' }, med_e4: { value: '' },
    med_r1: { value: '' }, med_r2: { value: '' },
    med_r3: { value: '' }, med_r4: { value: '' },
  });
}