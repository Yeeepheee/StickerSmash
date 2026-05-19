/**
 * TestText.tsx  -  Tests 1 – 6
 *
 *  1 / 1b  Font weights - light end / heavy end
 *  2 / 2b  Font sizes - small (8–14 pt) / large (18–24 pt)
 *  3 / 3b  Solid text colors - warm / cool
 *  4       Text opacity
 *  5 / 5b  Text alignment - basic / mixed sizes
 *  6       Empty-string placeholder
 */

import {
  WIDGET_ID, C,
  txt, rule, sectionHeader,
  smallSchema, mediumSchema, makeLarge,
  setStatus, setMedium, updateMultiSizeWidget, writeWidgetData,
} from './TestCore';

// MARK: Test1 - Font weights (light end)

export async function runTest_1(): Promise<void> {
  await updateMultiSizeWidget({
    widgetId: WIDGET_ID,
    small:  smallSchema,
    medium: mediumSchema,
    large:  makeLarge([
      sectionHeader('FONT WEIGHTS - light end'),
      txt('ultraLight', { size: 13, weight: 'ultraLight' }),
      txt('thin',       { size: 13, weight: 'thin'       }),
      txt('light',      { size: 13, weight: 'light'      }),
      txt('regular',    { size: 13, weight: 'regular'    }),
    ]),
  });
  await setStatus(1, 'Font Weights (light)', 'ultraLight → regular');
  await writeWidgetData(WIDGET_ID, {
    med_e1: { value: 'ultraLight = thinnest strokes' },
    med_e2: { value: 'thin = slightly heavier' },
    med_e3: { value: 'light = noticeably lighter than regular' },
    med_e4: { value: 'regular = normal weight' },
    med_r1: { value: 'ultraLight', fontWeight: 'ultraLight', fontSize: 14, color: C.black },
    med_r2: { value: 'thin',       fontWeight: 'thin',       fontSize: 14, color: C.black },
    med_r3: { value: 'light',      fontWeight: 'light',      fontSize: 14, color: C.black },
    med_r4: { value: 'regular',    fontWeight: 'regular',    fontSize: 14, color: C.black },
  });
}

// MARK: Test 1b - Font weights (heavy end)

export async function runTest_1b(): Promise<void> {
  await updateMultiSizeWidget({
    widgetId: WIDGET_ID,
    small:  smallSchema,
    medium: mediumSchema,
    large:  makeLarge([
      sectionHeader('FONT WEIGHTS - heavy end'),
      txt('medium',   { size: 13, weight: 'medium'   }),
      txt('semibold', { size: 13, weight: 'semibold' }),
      txt('bold',     { size: 13, weight: 'bold'     }),
      txt('black',    { size: 13, weight: 'black'    }),
    ]),
  });
  await setStatus(1, 'Font Weights (heavy)', 'medium → black');
  await writeWidgetData(WIDGET_ID, {
    med_e1: { value: 'medium = slightly above regular' },
    med_e2: { value: 'semibold = clearly heavier' },
    med_e3: { value: 'bold = strong weight' },
    med_e4: { value: 'black = heaviest strokes' },
    med_r1: { value: 'medium',   fontWeight: 'medium',   fontSize: 14, color: C.black },
    med_r2: { value: 'semibold', fontWeight: 'semibold', fontSize: 14, color: C.black },
    med_r3: { value: 'bold',     fontWeight: 'bold',     fontSize: 14, color: C.black },
    med_r4: { value: 'black',    fontWeight: 'black',    fontSize: 14, color: C.black },
  });
}

// MARK: Test2 - Font sizes (small)

export async function runTest_2(): Promise<void> {
  await updateMultiSizeWidget({
    widgetId: WIDGET_ID,
    small:  smallSchema,
    medium: mediumSchema,
    large:  makeLarge([
      sectionHeader('FONT SIZES - 8 pt → 14 pt'),
      txt('8 pt text',  { size: 8  }),
      txt('10 pt text', { size: 10 }),
      txt('12 pt text', { size: 12 }),
      txt('14 pt text', { size: 14 }),
    ]),
  });
  await setStatus(2, 'Font Sizes (small)', '8 → 14 pt');
  await writeWidgetData(WIDGET_ID, {
    med_e1: { value: 'Each row grows visibly larger' },
    med_e2: { value: '8 pt is tiny, 14 pt comfortable' },
    med_e3: { value: 'Steps are proportional' },
    med_e4: { value: '' },
    med_r1: { value: '8 pt',  fontSize: 8,  color: C.black },
    med_r2: { value: '10 pt', fontSize: 10, color: C.black },
    med_r3: { value: '12 pt', fontSize: 12, color: C.black },
    med_r4: { value: '14 pt', fontSize: 14, color: C.black },
  });
}

