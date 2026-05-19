/**
 * CalendarWidget.tsx
 *
 * Apple Calendar style widget with 3 sizes:
 *
 * Small  - Weekday and day number, with today's event at the bottom
 * Medium - Date block on left + today's events on right
 * Large  - Mini month grid on top left + events list on right
 */

import * as Calendar from 'expo-calendar';
import {
  updateMultiSizeWidget,
  writeWidgetData,
  type WidgetDataMap,
  type WidgetConfig,
} from '@/modules/widget-builder';

const WIDGET_ID         = 'slot2';
const FETCH_MAX_EVENTS  = 6;
const MAX_EVENTS_MEDIUM = 4;
const MAX_EVENTS_LARGE  = 6;

const TODAY_COLOR    = '#FF3B30';
const MUTED_COLOR    = '#C7C7CC';
const DEFAULT_COLOR  = '#000000';
const WEEKEND_COLOR  = '#FF3B30';
const WEEKDAY_COLOR  = '#8E8E93';

const CALENDAR_COLORS: Record<string, string> = {
  default:  '#007AFF',
  work:     '#FF3B30',
  personal: '#34C759',
  family:   '#FF9500',
  health:   '#AF52DE',
};

const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

// MARK: SMALL

const smallSchema: WidgetConfig = {
  layout:          'vstack',
  backgroundColor: '#FFFFFF',
  children: [
    {
      type:          'text',
      id:            'sm_weekday',
      value:         '',
      fontSize:      16,
      fontWeight:    'semibold',
      color:         TODAY_COLOR,
      textAlignment: 'leading',
    },
    {
      type:          'text',
      id:            'sm_day',
      value:         '',
      fontSize:      48,
      color:         DEFAULT_COLOR,
      textAlignment: 'leading',
    },
    { type: 'spacer' },
    {
      type:          'text',
      id:            'sm_event_title',
      value:         '',
      fontSize:      13,
      fontWeight:    'medium',
      color:         DEFAULT_COLOR,
      textAlignment: 'leading',
    },
    {
      type:          'text',
      id:            'sm_event_time',
      value:         '',
      fontSize:      11,
      color:         WEEKDAY_COLOR,
      textAlignment: 'leading',
    },
  ],
};

// MARK: MEDIUM

function makeEventRow(i: number, prefix: string, titleSize: number, timeSize: number) {
  return {
    type:            'container' as const,
    layout:          'hstack'   as const,
    backgroundColor: 'transparent' as const,
    id:              `${prefix}_row_${i}`,
    children: [
      {
        type:         'image' as const,
        id:           `${prefix}_dot_${i}`,
        src:          'shared://dot_blue.png',
        width:        8,
        height:       8,
        contentMode:  'fit'    as const,
        alignment:    'center' as const,
        isBackground: false,
      },
      {
        type:            'container' as const,
        layout:          'vstack'   as const,
        backgroundColor: 'transparent' as const,
        children: [
          {
            type:          'text' as const,
            id:            `${prefix}_title_${i}`,
            value:         '',
            fontSize:      titleSize,
            color:         DEFAULT_COLOR as const,
            textAlignment: 'leading' as const,
          },
          {
            type:          'text' as const,
            id:            `${prefix}_time_${i}`,
            value:         '',
            fontSize:      timeSize,
            color:         WEEKDAY_COLOR as const,
            textAlignment: 'leading' as const,
          },
        ],
      },
    ],
  };
}

