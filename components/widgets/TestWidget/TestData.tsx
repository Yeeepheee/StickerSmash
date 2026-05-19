/**
 * TestData.tsx  -  Tests 14 – 20
 *
 * 14/14b  Container background colors
 * 15      Hidden nodes - toggle via writeWidgetData
 * 16      Dynamic schema - named node IDs
 * 17      Dynamic live-data override
 * 18      Image contentMode fit vs fill
 * 19      Image opacity
 * 20      Nested real-world widget
 */

import {
  WIDGET_ID, C,
  txt, rule, sectionHeader, swatch,
  smallSchema, mediumSchema, makeLarge,
  setStatus, setMedium, updateMultiSizeWidget, writeWidgetData,
} from './TestCore';

// MARK: Test 14 - Container background colors (solid + special)

export async function runTest_14(): Promise<void> {
  await updateMultiSizeWidget({
    widgetId: WIDGET_ID,
    small:  smallSchema,
    medium: mediumSchema,
    large:  makeLarge([
      sectionHeader('CONTAINER COLORS - solid backgrounds'),
      {
        type: 'container', layout: 'hstack', backgroundColor: C.lightGray,
        children: [
          swatch('red',    C.red,    C.white, 40, 28),
          swatch('orange', C.orange, C.white, 40, 28),
          swatch('green',  C.green,  C.white, 40, 28),
          swatch('blue',   C.blue,   C.white, 40, 28),
        ],
      },
      rule(),
      sectionHeader('CONTAINER COLORS - transparent + white + black'),
      {
        type: 'container', layout: 'hstack', backgroundColor: C.lightGray,
        children: [
          swatch('transp', 'transparent', C.black, 55, 28),
          swatch('white',  C.white,       C.black, 55, 28),
          swatch('black',  C.black,       C.white, 55, 28),
        ],
      },
    ]),
  });
  await setStatus(14, 'Container Colors', 'Solid, transparent, white, black');
  await setMedium(
    'Solid colors are saturated',
    'Transparent shows parent bg',
    'White + black render correctly',
    '',
    '[See large widget]', '', '', '',
  );
}

// MARK: Test 14b - Container colors (nested inheritance)

export async function runTest_14b(): Promise<void> {
  await updateMultiSizeWidget({
    widgetId: WIDGET_ID,
    small:  smallSchema,
    medium: mediumSchema,
    large:  makeLarge([
      txt('Transparent must show parent lightGray bg through it', { size: 9, color: C.gray }),
      rule(),
      sectionHeader('CONTAINER - nested color inheritance'),
      {
        type: 'container', layout: 'vstack', backgroundColor: C.blue, padding: 8,
        children: [
          {
            type: 'container', layout: 'hstack', backgroundColor: C.white,
            cornerRadius: 4, padding: 4,
            children: [txt('white card inside blue container', { size: 10, color: C.blue })],
          },
        ],
      },
    ]),
  });
  await setStatus(14, 'Container Colors (nested)', 'Nested card white on blue');
  await setMedium(
    'Nested card: white on blue',
    'Inner card has its own radius',
    '',
    '',
    '[See large widget]', '', '', '',
  );
}

// MARK: Test 15 - Hidden nodes

export async function runTest_15_showAll(): Promise<void> {
  await updateMultiSizeWidget({
    widgetId: WIDGET_ID,
    small:  smallSchema,
    medium: mediumSchema,
    large:  makeLarge([
      sectionHeader('HIDDEN - all three items visible'),
      swatch('A - always visible', C.green,  C.white),
      {
        type: 'container', layout: 'vstack',
        backgroundColor: C.blue as any,
        id: 'hidden_b',
        children: [txt('B - will be hidden in step 2', { size: 11, color: C.white })],
      },
      {
        type: 'container', layout: 'vstack',
        backgroundColor: C.red as any,
        id: 'hidden_c',
        children: [txt('C - will also be hidden in step 2', { size: 11, color: C.white })],
      },
      txt('Run runTest_15_hideBC() next to hide B + C', { size: 10, color: C.gray }),
    ]),
  });
  await setStatus(15, 'Hidden (all visible)', 'A + B + C all shown');
  await setMedium(
    'All three rows visible',
    'A = green, B = blue, C = red',
    'Next: hide B + C',
    '',
    '[See large widget]', '', '', '',
  );
}

