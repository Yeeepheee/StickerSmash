/**
 * TestAdvanced.tsx  -  Tests 21 – 25  +  runAllTests()
 *
 * 21/21b  contentAlignment:center - with / without
 * 22      zstack isBackground
 * 23      Image fillHeight
 * 24      Links
 * 25/25b  Fixed-height spacers - small gaps / large gap
 */

import {
  WIDGET_ID, C,
  txt, rule, sectionHeader, swatch,
  smallSchema, mediumSchema, makeLarge,
  setStatus, setMedium, updateMultiSizeWidget, writeWidgetData,
} from './TestCore';

import { runTest_1, runTest_1b } from './TestText';
import { runTest_2, runTest_2b } from './TestText';
import { runTest_3, runTest_3b } from './TestText';
import { runTest_4 } from './TestText';
import { runTest_5, runTest_5b } from './TestText';
import { runTest_6 } from './TestText';
import { runTest_7, runTest_8, runTest_8b, runTest_9, runTest_9b, runTest_10, runTest_11, runTest_12, runTest_13, runTest_13b } from './TestLayout';
import {
  runTest_14, runTest_14b,
  runTest_15_showAll, runTest_15_hideBC,
  runTest_16_schema, runTest_17_override,
  runTest_18, runTest_19, runTest_20,
} from './TestData';

export { runTest_15_hideBC };

// MARK: Test21 - contentAlignment:center (WITH)

export async function runTest_21(): Promise<void> {
  await updateMultiSizeWidget({
    widgetId: WIDGET_ID,
    small:  smallSchema,
    medium: mediumSchema,
    large:  makeLarge([
      sectionHeader('contentAlignment:center - items vertically centred'),
      {
        type:             'container',
        layout:           'vstack',
        backgroundColor:  C.lightGray,
        height:           120,
        contentAlignment: 'center',
        children: [
          swatch('Item A', C.blue,   C.white),
          swatch('Item B', C.purple, C.white),
          swatch('Item C', C.teal,   C.white),
        ],
      },
      txt('Items must float in the vertical centre of the 120dp box', { size: 10, color: C.gray }),
    ]),
  });
  await setStatus(21, 'contentAlignment:center', 'Items vertically centred in box');
  await setMedium(
    'Items float in vertical centre',
    'NOT pushed to top',
    'Android: bookend Spacers',
    'iOS: VStack wraps content',
    '[See large widget]', '', '', '',
  );
}

// MARK: Test 21b - contentAlignment (WITHOUT, for contrast)

export async function runTest_21b(): Promise<void> {
  await updateMultiSizeWidget({
    widgetId: WIDGET_ID,
    small:  smallSchema,
    medium: mediumSchema,
    large:  makeLarge([
      sectionHeader('WITHOUT contentAlignment - items push to top'),
      {
        type:            'container',
        layout:          'vstack',
        backgroundColor: C.lightGray,
        height:          80,
        children: [
          swatch('Item A', C.blue,   C.white),
          swatch('Item B', C.purple, C.white),
        ],
      },
      txt('Items must be at the TOP of the 80dp box (compare T21)', { size: 10, color: C.gray }),
    ]),
  });
  await setStatus(21, 'No contentAlignment', 'Items push to top of box');
  await setMedium(
    'Items sit at top of 80dp box',
    'No centre alignment applied',
    'Compare with T21 (centred)',
    '',
    '[See large widget]', '', '', '',
  );
}

// MARK: Test22 - zstack isBackground

export async function runTest_22(): Promise<void> {
  await updateMultiSizeWidget({
    widgetId: WIDGET_ID,
    small:  smallSchema,
    medium: mediumSchema,
    large:  makeLarge([
      sectionHeader('ZSTACK isBackground - bg fills edge-to-edge'),
      {
        type:            'container',
        layout:          'zstack',
        backgroundColor: 'transparent',
        height:          100,
        children: [
          {
            type:            'container',
            layout:          'vstack',
            backgroundColor: C.blue,
            isBackground:    true,
            children:        [],
          },
          {
            type:            'container',
            layout:          'vstack',
            backgroundColor: 'transparent',
            alignment:       'center',
            children: [
              txt('Foreground text', { size: 14, weight: 'bold',    color: C.white, align: 'center' }),
              txt('over blue bg',    { size: 12, weight: 'regular', color: C.white, align: 'center', opacity: 0.8 }),
            ],
          },
        ],
      },
      rule(),
      sectionHeader('ZSTACK - teal bg + orange badge'),
      {
        type:            'container',
        layout:          'zstack',
        backgroundColor: 'transparent',
        height:          80,
        children: [
          {
            type:            'container',
            layout:          'vstack',
            backgroundColor: C.teal,
            isBackground:    true,
            children:        [],
          },
          {
            type:            'container',
            layout:          'vstack',
            backgroundColor: C.orange,
            width:           40,
            height:          20,
            alignment:       'topTrailing',
            cornerRadius:    10,
            children: [txt('NEW', { size: 9, weight: 'bold', color: C.white, align: 'center' })],
          },
          txt('Main content area', { size: 13, color: C.white, align: 'center' }),
        ],
      },
    ]),
  });
  await setStatus(22, 'zstack isBackground', 'BG fills edge-to-edge');
  await setMedium(
    'Blue bg fills 100dp box fully',
    'Text centred over background',
    'Orange badge at top-right',
    'Teal bg fills lower box',
    '[See large widget]', '', '', '',
  );
}