// MARK: Test 2b - Font sizes (large)

export async function runTest_2b(): Promise<void> {
  await updateMultiSizeWidget({
    widgetId: WIDGET_ID,
    small:  smallSchema,
    medium: mediumSchema,
    large:  makeLarge([
      sectionHeader('FONT SIZES - 18 pt → 24 pt'),
      txt('18 pt text', { size: 18 }),
      txt('20 pt text', { size: 20 }),
      txt('24 pt text', { size: 24 }),
    ]),
  });
  await setStatus(2, 'Font Sizes (large)', '18 → 24 pt');
  await writeWidgetData(WIDGET_ID, {
    med_e1: { value: '18 pt = large, clearly readable' },
    med_e2: { value: '20 pt = display size' },
    med_e3: { value: '24 pt = headline size' },
    med_e4: { value: '' },
    med_r1: { value: '18 pt', fontSize: 18, color: C.black },
    med_r2: { value: '20 pt', fontSize: 20, color: C.black },
    med_r3: { value: '24 pt', fontSize: 24, color: C.black },
    med_r4: { value: '' },
  });
}

// MARK: Test3 - Solid text colors (warm)

export async function runTest_3(): Promise<void> {
  await updateMultiSizeWidget({
    widgetId: WIDGET_ID,
    small:  smallSchema,
    medium: mediumSchema,
    large:  makeLarge([
      sectionHeader('TEXT COLORS - warm tones'),
      txt('Red    #FF3B30', { size: 13, color: C.red    }),
      txt('Orange #FF9500', { size: 13, color: C.orange }),
      txt('Yellow #FFCC00', { size: 13, color: C.yellow }),
      txt('Green  #34C759', { size: 13, color: C.green  }),
    ]),
  });
  await setStatus(3, 'Text Colors (warm)', 'Red / Orange / Yellow / Green');
  await writeWidgetData(WIDGET_ID, {
    med_e1: { value: 'Each row matches its hex color' },
    med_e2: { value: 'Colors saturated, not washed out' },
    med_e3: { value: '' },
    med_e4: { value: '' },
    med_r1: { value: 'Red',    color: C.red,    fontSize: 13 },
    med_r2: { value: 'Orange', color: C.orange, fontSize: 13 },
    med_r3: { value: 'Yellow', color: C.yellow, fontSize: 13 },
    med_r4: { value: 'Green',  color: C.green,  fontSize: 13 },
  });
}

// MARK: Test 3b - Solid text colors (cool)

export async function runTest_3b(): Promise<void> {
  await updateMultiSizeWidget({
    widgetId: WIDGET_ID,
    small:  smallSchema,
    medium: mediumSchema,
    large:  makeLarge([
      sectionHeader('TEXT COLORS - cool tones'),
      txt('Teal   #5AC8FA', { size: 13, color: C.teal   }),
      txt('Blue   #007AFF', { size: 13, color: C.blue   }),
      txt('Purple #AF52DE', { size: 13, color: C.purple }),
      txt('Pink   #FF2D55', { size: 13, color: C.pink   }),
    ]),
  });
  await setStatus(3, 'Text Colors (cool)', 'Teal / Blue / Purple / Pink');
  await writeWidgetData(WIDGET_ID, {
    med_e1: { value: 'Each row matches its hex color' },
    med_e2: { value: 'Colors saturated, not washed out' },
    med_e3: { value: '' },
    med_e4: { value: '' },
    med_r1: { value: 'Teal',   color: C.teal,   fontSize: 13 },
    med_r2: { value: 'Blue',   color: C.blue,   fontSize: 13 },
    med_r3: { value: 'Purple', color: C.purple, fontSize: 13 },
    med_r4: { value: 'Pink',   color: C.pink,   fontSize: 13 },
  });
}

// MARK: Test4 - Text opacity

export async function runTest_4(): Promise<void> {
  await updateMultiSizeWidget({
    widgetId: WIDGET_ID,
    small:  smallSchema,
    medium: mediumSchema,
    large:  makeLarge([
      sectionHeader('TEXT OPACITY - same blue, fading alpha'),
      txt('opacity 1.0  - fully visible',    { size: 13, color: C.blue, opacity: 1.0  }),
      txt('opacity 0.5  - half',             { size: 13, color: C.blue, opacity: 0.5  }),
      txt('opacity 0.25 - faint',            { size: 13, color: C.blue, opacity: 0.25 }),
      txt('opacity 0.1  - nearly invisible', { size: 13, color: C.blue, opacity: 0.1  }),
    ]),
  });
  await setStatus(4, 'Text Opacity', '1.0 → 0.1 continuous fade');
  await writeWidgetData(WIDGET_ID, {
    med_e1: { value: '1.0 = full blue' },
    med_e2: { value: '0.5 = clearly faded' },
    med_e3: { value: '0.1 = nearly gone' },
    med_e4: { value: 'Smooth, continuous fade' },
    med_r1: { value: 'opacity 1.0',  color: C.blue, opacity: 1.0,  fontSize: 13 },
    med_r2: { value: 'opacity 0.5',  color: C.blue, opacity: 0.5,  fontSize: 13 },
    med_r3: { value: 'opacity 0.25', color: C.blue, opacity: 0.25, fontSize: 13 },
    med_r4: { value: 'opacity 0.1',  color: C.blue, opacity: 0.1,  fontSize: 13 },
  });
}

