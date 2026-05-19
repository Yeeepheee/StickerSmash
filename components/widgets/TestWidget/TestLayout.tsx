/**
 * TestLayout.tsx  -  Tests 7 – 13
 *
 *  7       hstack basics
 *  8 / 8b  hstack spacers
 *  9 / 9b  vstack
 * 10       vstack event rows
 * 11       zstack 9-point alignment grid
 * 12       cornerRadius + uniform padding
 * 13/13b   Per-side padding / vstack spacing
 */

import {
  WIDGET_ID, C,
  txt, rule, sectionHeader, swatch,
  smallSchema, mediumSchema, makeLarge,
  setStatus, setMedium, updateMultiSizeWidget,
} from './TestCore';

// MARK: Test7 - hstack basics

export async function runTest_7(): Promise<void> {
  await updateMultiSizeWidget({
    widgetId: WIDGET_ID,
    small:  smallSchema,
    medium: mediumSchema,
    large:  makeLarge([
      sectionHeader('HSTACK - three items, no spacer'),
      {
        type:            'container',
        layout:          'hstack',
        backgroundColor: C.lightGray,
        children: [
          swatch('A', C.red,   C.white, 50, 32),
          swatch('B', C.blue,  C.white, 50, 32),
          swatch('C', C.green, C.white, 50, 32),
        ],
      },
      rule(),
      sectionHeader('HSTACK - vertical centering (items of different heights)'),
      {
        type:            'container',
        layout:          'hstack',
        backgroundColor: C.lightGray,
        children: [
          swatch('tall\n50dp', C.purple, C.white, 60, 50),
          swatch('mid\n30dp',  C.orange, C.white, 60, 30),
          swatch('sm\n16dp',   C.teal,   C.white, 60, 16),
        ],
      },
    ]),
  });
  await setStatus(7, 'hstack basics', 'Side-by-side + vertical center');
  await setMedium(
    'A B C appear left→right',
    'All items vertically centred',
    'Items fill their own width only',
    '',
    '[See large widget]', '', '', '',
  );
}

// MARK: Test8 - hstack expanding spacer + fixed-width spacer

export async function runTest_8(): Promise<void> {
  await updateMultiSizeWidget({
    widgetId: WIDGET_ID,
    small:  smallSchema,
    medium: mediumSchema,
    large:  makeLarge([
      sectionHeader('HSTACK - Spacer pushes B to far right'),
      {
        type:            'container',
        layout:          'hstack',
        backgroundColor: C.lightGray,
        children: [
          swatch('A', C.red,  C.white, 48, 32),
          { type: 'spacer' },
          swatch('B', C.blue, C.white, 48, 32),
        ],
      },
      rule(),
      sectionHeader('HSTACK - fixed-width spacer (width:24)'),
      {
        type:            'container',
        layout:          'hstack',
        backgroundColor: C.lightGray,
        children: [
          swatch('X', C.red,   C.white, 40, 28),
          { type: 'spacer', width: 24 },
          swatch('Y', C.green, C.white, 40, 28),
          { type: 'spacer', width: 24 },
          swatch('Z', C.blue,  C.white, 40, 28),
        ],
      },
    ]),
  });
  await setStatus(8, 'hstack Spacers', 'Expanding vs fixed-width spacer');
  await setMedium(
    'Spacer pushes B to far right edge',
    'Fixed width:24 = exact 24 dp gap',
    'X|24|Y|24|Z - NOT expanding',
    '',
    '[See large widget]', '', '', '',
  );
}

// MARK: Test 8b - hstack spacing prop

export async function runTest_8b(): Promise<void> {
  await updateMultiSizeWidget({
    widgetId: WIDGET_ID,
    small:  smallSchema,
    medium: mediumSchema,
    large:  makeLarge([
      txt('X|24dp|Y|24dp|Z - fixed gaps verified in T08', { size: 10, color: C.gray }),
      rule(),
      sectionHeader('HSTACK spacing:12 - gap from spacing prop'),
      {
        type:            'container',
        layout:          'hstack',
        backgroundColor: C.lightGray,
        spacing:         12,
        children: [
          swatch('P', C.purple, C.white, 40, 28),
          swatch('Q', C.orange, C.white, 40, 28),
          swatch('R', C.teal,   C.white, 40, 28),
        ],
      },
    ]),
  });
  await setStatus(8, 'hstack spacing prop', 'spacing:12 = uniform 12 dp gap');
  await setMedium(
    'spacing:12 = uniform 12 dp gap',
    'P Q R each separated by 12dp',
    '',
    '',
    '[See large widget]', '', '', '',
  );
}

// MARK: Test9 - vstack wrap-to-content