export async function runTest_15_hideBC(): Promise<void> {
  await writeWidgetData(WIDGET_ID, {
    hidden_b: { hidden: true  },
    hidden_c: { hidden: true  },
    lg_tag:   { value: '#15 Hidden (B+C hidden)' },
  });
  await writeWidgetData(WIDGET_ID, {
    sm_name:   { value: 'Test 15' },
    sm_label:  { value: 'Hidden (B+C hidden)' },
    sm_status: { value: 'B and C hidden', color: C.orange as any },
  });
  await setMedium(
    'Only A (green) remains',
    'B and C removed from layout',
    'No gap or placeholder where B/C were',
    '',
    '[See large widget]', '', '', '',
  );
}

// MARK: Test 16 - Dynamic schema (named IDs)

export async function runTest_16_schema(): Promise<void> {
  await updateMultiSizeWidget({
    widgetId: WIDGET_ID,
    small:  smallSchema,
    medium: mediumSchema,
    large:  makeLarge([
      sectionHeader('DYNAMIC SCHEMA - named node IDs'),
      {
        type: 'container', layout: 'hstack', backgroundColor: 'transparent',
        spacing: 8,
        children: [
          {
            type: 'container', layout: 'vstack',
            backgroundColor: C.lightGray as any,
            width: 8, height: 8, id: 'dyn_dot',
            children: [],
          },
          {
            type: 'container', layout: 'vstack',
            backgroundColor: 'transparent',
            children: [
              txt('', { id: 'dyn_title', size: 14, weight: 'medium' }),
              txt('', { id: 'dyn_sub',   size: 11, color: C.gray    }),
            ],
          },
        ],
      },
      rule(),
      txt('', { id: 'dyn_note', size: 10, color: C.gray }),
      txt('Run runTest_17_override() to push live data here', { size: 10, color: C.gray }),
    ]),
  });
  await setStatus(16, 'Dynamic (schema)', 'Schema set, awaiting data push');
  await setMedium(
    'Schema sent with named IDs',
    'dyn_dot / dyn_title / dyn_sub',
    'Values are placeholders for now',
    'Run T17 to push live data',
    '[Awaiting data]', '', '', '',
  );
}

// MARK: Test 17 - Dynamic live-data override

export async function runTest_17_override(): Promise<void> {
  await writeWidgetData(WIDGET_ID, {
    dyn_dot:   { backgroundColor: C.blue  as any },
    dyn_title: { value: 'Team standup' },
    dyn_sub:   { value: '9:00 AM - Room 3B' },
    dyn_note:  { value: 'Data pushed via writeWidgetData(), schema unchanged' },
    lg_tag:    { value: '#17 Dynamic (live data)' },
    sm_name:   { value: 'Test 17' },
    sm_label:  { value: 'Dynamic (live data)' },
    sm_status: { value: 'Data pushed ✓', color: C.green as any },
  });
  await setMedium(
    'Title shows "Team standup"',
    'Sub shows "9:00 AM - Room 3B"',
    'Dot turned blue',
    'No schema re-send needed',
    'Title: Team standup',
    'Sub: 9:00 AM - Room 3B',
    'Dot: blue',
    '',
  );
}

// MARK: Test 18 - Image contentMode fit vs fill