const mediumSchema: WidgetConfig = {
  layout:          'hstack',
  backgroundColor: '#FFFFFF',
  children: [
    {
      type:            'container',
      layout:          'vstack',
      backgroundColor: 'transparent',
      children: [
        {
          type:          'text',
          id:            'med_month',
          value:         '',
          fontSize:      13,
          color:         TODAY_COLOR,
          textAlignment: 'center',
        },
        {
          type:          'text',
          id:            'med_day',
          value:         '',
          fontSize:      48,
          color:         DEFAULT_COLOR,
          textAlignment: 'center',
        },
        { type: 'spacer' },
        {
          type:          'text',
          id:            'med_weekday',
          value:         '',
          fontSize:      11,
          color:         WEEKDAY_COLOR,
          textAlignment: 'center',
        },
      ],
    },
    {
      type:            'container',
      layout:          'vstack',
      backgroundColor: 'transparent',
      children: [
        makeEventRow(0, 'med', 13, 11),
        makeEventRow(1, 'med', 13, 11),
        makeEventRow(2, 'med', 13, 11),
        makeEventRow(3, 'med', 13, 11),
      ],
    },
  ],
};

// MARK: LARGE
// Left: Mini Month Grid | Right: Events

function makeDayCell(index: number) {
  return {
    type:            'container' as const,
    layout:          'vstack'   as const,
    backgroundColor: 'transparent' as const,
    id:              `cal_cell_${index}`,
    children: [
      {
        type:          'text' as const,
        id:            `cal_day_${index}`,
        value:         '',
        fontSize:      10, 
        color:         DEFAULT_COLOR as const,
        textAlignment: 'center' as const,
      },
    ],
  };
}

function makeWeekRow(week: number) {
  return {
    type:            'container' as const,
    layout:          'hstack'   as const,
    backgroundColor: 'transparent' as const,
    children: [0, 1, 2, 3, 4, 5, 6].map(col => makeDayCell(week * 7 + col)),
  };
}

const largeSchema: WidgetConfig = {
  layout:          'hstack',
  backgroundColor: '#FFFFFF',
  children: [
    {
      type:            'container',
      layout:          'vstack',
      backgroundColor: 'transparent',
      alignment:       'topLeading',
      children: [
        {
          type:          'text',
          id:            'cal_header',
          value:         '',
          fontSize:      12,
          fontWeight:    'semibold',
          color:         DEFAULT_COLOR,
          textAlignment: 'center',
        },
        {
          type:            'container',
          layout:          'hstack',
          backgroundColor: 'transparent',
          children: DAY_LABELS.map((label, i) => ({
            type:            'container' as const,
            layout:          'vstack'   as const,
            backgroundColor: 'transparent' as const,
            children: [
              {
                type:          'text'    as const,
                value:         label,
                fontSize:      9,
                color:         (i === 0 || i === 6) ? WEEKEND_COLOR : WEEKDAY_COLOR,
                textAlignment: 'center' as const,
              },
            ],
          })),
        },
        makeWeekRow(0),
        makeWeekRow(1),
        makeWeekRow(2),
        makeWeekRow(3),
        makeWeekRow(4),
        makeWeekRow(5),
        { type: 'spacer' },
      ],
    },
    {
      type:            'container',
      layout:          'vstack',
      backgroundColor: 'transparent',
      alignment:       'topLeading',
      children: [
        {
          type:          'text',
          value:         'Today',
          fontSize:      18,
          fontWeight:    'bold',
          color:         TODAY_COLOR,
          textAlignment: 'leading',
        },
        makeEventRow(0, 'lg', 14, 12),
        makeEventRow(1, 'lg', 14, 12),
        makeEventRow(2, 'lg', 14, 12),
        makeEventRow(3, 'lg', 14, 12),
        makeEventRow(4, 'lg', 14, 12),
        makeEventRow(5, 'lg', 14, 12),
        { type: 'spacer' },
      ],
    },
  ],
};

// MARK: Register

export async function registerCalendarWidget(): Promise<void> {
  await updateMultiSizeWidget({
    widgetId: WIDGET_ID,
    small:    smallSchema,
    medium:   mediumSchema,
    large:    largeSchema,
  });
}

// MARK: Refresh

export async function refreshCalendarWidget(): Promise<void> {
  const { status } = await Calendar.requestCalendarPermissionsAsync();
  if (status !== 'granted') {
    console.log("Calendar permission denied!");
    await writeWidgetData(WIDGET_ID, buildNoPermissionData());
    return;
  }

  const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);

  const [todayEvents, monthEventDays] = await Promise.all([
    fetchTodayEvents(calendars),
    fetchMonthEventDays(calendars),
  ]);

  await writeWidgetData(WIDGET_ID, buildWidgetData(todayEvents, monthEventDays));
}