// MARK: Test5 - Text alignment (basic)

export async function runTest_5(): Promise<void> {
  await updateMultiSizeWidget({
    widgetId: WIDGET_ID,
    small:  smallSchema,
    medium: mediumSchema,
    large:  makeLarge([
      sectionHeader('TEXT ALIGNMENT - all three values'),
      txt('← leading text',   { size: 14, align: 'leading'  }),
      txt('center text →←',  { size: 14, align: 'center'   }),
      txt('trailing text →', { size: 14, align: 'trailing' }),
    ]),
  });
  await setStatus(5, 'Text Alignment', 'leading / center / trailing');
  await writeWidgetData(WIDGET_ID, {
    med_e1: { value: 'leading  → text hugs left edge' },
    med_e2: { value: 'center   → text is centred' },
    med_e3: { value: 'trailing → text hugs right edge' },
    med_e4: { value: 'All fill full column width' },
    med_r1: { value: '← leading',  textAlignment: 'leading',  fontSize: 13, color: C.black },
    med_r2: { value: 'center →←',  textAlignment: 'center',   fontSize: 13, color: C.black },
    med_r3: { value: 'trailing →', textAlignment: 'trailing', fontSize: 13, color: C.black },
    med_r4: { value: '' },
  });
}

// MARK: Test 5b - Text alignment (mixed sizes)

export async function runTest_5b(): Promise<void> {
  await updateMultiSizeWidget({
    widgetId: WIDGET_ID,
    small:  smallSchema,
    medium: mediumSchema,
    large:  makeLarge([
      sectionHeader('MIXED SIZES - alignment must still hold'),
      txt('← small leading (10 pt)',  { size: 10, align: 'leading'  }),
      txt('center bold (16 pt)',       { size: 16, weight: 'bold', align: 'center'   }),
      txt('trailing small (10 pt) →', { size: 10, align: 'trailing' }),
    ]),
  });
  await setStatus(5, 'Text Alignment (mixed)', 'Alignment holds across sizes');
  await writeWidgetData(WIDGET_ID, {
    med_e1: { value: 'leading holds at 10 pt' },
    med_e2: { value: 'center holds at 16 pt bold' },
    med_e3: { value: 'trailing holds at 10 pt' },
    med_e4: { value: 'Size must not break alignment' },
    med_r1: { value: '← leading',  textAlignment: 'leading',  fontSize: 10, color: C.black },
    med_r2: { value: 'center',      textAlignment: 'center',   fontSize: 16, color: C.black, fontWeight: 'bold' },
    med_r3: { value: 'trailing →', textAlignment: 'trailing', fontSize: 10, color: C.black },
    med_r4: { value: '' },
  });
}

// MARK: Test6 - Empty string placeholder

export async function runTest_6(): Promise<void> {
  await updateMultiSizeWidget({
    widgetId: WIDGET_ID,
    small:  smallSchema,
    medium: mediumSchema,
    large:  makeLarge([
      sectionHeader('EMPTY STRING - must be invisible'),
      txt('Row above (visible)', { size: 13, color: C.green }),
      txt('',                    { size: 13             }),  // ← must be invisible
      txt('Row below (visible)', { size: 13, color: C.green }),
      txt('Blank row must reserve space but show NO text', { size: 10, color: C.gray }),
    ]),
  });
  await setStatus(6, 'Empty String', 'Invisible space-reserving placeholder');
  await writeWidgetData(WIDGET_ID, {
    med_e1: { value: 'Green row visible' },
    med_e2: { value: 'BLANK - no text visible' },
    med_e3: { value: 'Green row visible again' },
    med_e4: { value: 'Space reserved, no mark shown' },
    med_r1: { value: 'visible ✓', color: C.green, fontSize: 13 },
    med_r2: { value: '',          fontSize: 13                  },
    med_r3: { value: 'visible ✓', color: C.green, fontSize: 13 },
    med_r4: { value: '' },
  });
}