export async function runTest_18(): Promise<void> {
  const imgCard = (label: string, mode: 'fit' | 'fill') => ({
    type:            'container' as const,
    layout:          'hstack'   as const,
    backgroundColor: C.lightGray as any,
    height:          60,
    cornerRadius:    8,
    children: [
      {
        type:        'image'    as const,
        src:         'shared://dot_blue.png',
        width:       60,
        height:      60,
        contentMode: mode,
      },
      {
        type:            'container' as const,
        layout:          'vstack'   as const,
        backgroundColor: 'transparent' as const,
        paddingStart:    8,
        children: [
          txt(`contentMode: '${mode}'`, { size: 12, weight: 'semibold' }),
          txt(
            mode === 'fit'
              ? 'Entire image visible, letterboxed'
              : 'Image fills box, may crop',
            { size: 10, color: C.gray }
          ),
        ],
      },
    ],
  });

  await updateMultiSizeWidget({
    widgetId: WIDGET_ID,
    small:  smallSchema,
    medium: mediumSchema,
    large:  makeLarge([
      sectionHeader('IMAGE contentMode - fit vs fill'),
      imgCard('fit',  'fit' ),
      imgCard('fill', 'fill'),
      rule(),
      txt("fit = whole image visible · fill = fills box, may crop", { size: 10, color: C.gray }),
    ]),
  });
  await setStatus(18, 'Image fit/fill', 'contentMode fit vs fill');
  await setMedium(
    "fit  = whole image, may letterbox",
    "fill = fills box, may crop edges",
    '',
    '',
    '[See large widget]', '', '', '',
  );
}

// MARK: Test 19 - Image opacity

export async function runTest_19(): Promise<void> {
  const imgRow = (op: number) => ({
    type:            'container' as const,
    layout:          'hstack'   as const,
    backgroundColor: 'transparent' as const,
    spacing:         8,
    children: [
      {
        type:        'image'  as const,
        src:         'shared://dot_blue.png',
        width:       28,
        height:      28,
        contentMode: 'fill' as const,
        opacity:     op,
      },
      txt(`opacity ${op.toFixed(2)}`, { size: 12, color: C.black }),
    ],
  });

  await updateMultiSizeWidget({
    widgetId: WIDGET_ID,
    small:  smallSchema,
    medium: mediumSchema,
    large:  makeLarge([
      sectionHeader('IMAGE OPACITY - 1.0 → 0.1 fade'),
      imgRow(1.0),
      imgRow(0.5),
      imgRow(0.25),
      imgRow(0.1),
    ]),
  });
  await setStatus(19, 'Image Opacity', '1.0 → 0.1 continuous fade');
  await setMedium(
    '1.0 = fully opaque image',
    '0.5 = clearly faded image',
    '0.1 = nearly invisible image',
    'Same fade curve as text opacity',
    '[See large widget]', '', '', '',
  );
}

// MARK: Test 20 - Nested real-world widget (calendar card)

export async function runTest_20(): Promise<void> {
  const event = (title: string, time: string, dotColor: string) => ({
    type:            'container' as const,
    layout:          'hstack'   as const,
    backgroundColor: 'transparent' as const,
    spacing:         8,
    children: [
      {
        type:            'container' as const,
        layout:          'vstack'   as const,
        backgroundColor: dotColor   as any,
        width:           4,
        height:          36,
        cornerRadius:    2,
        children:        [],
      },
      {
        type:            'container' as const,
        layout:          'vstack'   as const,
        backgroundColor: 'transparent' as const,
        spacing:         2,
        children: [
          txt(title, { size: 13, weight: 'medium' }),
          txt(time,  { size: 11, color: C.gray    }),
        ],
      },
    ],
  });

  await updateMultiSizeWidget({
    widgetId: WIDGET_ID,
    small:  smallSchema,
    medium: mediumSchema,
    large:  makeLarge([
      {
        type: 'container', layout: 'hstack',
        backgroundColor: 'transparent',
        children: [
          txt('TODAY', { size: 10, weight: 'semibold', color: C.gray }),
          { type: 'spacer' },
          txt('Thu 14 May', { size: 10, color: C.gray }),
        ],
      },
      rule(),
      event('Team standup',    '9:00 – 9:30 AM',   C.blue  ),
      event('Design review',   '11:00 – 12:00 PM', C.red   ),
      event('Sprint planning', '3:00 – 4:00 PM',   C.orange),
    ]),
  });
  await setStatus(20, 'Nested (real-world)', 'Calendar card pattern');
  await setMedium(
    'Date header with spacer',
    '3 event rows with coloured bar',
    'Each row: bar + title + time',
    '',
    '[See large widget]', '', '', '',
  );
}