// MARK: Fetching

interface CalEvent {
  title:     string;
  startDate: Date;
  allDay:    boolean;
  color?:    string;
}

async function fetchTodayEvents(calendars: Calendar.Calendar[]): Promise<CalEvent[]> {
  if (!calendars || calendars.length === 0) {
    console.log("No calendars found.");
    return [];
  }

  console.log("Calendars found:", calendars.map(c => c.title));

  const start = new Date(); start.setHours(0, 0, 0, 0);
  const end   = new Date(); end.setHours(23, 59, 59, 999);

  const raw = await Calendar.getEventsAsync(calendars.map(c => c.id), start, end);
  
  return raw
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
    .slice(0, FETCH_MAX_EVENTS)
    .map(e => ({
      title:     e.title || 'Untitled',
      startDate: new Date(e.startDate),
      allDay:    e.allDay ?? false,
      color:     e.color  ?? CALENDAR_COLORS.default,
    }));
}

async function fetchMonthEventDays(calendars: Calendar.Calendar[]): Promise<Set<number>> {
  console.log("Full Calendar List:", JSON.stringify(calendars, null, 2));

  if (!calendars || calendars.length === 0) {
    return new Set();
  }

  const now   = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end   = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  const raw = await Calendar.getEventsAsync(calendars.map(c => c.id), start, end);
  const days = new Set<number>();
  raw.forEach(e => days.add(new Date(e.startDate).getDate()));
  return days;
}

// MARK: Data Building

function buildWidgetData(todayEvents: CalEvent[], monthEventDays: Set<number>): WidgetDataMap {
  const now        = new Date();
  const today      = now.getDate();
  const monthShort = now.toLocaleString('en-US', { month: 'short' }).toUpperCase();
  const monthLong  = now.toLocaleString('en-US', { month: 'long' });
  const weekday    = now.toLocaleString('en-US', { weekday: 'long' });
  const year       = now.getFullYear();

  const data: WidgetDataMap = {};

  // Small
  data['sm_weekday'] = { value: weekday };
  data['sm_day']     = { value: String(today) };

  if (todayEvents.length > 0) {
    const firstEvent = todayEvents[0];
    data['sm_event_title'] = { value: firstEvent.title, hidden: false };
    data['sm_event_time']  = { 
      value: firstEvent.allDay ? 'All day' : formatTime(firstEvent.startDate), 
      hidden: false 
    };
  } else {
    data['sm_event_title'] = { value: 'No events today', hidden: false, color: WEEKDAY_COLOR };
    data['sm_event_time']  = { hidden: true };
  }

  // Medium header
  data['med_month']   = { value: monthShort };
  data['med_day']     = { value: String(today) };
  data['med_weekday'] = { value: weekday };

  // Medium events
  for (let i = 0; i < MAX_EVENTS_MEDIUM; i++) {
    const event = todayEvents[i];
    if (!event) {
      data[`med_row_${i}`]   = { hidden: true };
      continue;
    }
    data[`med_row_${i}`]   = { hidden: false };
    data[`med_title_${i}`] = { value: event.title };
    data[`med_time_${i}`]  = { value:  event.allDay ? 'All day' : formatTime(event.startDate) };
    data[`med_dot_${i}`]   = { src: dotImageForColor(event.color) };
  }
  if (todayEvents.length === 0) {
    data['med_row_0']   = { hidden: false };
    data['med_title_0'] = { value: 'No events today', color: WEEKDAY_COLOR };
    data['med_time_0']  = { hidden: true };
    data['med_dot_0']   = { hidden: true };
  }

  // Large events
  for (let i = 0; i < MAX_EVENTS_LARGE; i++) {
    const event = todayEvents[i];
    if (!event) {
      data[`lg_row_${i}`]   = { hidden: true };
      continue;
    }
    data[`lg_row_${i}`]   = { hidden: false };
    data[`lg_title_${i}`] = { value: event.title };
    data[`lg_time_${i}`]  = { value: event.allDay ? 'All day' : formatTime(event.startDate) };
    data[`lg_dot_${i}`]   = { src: dotImageForColor(event.color) };
  }
  if (todayEvents.length === 0) {
    data['lg_row_0']   = { hidden: false };
    data['lg_title_0'] = { value: 'No events today', color: WEEKDAY_COLOR };
    data['lg_time_0']  = { hidden: true };
    data['lg_dot_0']   = { hidden: true };
  }

  // Large Grid (Mini Calendar)
  data['cal_header'] = { value: `${monthLong} ${year}` };

  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getDay();
  const daysInMonth     = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();

  for (let cell = 0; cell < 42; cell++) {
    const dayNum = cell - firstDayOfMonth + 1;
    const textId = `cal_day_${cell}`;
    const cellId = `cal_cell_${cell}`;

    if (dayNum < 1 || dayNum > daysInMonth) {
      data[textId] = { value: '', color: 'transparent' };
      data[cellId] = { backgroundColor: 'transparent' };
    } else if (dayNum === today) {
      data[textId] = { value: String(dayNum), color: '#FFFFFF' };
      data[cellId] = { backgroundColor: TODAY_COLOR };
    } else if (monthEventDays.has(dayNum)) {
      data[textId] = { value: String(dayNum), color: DEFAULT_COLOR };
      data[cellId] = { backgroundColor: 'transparent' };
    } else {
      data[textId] = { value: String(dayNum), color: MUTED_COLOR };
      data[cellId] = { backgroundColor: 'transparent' };
    }
  }

  return data;
}