// MARK: Test23 - Image fillHeight

export async function runTest_23(): Promise<void> {
  const card = (usesFillHeight: boolean) => ({
    type:            'container' as const,
    layout:          'hstack'   as const,
    backgroundColor: C.lightGray as any,
    height:          70,
    cornerRadius:    10,
    children: [
      {
        type:        'image'    as const,
        src:         'shared://dot_blue.png',
        width:       60,
        fillHeight:  usesFillHeight,
        ...(usesFillHeight ? {} : { height: 40 }),
        contentMode: 'fill' as const,
      },
      {
        type:            'container' as const,
        layout:          'vstack'   as const,
        backgroundColor: 'transparent' as const,
        paddingStart:    8,
        children: [
          txt(
            usesFillHeight ? 'fillHeight: true' : 'fillHeight: false (h:40)',
            { size: 12, weight: 'semibold' }
          ),
          txt(
            usesFillHeight
              ? 'Image fills the card height (70dp)'
              : 'Image is 40dp tall - gaps above/below',
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
      sectionHeader('IMAGE fillHeight - true vs false'),
      card(true ),
      card(false),
      rule(),
      txt('true = fills 70dp card · false = 40dp with gaps · both clipped by radius:10', { size: 10, color: C.gray }),
    ]),
  });
  await setStatus(23, 'Image fillHeight', 'Image scales to card height');
  await setMedium(
    'fillHeight:true → fills 70dp card',
    'fillHeight:false → 40dp, gaps show',
    'Both clipped by cornerRadius:10',
    '',
    '[See large widget]', '', '', '',
  );
}

// MARK: Test24 - Links

export async function runTest_24(): Promise<void> {
  await updateMultiSizeWidget({
    widgetId: WIDGET_ID,
    small:  smallSchema,
    medium: mediumSchema,
    large:  makeLarge([
      sectionHeader('LINKS - tap each item to verify'),
      {
        type:            'container',
        layout:          'vstack',
        backgroundColor: C.blue,
        cornerRadius:    8,
        padding:         10,
        link:            'https://example.com',
        children: [
          txt('Container link', { size: 14, weight: 'semibold', color: C.white }),
          txt('Tap → opens example.com', { size: 11, color: C.white, opacity: 0.8 }),
        ],
      },
      {
        type:      'text',
        value:     'Text node link → google.com',
        fontSize:  14,
        color:     C.blue,
        link:      'https://google.com',
      },
      rule(),
      txt('Both items must be tappable. Android: ACTION_VIEW · iOS: openURL', { size: 10, color: C.gray }),
    ]),
  });
  await setStatus(24, 'Links', 'Tap to open URL');
  await setMedium(
    'Container tap → example.com',
    'Text tap → google.com',
    'Both must fire on tap',
    '',
    '[Tap blue box]', '[Tap blue text]', '', '',
  );
}

// MARK: Test25 - Fixed-height spacers (4dp and 20dp)

export async function runTest_25(): Promise<void> {
  await updateMultiSizeWidget({
    widgetId: WIDGET_ID,
    small:  smallSchema,
    medium: mediumSchema,
    large:  makeLarge([
      sectionHeader('FIXED SPACERS - height:N must NOT expand'),
      swatch('before 4dp gap',  C.blue,  C.white),
      { type: 'spacer', height: 4  },
      swatch('4dp gap above',   C.teal,  C.white),
      { type: 'spacer', height: 20 },
    ]),
  });
  await setStatus(25, 'Fixed Spacers (4 + 20dp)', 'height:N = exact gap, not expanding');
  await setMedium(
    'height:4 = tiny gap (visible)',
    'height:20 = medium gap below',
    'Gaps must NOT expand to fill widget',
    '',
    '[See large widget]', '', '', '',
  );
}

// MARK: Test 25b - Fixed-height spacers (40dp)

export async function runTest_25b(): Promise<void> {
  await updateMultiSizeWidget({
    widgetId: WIDGET_ID,
    small:  smallSchema,
    medium: mediumSchema,
    large:  makeLarge([
      sectionHeader('FIXED SPACERS - height:40'),
      swatch('before 40dp gap',  C.green,  C.white),
      { type: 'spacer', height: 40 },
      swatch('40dp gap above',   C.orange, C.white),
    ]),
  });
  await setStatus(25, 'Fixed Spacers (40dp)', 'height:40 = large exact gap');
  await setMedium(
    'height:40 = large visible gap',
    'Gap must NOT expand to fill widget',
    'Compare T25: 4dp and 20dp gaps',
    '',
    '[See large widget]', '', '', '',
  );
}

// MARK: runAllTests

export async function runAllTests(delayMs = 3000): Promise<void> {
  const delay = (ms: number) => new Promise(r => setTimeout(r, ms));

  const steps: Array<{ label: string; fn: () => Promise<void> }> = [
    { label: 'T01  Font Weights (light)',        fn: runTest_1            },
    { label: 'T01b Font Weights (heavy)',         fn: runTest_1b           },
    { label: 'T02  Font Sizes (small)',           fn: runTest_2            },
    { label: 'T02b Font Sizes (large)',           fn: runTest_2b           },
    { label: 'T03  Text Colors (warm)',           fn: runTest_3            },
    { label: 'T03b Text Colors (cool)',           fn: runTest_3b           },
    { label: 'T04  Text Opacity',                fn: runTest_4            },
    { label: 'T05  Text Alignment',              fn: runTest_5            },
    { label: 'T05b Text Alignment (mixed sizes)',fn: runTest_5b           },
    { label: 'T06  Empty String',                fn: runTest_6            },
    { label: 'T07  hstack basics',               fn: runTest_7            },
    { label: 'T08  hstack Spacers',              fn: runTest_8            },
    { label: 'T08b hstack spacing prop',         fn: runTest_8b           },
    { label: 'T09  vstack wrap',                 fn: runTest_9            },
    { label: 'T09b vstack spacing:8',            fn: runTest_9b           },
    { label: 'T10  Event Rows',                  fn: runTest_10           },
    { label: 'T11  zstack Alignment',            fn: runTest_11           },
    { label: 'T12  cornerRadius',                fn: runTest_12           },
    { label: 'T13  Padding + spacing:0',         fn: runTest_13           },
    { label: 'T13b spacing:16',                  fn: runTest_13b          },
    { label: 'T14  Container Colors',            fn: runTest_14           },
    { label: 'T14b Container Colors (nested)',   fn: runTest_14b          },
    { label: 'T15  Hidden (all visible)',        fn: runTest_15_showAll   },
    { label: 'T15  Hidden (B+C hidden)',         fn: runTest_15_hideBC    },
    { label: 'T16  Dynamic (schema)',            fn: runTest_16_schema    },
    { label: 'T17  Dynamic (live data)',         fn: runTest_17_override  },
    { label: 'T18  Image fit/fill',              fn: runTest_18           },
    { label: 'T19  Image Opacity',               fn: runTest_19           },
    { label: 'T20  Nested (real-world)',         fn: runTest_20           },
    { label: 'T21  contentAlignment:center',    fn: runTest_21           },
    { label: 'T21b No contentAlignment',         fn: runTest_21b          },
    { label: 'T22  zstack isBackground',         fn: runTest_22           },
    { label: 'T23  Image fillHeight',            fn: runTest_23           },
    { label: 'T24  Links',                       fn: runTest_24           },
    { label: 'T25  Fixed Spacers (4+20dp)',      fn: runTest_25           },
    { label: 'T25b Fixed Spacers (40dp)',         fn: runTest_25b          },
  ];

  console.log(`[WidgetTest] Running ${steps.length} tests with ${delayMs}ms delay`);

  for (let i = 0; i < steps.length; i++) {
    const { label, fn } = steps[i];
    console.log(`[WidgetTest] ${i + 1}/${steps.length} - ${label}`);
    try {
      await fn();
    } catch (e) {
      console.error(`[WidgetTest] FAILED: ${label}`, e);
    }
    if (i < steps.length - 1) await delay(delayMs);
  }

  console.log('[WidgetTest] All tests complete.');
}