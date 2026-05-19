import { registerTestWidget } from './TestCore';
import { runTest_1, runTest_1b, runTest_2, runTest_2b, runTest_3, runTest_3b, runTest_4, runTest_5, runTest_5b, runTest_6 } from './TestText';
import { runTest_7, runTest_8, runTest_8b, runTest_9, runTest_9b, runTest_10, runTest_11, runTest_12, runTest_13, runTest_13b } from './TestLayout';
import { runTest_14, runTest_14b, runTest_15_showAll, runTest_15_hideBC, runTest_16_schema, runTest_17_override, runTest_18, runTest_19, runTest_20 } from './TestData';
import { runTest_21, runTest_21b, runTest_22, runTest_23, runTest_24, runTest_25, runTest_25b, runAllTests } from './TestAdvanced';

export const WIDGET_TESTS = [
  { label: 'T01   Font Weights (light)',         fn: runTest_1            },
  { label: 'T01b  Font Weights (heavy)',          fn: runTest_1b           },
  { label: 'T02   Font Sizes (small 8–14pt)',    fn: runTest_2            },
  { label: 'T02b  Font Sizes (large 18–24pt)',   fn: runTest_2b           },
  { label: 'T03   Text Colors (warm)',            fn: runTest_3            },
  { label: 'T03b  Text Colors (cool)',            fn: runTest_3b           },
  { label: 'T04   Text Opacity',                 fn: runTest_4            },
  { label: 'T05   Text Alignment',               fn: runTest_5            },
  { label: 'T05b  Text Alignment (mixed sizes)', fn: runTest_5b           },
  { label: 'T06   Empty String',                 fn: runTest_6            },
  { label: 'T07   hstack basics',                fn: runTest_7            },
  { label: 'T08   hstack Spacers (expand+fixed)',fn: runTest_8            },
  { label: 'T08b  hstack spacing prop',          fn: runTest_8b           },
  { label: 'T09   vstack wrap-to-content',       fn: runTest_9            },
  { label: 'T09b  vstack spacing:8',             fn: runTest_9b           },
  { label: 'T10   Event Rows',                   fn: runTest_10           },
  { label: 'T11   zstack Alignment',             fn: runTest_11           },
  { label: 'T12   cornerRadius',                 fn: runTest_12           },
  { label: 'T13   Padding + spacing:0',          fn: runTest_13           },
  { label: 'T13b  spacing:16',                   fn: runTest_13b          },
  { label: 'T14   Container Colors',             fn: runTest_14           },
  { label: 'T14b  Container Colors (nested)',    fn: runTest_14b          },
  { label: 'T15   Hidden - show all',            fn: runTest_15_showAll   },
  { label: 'T15   Hidden - hide B+C',            fn: runTest_15_hideBC    },
  { label: 'T16   Dynamic schema',               fn: runTest_16_schema    },
  { label: 'T17   Dynamic live data',            fn: runTest_17_override  },
  { label: 'T18   Image fit/fill',               fn: runTest_18           },
  { label: 'T19   Image Opacity',                fn: runTest_19           },
  { label: 'T20   Nested real-world',            fn: runTest_20           },
  { label: 'T21   contentAlignment:center',      fn: runTest_21           },
  { label: 'T21b  No contentAlignment',          fn: runTest_21b          },
  { label: 'T22   zstack isBackground',          fn: runTest_22           },
  { label: 'T23   Image fillHeight',             fn: runTest_23           },
  { label: 'T24   Links',                        fn: runTest_24           },
  { label: 'T25   Fixed Spacers (4+20dp)',       fn: runTest_25           },
  { label: 'T25b  Fixed Spacers (40dp)',          fn: runTest_25b          },
];

export { registerTestWidget, runAllTests };