function buildNoPermissionData(): WidgetDataMap {
  const now        = new Date();
  const today      = now.getDate();
  const monthShort = now.toLocaleString('en-US', { month: 'short' }).toUpperCase();
  const monthLong  = now.toLocaleString('en-US', { month: 'long' });
  const weekday    = now.toLocaleString('en-US', { weekday: 'long' });

  return {
    // Small
    'sm_weekday':     { value: weekday },
    'sm_day':         { value: String(today) },
    'sm_event_title': { value: 'Calendar access needed', color: WEEKDAY_COLOR },
    'sm_event_time':  { hidden: true },

    // Medium
    'med_month':   { value: monthShort },
    'med_day':     { value: String(today) },
    'med_weekday': { value: weekday },
    'med_row_0':   { hidden: false },
    'med_title_0': { value: 'Calendar access needed', color: WEEKDAY_COLOR },
    'med_time_0':  { hidden: true },
    'med_dot_0':   { hidden: true },
    'med_row_1':   { hidden: true },
    'med_row_2':   { hidden: true },
    'med_row_3':   { hidden: true },

    // Large
    'lg_row_0':   { hidden: false },
    'lg_title_0': { value: 'Calendar access needed', color: WEEKDAY_COLOR },
    'lg_time_0':  { hidden: true },
    'lg_dot_0':   { hidden: true },
    'lg_row_1':   { hidden: true },
    'lg_row_2':   { hidden: true },
    'lg_row_3':   { hidden: true },
    'lg_row_4':   { hidden: true },
    'lg_row_5':   { hidden: true },
    'cal_header': { value: `${monthLong} ${now.getFullYear()}` },
  };
}

// MARK: Helpers

function formatTime(date: Date): string {
  return date.toLocaleString('en-US', {
    hour:   'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

function dotImageForColor(color?: string): string {
  const map: Record<string, string> = {
    '#007AFF': 'shared://dot_blue.png',
    '#FF3B30': 'shared://dot_red.png',
    '#34C759': 'shared://dot_green.png',
    '#FF9500': 'shared://dot_orange.png',
    '#AF52DE': 'shared://dot_purple.png',
  };
  return map[color ?? ''] ?? 'shared://dot_blue.png';
}