export async function runTest_9(): Promise<void> {
  await updateMultiSizeWidget({
    widgetId: WIDGET_ID,
    small:  smallSchema,
    medium: mediumSchema,
    large:  makeLarge([
      sectionHeader('VSTACK - with Spacer: rows wrap, spacer fills rest'),
      {
        type:            'container',
        layout:          'vstack',
        backgroundColor: C.lightGray,
        height:          120,
        children: [
          swatch('Row 1 (content height)', C.red  ),
          swatch('Row 2 (content height)', C.blue ),
          swatch('Row 3 (content height)', C.green),
          { type: 'spacer' },
        ],
      },
      txt('Rows must be compact. Spacer fills remaining 120dp space.', { size: 10, color: C.gray }),
    ]),
  });
  await setStatus(9, 'vstack wrap', 'Rows wrap to content, spacer expands');
  await setMedium(
    'Rows pack to top',
    'Spacer fills remaining height',
    'NOT: rows split height equally',
    '',
    '[See large widget]', '', '', '',
  );
}

// MARK: Test 9b - vstack spacing:8

export async function runTest_9b(): Promise<void> {
  await updateMultiSizeWidget({
    widgetId: WIDGET_ID,
    small:  smallSchema,
    medium: mediumSchema,
    large:  makeLarge([
      sectionHeader('VSTACK spacing:8 - gap between children'),
      {
        type:            'container',
        layout:          'vstack',
        backgroundColor: C.lightGray,
        spacing:         8,
        children: [
          swatch('A', C.purple),
          swatch('B', C.orange),
          swatch('C', C.teal  ),
        ],
      },
      txt('8dp visible gap must appear between A / B / C', { size: 10, color: C.gray }),
    ]),
  });
  await setStatus(9, 'vstack spacing:8', '8dp visible gap between rows');
  await setMedium(
    'spacing:8 = visible gap between rows',
    'A / B / C separated by 8dp',
    'NOT: rows touching or equal-split',
    '',
    '[See large widget]', '', '', '',
  );
}

// MARK: Test10 - vstack event rows
// 6 items with spacing:6 → 11 children. The 11th child is the expanding spacer
// which gets silently dropped. All 4 event rows remain visible. ✓

export async function runTest_10(): Promise<void> {
  const eventRow = (title: string, time: string, dot: string) => ({
    type:            'container' as const,
    layout:          'hstack'   as const,
    backgroundColor: 'transparent' as const,
    spacing:         6,
    children: [
      {
        type:            'container' as const,
        layout:          'vstack'   as const,
        backgroundColor: dot        as any,
        width:           8,
        height:          8,
        children:        [],
      },
      {
        type:            'container' as const,
        layout:          'vstack'   as const,
        backgroundColor: 'transparent' as const,
        children: [
          txt(title, { size: 14, weight: 'medium' }),
          txt(time,  { size: 12, color: C.gray    }),
        ],
      },
    ],
  });

  await updateMultiSizeWidget({
    widgetId: WIDGET_ID,
    small:  smallSchema,
    medium: mediumSchema,
    large:  makeLarge([
      sectionHeader('EVENT ROWS - title + time must NOT clip to dot height'),
      eventRow('Team standup',    '9:00 AM',  C.blue  ),
      eventRow('Design review',   '11:30 AM', C.red   ),
      eventRow('Lunch w/ Sarah',  '12:30 PM', C.green ),
      eventRow('Sprint planning', '3:00 PM',  C.orange),
      { type: 'spacer' },
    ]),
  });
  await setStatus(10, 'Event Rows', 'Title + time fully visible');
  await setMedium(
    'Each row shows title AND time',
    'Time is NOT clipped by 8dp dot',
    '4 events visible at top',
    '',
    '[See large widget]', '', '', '',
  );
}

// MARK: Test11 - zstack 9-point alignment grid

export async function runTest_11(): Promise<void> {
  const dot = (label: string, align: any, color: string) => ({
    type:            'container' as const,
    layout:          'vstack'   as const,
    backgroundColor: color      as any,
    width:           26,
    height:          16,
    alignment:       align,
    children:        [txt(label, { size: 8, color: C.white, align: 'center' })],
  });

  await updateMultiSizeWidget({
    widgetId: WIDGET_ID,
    small:  smallSchema,
    medium: mediumSchema,
    large:  makeLarge([
      sectionHeader('ZSTACK - 9-point alignment grid'),
      {
        type:            'container',
        layout:          'zstack',
        backgroundColor: C.lightGray,
        height:          110,
        children: [
          dot('TL', 'topLeading',     C.red    ),
          dot('TC', 'topCenter',      C.orange ),
          dot('TR', 'topTrailing',    C.yellow ),
          dot('CL', 'centerLeading',  C.green  ),
          dot('CC', 'center',         C.blue   ),
          dot('CR', 'centerTrailing', C.purple ),
          dot('BL', 'bottomLeading',  C.pink   ),
          dot('BC', 'bottomCenter',   C.teal   ),
          dot('BR', 'bottomTrailing', C.gray   ),
        ],
      },
      txt('TL=top-left  TC=top-center  TR=top-right', { size: 9, color: C.gray }),
      txt('CL=mid-left  CC=center      CR=mid-right', { size: 9, color: C.gray }),
      txt('BL=bot-left  BC=bot-center  BR=bot-right', { size: 9, color: C.gray }),
    ]),
  });
  await setStatus(11, 'zstack Alignment', '9-point overlay grid');
  await setMedium(
    'TL = top-left corner',
    'CC = exact centre',
    'BR = bottom-right corner',
    'No dot overlaps or misaligns',
    '[See large widget]', '', '', '',
  );
}

// MARK: Test12 - cornerRadius + uniform padding

export async function runTest_12(): Promise<void> {
  const card = (label: string, r: number, p: number, bg: string) => ({
    type:            'container' as const,
    layout:          'vstack'   as const,
    backgroundColor: bg         as any,
    cornerRadius:    r,
    padding:         p,
    children: [
      txt(`radius:${r}  padding:${p}`, { size: 11, color: C.white }),
      txt('text must not bleed outside rounded rect', { size: 9, color: C.white, opacity: 0.8 }),
    ],
  });

  await updateMultiSizeWidget({
    widgetId: WIDGET_ID,
    small:  smallSchema,
    medium: mediumSchema,
    large:  makeLarge([
      sectionHeader('CORNER RADIUS - 0 / 6 / 14 / 28'),
      card('No radius',  0,  8, C.red   ),
      card('radius:6',   6,  8, C.orange),
      card('radius:14', 14,  8, C.green ),
      card('radius:28', 28,  8, C.blue  ),
    ]),
  });
  await setStatus(12, 'cornerRadius', '0 / 6 / 14 / 28 pt radii');
  await setMedium(
    'radius:0 = sharp square corners',
    'radius:6 = slightly rounded',
    'radius:14 = clearly rounded',
    'radius:28 = pill / stadium shape',
    '[See large widget]', '', '', '',
  );
}

// MARK: Test13 - Per-side padding + spacing:0

export async function runTest_13(): Promise<void> {
  await updateMultiSizeWidget({
    widgetId: WIDGET_ID,
    small:  smallSchema,
    medium: mediumSchema,
    large:  makeLarge([
      sectionHeader('PER-SIDE PADDING - asymmetric insets'),
      {
        type:            'container',
        layout:          'vstack',
        backgroundColor: C.blue,
        paddingTop:      20,
        paddingBottom:   4,
        paddingStart:    40,
        paddingEnd:      4,
        cornerRadius:    8,
        children: [
          txt('paddingTop:20  paddingStart:40', { size: 11, color: C.white }),
          txt('paddingBottom:4  paddingEnd:4',  { size: 11, color: C.white }),
        ],
      },
      rule(),
      sectionHeader('VSTACK spacing:0 - items touch'),
      {
        type: 'container', layout: 'vstack',
        backgroundColor: C.lightGray, spacing: 0,
        children: [swatch('A', C.red, C.white), swatch('B', C.blue, C.white)],
      },
    ]),
  });
  await setStatus(13, 'Padding + spacing:0', 'Asymmetric padding, items touching');
  await setMedium(
    'Large top+start inset on blue box',
    'spacing:0 = items touch each other',
    '',
    '',
    '[See large widget]', '', '', '',
  );
}

// MARK: Test 13b - vstack spacing:16

export async function runTest_13b(): Promise<void> {
  await updateMultiSizeWidget({
    widgetId: WIDGET_ID,
    small:  smallSchema,
    medium: mediumSchema,
    large:  makeLarge([
      sectionHeader('VSTACK spacing:16 - large gap between items'),
      {
        type: 'container', layout: 'vstack',
        backgroundColor: C.lightGray, spacing: 16,
        children: [swatch('A', C.red, C.white), swatch('B', C.blue, C.white)],
      },
      txt('↑ spacing:16 - clear visible gap between A and B', { size: 9, color: C.gray }),
    ]),
  });
  await setStatus(13, 'spacing:16', 'Large gap between items');
  await setMedium(
    'spacing:16 = clear visible gap',
    'Compare with T13 spacing:0',
    '',
    '',
    '[See large widget]', '', '', '',
  );
}